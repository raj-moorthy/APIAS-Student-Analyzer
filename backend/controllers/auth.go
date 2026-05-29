package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/thekripaverse/student-analyzer-backend/auth"
	"github.com/thekripaverse/student-analyzer-backend/config"
	"github.com/thekripaverse/student-analyzer-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// getMongoURI loads the config and returns the Mongo URI.
// config.LoadConfig() uses sync.Once so this is safe to call on every request.
func getMongoURI() string {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Printf("[config] error: %v", err)
		return ""
	}
	return cfg.MongoURI
}

// RegisterUser handles user registration
func RegisterUser(w http.ResponseWriter, r *http.Request) {
	// Use the singleton client — no per-request connect/disconnect
	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		log.Printf("[RegisterUser] DB error: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	usersColl := models.GetCollection(client, "users")

	var input struct {
		Username  string `json:"username"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Role      string `json:"role"`
		Semester  int    `json:"semester"`
		Major     string `json:"major"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Username == "" || input.Email == "" || input.Password == "" ||
		input.FirstName == "" || input.LastName == "" || input.Role == "" ||
		input.Semester == 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Check duplicate username / email
	var existingUser models.User
	err = usersColl.FindOne(context.Background(), bson.M{"$or": []bson.M{
		{"username": input.Username},
		{"email": input.Email},
	}}).Decode(&existingUser)
	if err == nil {
		http.Error(w, "User with this username or email already exists", http.StatusConflict)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error processing password", http.StatusInternalServerError)
		return
	}

	user := models.User{
		ID:               primitive.NewObjectID(),
		Username:         input.Username,
		Email:            input.Email,
		Password:         string(hashedPassword),
		FirstName:        input.FirstName,
		LastName:         input.LastName,
		Role:             input.Role,
		Semester:         input.Semester,
		Major:            input.Major,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
		IsActive:         true,
		IsEmailVerified:  true,
		Preferences: models.Preferences{
			Theme:          "light",
			Notifications:  true,
			EmailUpdates:   true,
			StudyReminders: true,
			DefaultView:    "dashboard",
			Language:       "en",
			TimeZone:       "UTC",
		},
	}

	if _, err = usersColl.InsertOne(context.Background(), user); err != nil {
		log.Printf("[RegisterUser] InsertOne error: %v", err)
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Email was already verified inline during registration form — issue JWT immediately
	tokenString, err := auth.GenerateToken(&user)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	log.Printf("[RegisterUser] new user: %s (%s)", user.Username, user.Email)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": map[string]interface{}{
			"id":             user.ID.Hex(),
			"username":       user.Username,
			"email":          user.Email,
			"firstName":      user.FirstName,
			"lastName":       user.LastName,
			"role":           user.Role,
			"semester":       user.Semester,
			"major":          user.Major,
			"createdAt":      user.CreatedAt,
			"isActive":       user.IsActive,
			"isEmailVerified": true,
			"preferences":    user.Preferences,
		},
		"token": tokenString,
	})
}

// LoginUser handles user login
func LoginUser(w http.ResponseWriter, r *http.Request) {
	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		log.Printf("[LoginUser] DB error: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	usersColl := models.GetCollection(client, "users")

	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Email == "" || input.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	var user models.User
	if err = usersColl.FindOne(context.Background(), bson.M{"email": input.Email}).Decode(&user); err != nil {
		log.Printf("[LoginUser] user not found: %s", input.Email)
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Auto-fix stuck accounts (from before the IsEmailVerified bug was fixed)
	if !user.IsEmailVerified {
		user.IsEmailVerified = true
		usersColl.UpdateOne(context.Background(), bson.M{"email": user.Email}, bson.M{"$set": bson.M{"is_email_verified": true}})
	}

	now := time.Now()
	usersColl.UpdateOne(context.Background(),
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{"last_login": now, "updated_at": now}},
	)

	tokenString, err := auth.GenerateToken(&user)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	log.Printf("[LoginUser] success: %s", user.Email)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": map[string]interface{}{
			"id":          user.ID.Hex(),
			"username":    user.Username,
			"email":       user.Email,
			"firstName":   user.FirstName,
			"lastName":    user.LastName,
			"role":        user.Role,
			"semester":    user.Semester,
			"major":       user.Major,
			"createdAt":   user.CreatedAt,
			"lastLogin":   now,
			"isActive":    user.IsActive,
			"preferences": user.Preferences,
		},
		"token": tokenString,
	})
}

