package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/thekripaverse/student-analyzer-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Goal represents a student goal
type Goal struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID      primitive.ObjectID `bson:"user_id" json:"userId"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description,omitempty" json:"description,omitempty"`
	Subject     string             `bson:"subject" json:"subject"`
	TargetScore float64            `bson:"target_score" json:"targetScore"`
	Deadline    time.Time          `bson:"deadline" json:"deadline"`
	Status      string             `bson:"status" json:"status"` // active, completed, abandoned
	CreatedAt   time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
}

// GetGoals retrieves all goals for the current user
func GetGoals(w http.ResponseWriter, r *http.Request) {
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

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	coll := models.GetCollection(client, "goals")
	cursor, err := coll.Find(context.Background(), bson.M{"user_id": objectID})
	if err != nil {
		http.Error(w, "Failed to retrieve goals", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var goals []Goal
	if err = cursor.All(context.Background(), &goals); err != nil {
		http.Error(w, "Failed to decode goals", http.StatusInternalServerError)
		return
	}

	if goals == nil {
		goals = []Goal{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(goals)
}

// CreateGoal creates a new goal
func CreateGoal(w http.ResponseWriter, r *http.Request) {
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

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		Subject     string    `json:"subject"`
		TargetScore float64   `json:"targetScore"`
		Deadline    time.Time `json:"deadline"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Title == "" || input.Subject == "" || input.Deadline.IsZero() {
		http.Error(w, "Missing required fields: title, subject, deadline", http.StatusBadRequest)
		return
	}

	goal := Goal{
		ID:          primitive.NewObjectID(),
		UserID:      objectID,
		Title:       input.Title,
		Description: input.Description,
		Subject:     input.Subject,
		TargetScore: input.TargetScore,
		Deadline:    input.Deadline,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	coll := models.GetCollection(client, "goals")
	_, err = coll.InsertOne(context.Background(), goal)
	if err != nil {
		http.Error(w, "Failed to create goal", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(goal)
}

// UpdateGoal updates an existing goal
func UpdateGoal(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	goalID := vars["id"]

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	goalObjectID, err := primitive.ObjectIDFromHex(goalID)
	if err != nil {
		http.Error(w, "Invalid goal ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		Subject     string    `json:"subject"`
		TargetScore float64   `json:"targetScore"`
		Deadline    time.Time `json:"deadline"`
		Status      string    `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	fields := bson.M{"updated_at": time.Now()}
	if input.Title != "" {
		fields["title"] = input.Title
	}
	if input.Description != "" {
		fields["description"] = input.Description
	}
	if input.Subject != "" {
		fields["subject"] = input.Subject
	}
	if input.TargetScore > 0 {
		fields["target_score"] = input.TargetScore
	}
	if !input.Deadline.IsZero() {
		fields["deadline"] = input.Deadline
	}
	if input.Status != "" {
		fields["status"] = input.Status
	}

	coll := models.GetCollection(client, "goals")
	result, err := coll.UpdateOne(
		context.Background(),
		bson.M{"_id": goalObjectID, "user_id": userObjectID},
		bson.M{"$set": fields},
	)
	if err != nil {
		http.Error(w, "Failed to update goal", http.StatusInternalServerError)
		return
	}
	if result.MatchedCount == 0 {
		http.Error(w, "Goal not found or unauthorized", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Goal updated successfully"})
}

// DeleteGoal deletes a goal
func DeleteGoal(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	goalID := vars["id"]

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	goalObjectID, err := primitive.ObjectIDFromHex(goalID)
	if err != nil {
		http.Error(w, "Invalid goal ID", http.StatusBadRequest)
		return
	}

	coll := models.GetCollection(client, "goals")
	result, err := coll.DeleteOne(
		context.Background(),
		bson.M{"_id": goalObjectID, "user_id": userObjectID},
	)
	if err != nil {
		http.Error(w, "Failed to delete goal", http.StatusInternalServerError)
		return
	}
	if result.DeletedCount == 0 {
		http.Error(w, "Goal not found or unauthorized", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Goal deleted successfully"})
}

