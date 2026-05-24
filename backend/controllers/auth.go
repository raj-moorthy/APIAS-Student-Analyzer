package controllers

import (
	"context"
	"encoding/json"
	"log"
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
		ID:        primitive.NewObjectID(),
		Username:  input.Username,
		Email:     input.Email,
		Password:  string(hashedPassword),
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Role:      input.Role,
		Semester:  input.Semester,
		Major:     input.Major,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		IsActive:  true,
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

	tokenString, err := auth.GenerateToken(&user)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	log.Printf("[RegisterUser] new user: %s (%s)", user.Username, user.Email)

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
			"isActive":    user.IsActive,
			"preferences": user.Preferences,
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