// LogoutUser handles logout — JWT is stateless, so the client just drops the token.
func LogoutUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

// ForgotPassword — POST /api/auth/forgot-password
// Generates a 6-digit OTP, stores it in MongoDB with 15-min expiry, and emails it.
func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Verify the user exists
	usersColl := models.GetCollection(client, "users")
	var user models.User
	if err = usersColl.FindOne(context.Background(), bson.M{"email": body.Email}).Decode(&user); err != nil {
		// Return 200 even if user doesn't exist to avoid email enumeration
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "If the email exists, a reset code has been sent."})
		return
	}

	// Generate 6-digit OTP
	otp := fmt.Sprintf("%06d", rand.Intn(1000000))
	expiry := time.Now().Add(15 * time.Minute)

	// Upsert OTP record
	resetColl := models.GetCollection(client, "password_resets")
	resetColl.DeleteMany(context.Background(), bson.M{"email": body.Email})
	resetColl.InsertOne(context.Background(), bson.M{
		"email":      body.Email,
		"otp":        otp,
		"expires_at": expiry,
		"created_at": time.Now(),
	})

	// Send email via existing SMTP helper
	htmlBody := fmt.Sprintf(`
<p>Hi <strong>%s</strong> 👋</p>
<p>You requested a password reset for your APAIS account.</p>
<div style="text-align:center;margin:32px 0;">
  <div style="display:inline-block;background:linear-gradient(135deg,#4361ee,#7c3aed);border-radius:16px;padding:24px 48px;">
    <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#fff;">%s</span>
  </div>
  <p style="color:#94a3b8;margin-top:12px;font-size:13px;">This code expires in <strong>15 minutes</strong>.</p>
</div>
<p style="color:#64748b;font-size:13px;">If you did not request a password reset, please ignore this email. Your account is secure.</p>`,
		user.FirstName, otp)

	subject := "🔐 APAIS Password Reset — Your verification code"
	if err := sendMail(body.Email, subject, buildHTML(subject, htmlBody)); err != nil {
		log.Printf("[ForgotPassword] email error: %v", err)
		http.Error(w, "Failed to send reset email", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "If the email exists, a reset code has been sent."})
}

