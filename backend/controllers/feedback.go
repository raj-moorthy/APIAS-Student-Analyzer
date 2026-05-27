package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/thekripaverse/student-analyzer-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetFeedbacks fetches all user feedbacks from the database sorted by latest first
func GetFeedbacks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	dbClient := models.GetDB()
	collection := models.GetCollection(dbClient, "feedbacks")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()


	findOpts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(50)
	cursor, err := collection.Find(ctx, bson.M{}, findOpts)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch feedbacks"}`, http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var feedbacks []models.Feedback
	if err = cursor.All(ctx, &feedbacks); err != nil {
		http.Error(w, `{"error": "Failed to parse feedbacks"}`, http.StatusInternalServerError)
		return
	}

	if feedbacks == nil {
		feedbacks = []models.Feedback{}
	}

	json.NewEncoder(w).Encode(feedbacks)
}

// CreateFeedback posts a new feedback to the global database
func CreateFeedback(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var feedback models.Feedback
	if err := json.NewDecoder(r.Body).Decode(&feedback); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if feedback.Text == "" || feedback.Name == "" {
		http.Error(w, `{"error": "Text and Name are required"}`, http.StatusBadRequest)
		return
	}

	feedback.ID = primitive.NewObjectID()
	feedback.CreatedAt = time.Now()

	dbClient := models.GetDB()
	collection := models.GetCollection(dbClient, "feedbacks")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, feedback)
	if err != nil {
		http.Error(w, `{"error": "Failed to save feedback"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(feedback)
}
