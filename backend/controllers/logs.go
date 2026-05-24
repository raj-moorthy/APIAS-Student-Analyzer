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

// StudyLog represents a study session log
type StudyLog struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID       primitive.ObjectID `bson:"user_id" json:"userId"`
	Subject      string             `bson:"subject" json:"subject"`
	Topic        string             `bson:"topic" json:"topic"`
	Duration     float64            `bson:"duration" json:"duration"`
	Date         time.Time          `bson:"date" json:"date"`
	Notes        string             `bson:"notes,omitempty" json:"notes,omitempty"`
	Productivity int                `bson:"productivity" json:"productivity"`
	CreatedAt    time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updatedAt"`
}

// GetStudyLogs retrieves all study logs for the current user
func GetStudyLogs(w http.ResponseWriter, r *http.Request) {
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
	coll := models.GetCollection(client, "study_logs")
	cursor, err := coll.Find(context.Background(), bson.M{"user_id": objectID})
	if err != nil {
		http.Error(w, "Failed to retrieve study logs", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var logs []StudyLog
	if err = cursor.All(context.Background(), &logs); err != nil {
		http.Error(w, "Failed to decode study logs", http.StatusInternalServerError)
		return
	}
	if logs == nil {
		logs = []StudyLog{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}

// CreateStudyLog creates a new study log entry
func CreateStudyLog(w http.ResponseWriter, r *http.Request) {
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
		Subject      string    `json:"subject"`
		Topic        string    `json:"topic"`
		Duration     float64   `json:"duration"`
		Date         time.Time `json:"date"`
		Notes        string    `json:"notes"`
		Productivity int       `json:"productivity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if input.Subject == "" || input.Topic == "" || input.Duration <= 0 {
		http.Error(w, "Missing required fields: subject, topic, duration", http.StatusBadRequest)
		return
	}
	if input.Date.IsZero() {
		input.Date = time.Now()
	}
	if input.Productivity < 1 || input.Productivity > 5 {
		input.Productivity = 3
	}

	entry := StudyLog{
		ID:           primitive.NewObjectID(),
		UserID:       objectID,
		Subject:      input.Subject,
		Topic:        input.Topic,
		Duration:     input.Duration,
		Date:         input.Date,
		Notes:        input.Notes,
		Productivity: input.Productivity,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	coll := models.GetCollection(client, "study_logs")
	_, err = coll.InsertOne(context.Background(), entry)
	if err != nil {
		http.Error(w, "Failed to create study log", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entry)
}

// UpdateStudyLog updates an existing study log
func UpdateStudyLog(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}
	vars := mux.Vars(r)
	logID := vars["id"]

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	userOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	logOID, err := primitive.ObjectIDFromHex(logID)
	if err != nil {
		http.Error(w, "Invalid log ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Subject      string    `json:"subject"`
		Topic        string    `json:"topic"`
		Duration     float64   `json:"duration"`
		Date         time.Time `json:"date"`
		Notes        string    `json:"notes"`
		Productivity int       `json:"productivity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	fields := bson.M{"updated_at": time.Now()}
	if input.Subject != "" {
		fields["subject"] = input.Subject
	}
	if input.Topic != "" {
		fields["topic"] = input.Topic
	}
	if input.Duration > 0 {
		fields["duration"] = input.Duration
	}
	if !input.Date.IsZero() {
		fields["date"] = input.Date
	}
	if input.Notes != "" {
		fields["notes"] = input.Notes
	}
	if input.Productivity >= 1 && input.Productivity <= 5 {
		fields["productivity"] = input.Productivity
	}

	coll := models.GetCollection(client, "study_logs")
	res, err := coll.UpdateOne(context.Background(),
		bson.M{"_id": logOID, "user_id": userOID},
		bson.M{"$set": fields},
	)
	if err != nil {
		http.Error(w, "Failed to update study log", http.StatusInternalServerError)
		return
	}
	if res.MatchedCount == 0 {
		http.Error(w, "Study log not found or unauthorized", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Study log updated successfully"})
}

// DeleteStudyLog deletes a study log entry
func DeleteStudyLog(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}
	vars := mux.Vars(r)
	logID := vars["id"]

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	userOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	logOID, err := primitive.ObjectIDFromHex(logID)
	if err != nil {
		http.Error(w, "Invalid log ID", http.StatusBadRequest)
		return
	}

	coll := models.GetCollection(client, "study_logs")
	res, err := coll.DeleteOne(context.Background(),
		bson.M{"_id": logOID, "user_id": userOID},
	)
	if err != nil {
		http.Error(w, "Failed to delete study log", http.StatusInternalServerError)
		return
	}
	if res.DeletedCount == 0 {
		http.Error(w, "Study log not found or unauthorized", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Study log deleted successfully"})
}