// ResetPassword — POST /api/auth/reset-password
// Verifies the OTP and updates the user's password.
func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email       string `json:"email"`
		OTP         string `json:"otp"`
		NewPassword string `json:"newPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" || body.OTP == "" || body.NewPassword == "" {
		http.Error(w, "Email, OTP, and new password are required", http.StatusBadRequest)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Verify OTP
	resetColl := models.GetCollection(client, "password_resets")
	var resetDoc struct {
		Email     string    `bson:"email"`
		OTP       string    `bson:"otp"`
		ExpiresAt time.Time `bson:"expires_at"`
	}
	err = resetColl.FindOne(context.Background(), bson.M{"email": body.Email, "otp": body.OTP}).Decode(&resetDoc)
	if err != nil {
		http.Error(w, "Invalid or expired reset code", http.StatusUnauthorized)
		return
	}
	if time.Now().After(resetDoc.ExpiresAt) {
		resetColl.DeleteOne(context.Background(), bson.M{"email": body.Email})
		http.Error(w, "Reset code has expired. Please request a new one.", http.StatusUnauthorized)
		return
	}

	// Hash new password
	hashed, err := bcrypt.GenerateFromPassword([]byte(body.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to process password", http.StatusInternalServerError)
		return
	}

	// Update user password
	usersColl := models.GetCollection(client, "users")
	usersColl.UpdateOne(context.Background(),
		bson.M{"email": body.Email},
		bson.M{"$set": bson.M{"password": string(hashed), "updated_at": time.Now()}},
	)

	// Remove OTP record
	resetColl.DeleteOne(context.Background(), bson.M{"email": body.Email})

	log.Printf("[ResetPassword] password updated for %s", body.Email)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Password updated successfully."})
}

// CollaborateSendResource — POST /api/collaborate/send
// Sends a study resource (title, url, note) to a peer by email.
func CollaborateSendResource(w http.ResponseWriter, r *http.Request) {
	var body struct {
		FromEmail    string `json:"fromEmail"`
		ToEmail      string `json:"toEmail"`
		ResourceTitle string `json:"resourceTitle"`
		ResourceURL  string `json:"resourceURL"`
		Note         string `json:"note"`
		SenderName   string `json:"senderName"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ToEmail == "" {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	note := body.Note
	if note == "" {
		note = "I thought you might find this useful for your studies!"
	}

	htmlBody := fmt.Sprintf(`
<p>Hi there 👋</p>
<p>Your classmate <strong>%s</strong> shared a study resource with you via APAIS!</p>
<div style="background:#0f172a;border-radius:12px;padding:24px;margin:24px 0;border-left:4px solid #4361ee;">
  <h3 style="color:#a5b4fc;margin:0 0 8px;">📚 %s</h3>
  <a href="%s" style="color:#4361ee;font-size:14px;">%s</a>
  <p style="color:#94a3b8;margin:12px 0 0;font-style:italic;">"%s"</p>
</div>
<a href="%s" class="btn" style="display:inline-block;margin:8px 0;padding:12px 28px;background:linear-gradient(135deg,#4361ee,#7c3aed);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
  ▶ Open Resource
</a>`,
		body.SenderName, body.ResourceTitle, body.ResourceURL, body.ResourceURL, note, body.ResourceURL)

	subject := fmt.Sprintf("📚 %s shared a study resource with you — APAIS", body.SenderName)
	if err := sendMail(body.ToEmail, subject, buildHTML(subject, htmlBody)); err != nil {
		http.Error(w, "Failed to send resource email", http.StatusInternalServerError)
		return
	}

	// Store collaboration record in DB
	client, _ := models.ConnectDB(getMongoURI())
	if client != nil {
		collabColl := models.GetCollection(client, "collaborations")
		collabColl.InsertOne(context.Background(), bson.M{
			"from_email":     body.FromEmail,
			"to_email":       body.ToEmail,
			"resource_title": body.ResourceTitle,
			"resource_url":   body.ResourceURL,
			"note":           note,
			"sent_at":        time.Now(),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "sent"})
}

// CollaborateGetReceived — GET /api/collaborate/received
// Returns resources received by the current user.
func CollaborateGetReceived(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Get user email
	objectID, _ := primitive.ObjectIDFromHex(userID)
	var user models.User
	models.GetCollection(client, "users").FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)

	collabColl := models.GetCollection(client, "collaborations")
	cursor, err := collabColl.Find(context.Background(), bson.M{"to_email": user.Email})
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}
	defer cursor.Close(context.Background())

	var items []map[string]interface{}
	cursor.All(context.Background(), &items)
	if items == nil {
		items = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// GetNotifications — GET /api/notifications
// Returns in-app notifications for the current user.
func GetNotifications(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	objectID, _ := primitive.ObjectIDFromHex(userID)
	var user models.User
	models.GetCollection(client, "users").FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)

	// Fetch recent collaborations received
	collabColl := models.GetCollection(client, "collaborations")
	cursor, _ := collabColl.Find(context.Background(), bson.M{"to_email": user.Email})
	var collabs []map[string]interface{}
	if cursor != nil {
		cursor.All(context.Background(), &collabs)
		cursor.Close(context.Background())
	}

	notifications := []map[string]interface{}{}
	for _, c := range collabs {
		notifications = append(notifications, map[string]interface{}{
			"type":    "collaboration",
			"icon":    "📚",
			"title":   fmt.Sprintf("%v shared a resource", c["from_email"]),
			"message": fmt.Sprintf("📖 %v", c["resource_title"]),
			"url":     c["resource_url"],
			"time":    c["sent_at"],
			"read":    false,
		})
	}

	// Add static system notifications
	notifications = append(notifications, map[string]interface{}{
		"type":    "system",
		"icon":    "🎯",
		"title":   "Study Reminder",
		"message": "You have pending tasks. Stay on track!",
		"time":    time.Now().Add(-30 * time.Minute),
		"read":    false,
	})
	notifications = append(notifications, map[string]interface{}{
		"type":    "system",
		"icon":    "📈",
		"title":   "Weekly Progress",
		"message": "Check your analytics to see your weekly performance.",
		"time":    time.Now().Add(-2 * time.Hour),
		"read":    false,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// SendVerificationEmail — POST /api/auth/send-verification
// Generates a new OTP and resends the verification email.
func SendVerificationEmail(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Verify the user exists
	usersColl := models.GetCollection(client, "users")
	var user models.User
	if err = usersColl.FindOne(context.Background(), bson.M{"email": body.Email}).Decode(&user); err != nil {
		// Return 200 to avoid email enumeration
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "If that email exists, a verification code has been sent."})
		return
	}

	if user.IsEmailVerified {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Email is already verified."})
		return
	}

	// Generate OTP
	otp := fmt.Sprintf("%06d", rand.Intn(1000000))
	expiry := time.Now().Add(15 * time.Minute)
	verifColl := models.GetCollection(client, "email_verifications")
	verifColl.DeleteMany(context.Background(), bson.M{"email": body.Email})
	verifColl.InsertOne(context.Background(), bson.M{
		"email":      body.Email,
		"otp":        otp,
		"expires_at": expiry,
		"created_at": time.Now(),
	})

	htmlBody := fmt.Sprintf(`
<p>Hi <strong>%s</strong> 👋</p>
<p>Here is your new APAIS email verification code:</p>
<div style="text-align:center;margin:32px 0;">
  <div style="display:inline-block;background:linear-gradient(135deg,#4361ee,#7c3aed);border-radius:16px;padding:24px 48px;">
    <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#fff;">%s</span>
  </div>
  <p style="color:#94a3b8;margin-top:12px;font-size:13px;">This code expires in <strong>15 minutes</strong>.</p>
</div>
<p style="color:#64748b;font-size:13px;">If you did not create an APAIS account, please ignore this email.</p>`,
		user.FirstName, otp)

	subject := "✅ APAIS — Verify Your Email Address"
	if err := sendMail(body.Email, subject, buildHTML(subject, htmlBody)); err != nil {
		log.Printf("[SendVerificationEmail] email error: %v", err)
		http.Error(w, "Failed to send verification email", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Verification code sent successfully."})
}

// VerifyEmail — POST /api/auth/verify-email
// Verifies the OTP, marks the user's email as verified, and returns a JWT token.
func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" || body.OTP == "" {
		http.Error(w, "Email and OTP are required", http.StatusBadRequest)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Verify OTP
	verifColl := models.GetCollection(client, "email_verifications")
	var verifDoc struct {
		Email     string    `bson:"email"`
		OTP       string    `bson:"otp"`
		ExpiresAt time.Time `bson:"expires_at"`
	}
	if err = verifColl.FindOne(context.Background(), bson.M{"email": body.Email, "otp": body.OTP}).Decode(&verifDoc); err != nil {
		http.Error(w, "Invalid or expired verification code", http.StatusUnauthorized)
		return
	}
	if time.Now().After(verifDoc.ExpiresAt) {
		verifColl.DeleteOne(context.Background(), bson.M{"email": body.Email})
		http.Error(w, "Verification code has expired. Please request a new one.", http.StatusUnauthorized)
		return
	}

	// Mark email as verified
	usersColl := models.GetCollection(client, "users")
	var user models.User
	if err = usersColl.FindOne(context.Background(), bson.M{"email": body.Email}).Decode(&user); err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	now := time.Now()
	usersColl.UpdateOne(context.Background(),
		bson.M{"email": body.Email},
		bson.M{"$set": bson.M{"is_email_verified": true, "updated_at": now}},
	)
	user.IsEmailVerified = true

	// Clean up OTP
	verifColl.DeleteOne(context.Background(), bson.M{"email": body.Email})

	// Generate JWT token — user is now fully authenticated
	tokenString, err := auth.GenerateToken(&user)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	log.Printf("[VerifyEmail] email verified for %s", user.Email)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Email verified successfully! Welcome to APAIS.",
		"user": map[string]interface{}{
			"id":              user.ID.Hex(),
			"username":        user.Username,
			"email":           user.Email,
			"firstName":       user.FirstName,
			"lastName":        user.LastName,
			"role":            user.Role,
			"semester":        user.Semester,
			"major":           user.Major,
			"createdAt":       user.CreatedAt,
			"isActive":        user.IsActive,
			"isEmailVerified": true,
			"preferences":     user.Preferences,
		},
		"token": tokenString,
	})
}

