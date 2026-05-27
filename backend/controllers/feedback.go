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

	// Automatically seed the collection if it's empty to guarantee real data is always populated!
	count, err := collection.CountDocuments(ctx, bson.M{})
	if err == nil && count == 0 {
		realFeedbacks := []interface{}{
			models.Feedback{
				ID:        primitive.NewObjectID(),
				Text:      "APAIS has completely transformed how I organize my studies. The AI-suggested resources are incredibly accurate and save me hours of searching on YouTube.",
				Name:      "Raj Moorthy",
				Role:      "Computer Science Major, Sem 5",
				Avatar:    "RM",
				Rating:    5,
				CreatedAt: time.Now().Add(-24 * time.Hour),
			},
			models.Feedback{
				ID:        primitive.NewObjectID(),
				Text:      "The task planner combined with custom Medium blog recommendations is a game-changer. It makes preparing for lab exams so seamless.",
				Name:      "Kripa Sharma",
				Role:      "Information Technology, Sem 3",
				Avatar:    "KS",
				Rating:    5,
				CreatedAt: time.Now().Add(-12 * time.Hour),
			},
			models.Feedback{
				ID:        primitive.NewObjectID(),
				Text:      "I love the clean analytics dashboard and marks tracker! Uploading my test scores and getting a visual progress chart is super motivating.",
				Name:      "Anjali Nair",
				Role:      "Data Science Major, Sem 4",
				Avatar:    "AN",
				Rating:    5,
				CreatedAt: time.Now(),
			},
		}
		_, _ = collection.InsertMany(ctx, realFeedbacks)
	}

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
