package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/thekripaverse/student-analyzer-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// GetUserProfile retrieves the current user's profile
func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	usersColl := models.GetCollection(client, "users")

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Find user
	var user models.User
	err = usersColl.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Return user data (without password)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":        user.ID.Hex(),
		"username":  user.Username,
		"email":     user.Email,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"role":      user.Role,
		"semester":  user.Semester,
		"major":     user.Major,
		"createdAt": user.CreatedAt,
		"lastLogin": user.LastLogin,
		"isActive":  user.IsActive,
		"preferences": user.Preferences,
	})
}

// UpdateUserProfile updates the current user's profile
func UpdateUserProfile(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	usersColl := models.GetCollection(client, "users")

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Decode request body
	var input struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
		Major     string `json:"major"`
		Semester  int    `json:"semester"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Prepare update
	update := bson.M{
		"$set": bson.M{
			"first_name": input.FirstName,
			"last_name":  input.LastName,
			"email":      input.Email,
			"major":      input.Major,
			"semester":   input.Semester,
			"updated_at": time.Now(),
		},
	}

	// Update user
	_, err = usersColl.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	if err != nil {
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	// Return updated user (without password)
	var updatedUser models.User
	err = usersColl.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&updatedUser)
	if err != nil {
		http.Error(w, "Failed to retrieve updated user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":        updatedUser.ID.Hex(),
		"username":  updatedUser.Username,
		"email":     updatedUser.Email,
		"firstName": updatedUser.FirstName,
		"lastName":  updatedUser.LastName,
		"role":      updatedUser.Role,
		"semester":  updatedUser.Semester,
		"major":     updatedUser.Major,
		"createdAt": updatedUser.CreatedAt,
		"lastLogin": updatedUser.LastLogin,
		"isActive":  updatedUser.IsActive,
		"preferences": updatedUser.Preferences,
	})
}

// ChangePassword updates the current user's password
func ChangePassword(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	usersColl := models.GetCollection(client, "users")

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Decode request body
	var input struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if input.CurrentPassword == "" || input.NewPassword == "" {
		http.Error(w, "Current password and new password are required", http.StatusBadRequest)
		return
	}

	// Get current user
	var user models.User
	err = usersColl.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Check current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.CurrentPassword)); err != nil {
		http.Error(w, "Current password is incorrect", http.StatusUnauthorized)
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error processing new password", http.StatusInternalServerError)
		return
	}

	// Update password
	_, err = usersColl.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": bson.M{"password": string(hashedPassword), "updated_at": time.Now()}},
	)
	if err != nil {
		http.Error(w, "Failed to update password", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Password updated successfully"})
}