// SendInlineEmailOTP — POST /api/auth/send-inline-otp
// Called from the registration form. Sends a 4-digit code to the provided email
// (does NOT require the user to exist). Used for inline pre-registration verification.
func SendInlineEmailOTP(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Check if email already registered
	usersColl := models.GetCollection(client, "users")
	var existing models.User
	if err := usersColl.FindOne(context.Background(), bson.M{"email": body.Email}).Decode(&existing); err == nil {
		http.Error(w, "This email is already registered. Please log in.", http.StatusConflict)
		return
	}

	// Generate 4-digit OTP
	otp := fmt.Sprintf("%04d", rand.Intn(10000))
	expiry := time.Now().Add(10 * time.Minute)
	otpColl := models.GetCollection(client, "inline_email_otps")
	otpColl.DeleteMany(context.Background(), bson.M{"email": body.Email})
	otpColl.InsertOne(context.Background(), bson.M{
		"email":      body.Email,
		"otp":        otp,
		"expires_at": expiry,
		"created_at": time.Now(),
	})

	htmlBody := fmt.Sprintf(`
<p>Hi there 👋</p>
<p>You're signing up for <strong>APAIS</strong>. Here's your email verification code:</p>
<div style="text-align:center;margin:32px 0;">
  <div style="display:inline-block;background:linear-gradient(135deg,#4361ee,#7c3aed);border-radius:16px;padding:28px 52px;">
    <span style="font-size:48px;font-weight:900;letter-spacing:14px;color:#fff;">%s</span>
  </div>
  <p style="color:#94a3b8;margin-top:12px;font-size:13px;">This code expires in <strong>10 minutes</strong>.</p>
</div>
<p style="color:#64748b;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>`, otp)

	subject := "🔑 APAIS — Your Email Verification Code"
	if err := sendMail(body.Email, subject, buildHTML(subject, htmlBody)); err != nil {
		log.Printf("[SendInlineEmailOTP] email error: %v", err)
		http.Error(w, "Failed to send verification email. Please try again.", http.StatusInternalServerError)
		return
	}

	log.Printf("[SendInlineEmailOTP] 4-digit OTP sent to %s", body.Email)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Verification code sent."})
}

// VerifyInlineEmailOTP — POST /api/auth/verify-inline-otp
// Verifies the 4-digit inline OTP entered by the user during registration.
func VerifyInlineEmailOTP(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" || body.OTP == "" {
		http.Error(w, "Email and code are required", http.StatusBadRequest)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	otpColl := models.GetCollection(client, "inline_email_otps")
	var doc struct {
		Email     string    `bson:"email"`
		OTP       string    `bson:"otp"`
		ExpiresAt time.Time `bson:"expires_at"`
	}
	if err := otpColl.FindOne(context.Background(), bson.M{"email": body.Email, "otp": body.OTP}).Decode(&doc); err != nil {
		http.Error(w, "Invalid verification code", http.StatusUnauthorized)
		return
	}
	if time.Now().After(doc.ExpiresAt) {
		otpColl.DeleteOne(context.Background(), bson.M{"email": body.Email})
		http.Error(w, "Code has expired. Please request a new one.", http.StatusUnauthorized)
		return
	}

	// Clean up OTP — it's been used
	otpColl.DeleteOne(context.Background(), bson.M{"email": body.Email})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Email verified.",
		"status":  "verified",
	})
}