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

// StudyTask represents a planned task for the student
type StudyTask struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID         primitive.ObjectID `bson:"user_id" json:"userId"`
	Title          string             `bson:"title" json:"title"`
	Description    string             `bson:"description" json:"description"`
	Subject        string             `bson:"subject" json:"subject"`
	DueDate        time.Time          `bson:"due_date" json:"dueDate"`
	Priority       string             `bson:"priority" json:"priority"` // low, medium, high
	Status         string             `bson:"status" json:"status"`     // pending, in-progress, completed
	EstimatedHours float64            `bson:"estimated_hours" json:"estimatedHours"`
	ActualHours    float64            `bson:"actual_hours" json:"actualHours"`
	CreatedAt      time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updatedAt"`
}

// GetStudyTasks retrieves study tasks for the current user
func GetStudyTasks(w http.ResponseWriter, r *http.Request) {
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

	tasksColl := models.GetCollection(client, "study_tasks")

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Find tasks for user
	cursor, err := tasksColl.Find(context.Background(), bson.M{"user_id": objectID})
	if err != nil {
		http.Error(w, "Failed to retrieve tasks", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var tasks []StudyTask
	if err = cursor.All(context.Background(), &tasks); err != nil {
		http.Error(w, "Failed to decode tasks", http.StatusInternalServerError)
		return
	}

	// Convert to response format
	var response []map[string]interface{}
	for _, task := range tasks {
		response = append(response, map[string]interface{}{
			"id":             task.ID.Hex(),
			"title":          task.Title,
			"description":    task.Description,
			"subject":        task.Subject,
			"dueDate":        task.DueDate,
			"priority":       task.Priority,
			"status":         task.Status,
			"estimatedHours": task.EstimatedHours,
			"actualHours":    task.ActualHours,
			"createdAt":      task.CreatedAt,
			"updatedAt":      task.UpdatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CreateStudyTask creates a new study task
func CreateStudyTask(w http.ResponseWriter, r *http.Request) {
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

	tasksColl := models.GetCollection(client, "study_tasks")

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Decode request body
	var input struct {
		Title          string    `json:"title"`
		Description    string    `json:"description"`
		Subject        string    `json:"subject"`
		DueDate        time.Time `json:"dueDate"`
		Priority       string    `json:"priority"`
		EstimatedHours float64   `json:"estimatedHours"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if input.Title == "" || input.Subject == "" || input.DueDate.IsZero() ||
		input.Priority == "" || input.EstimatedHours <= 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Validate priority
	if input.Priority != "low" && input.Priority != "medium" && input.Priority != "high" {
		http.Error(w, "Invalid priority value", http.StatusBadRequest)
		return
	}

	// Create task
	task := StudyTask{
		ID:             primitive.NewObjectID(),
		UserID:         objectID,
		Title:          input.Title,
		Description:    input.Description,
		Subject:        input.Subject,
		DueDate:        input.DueDate,
		Priority:       input.Priority,
		Status:         "pending",
		EstimatedHours: input.EstimatedHours,
		ActualHours:    0,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Insert task
	_, err = tasksColl.InsertOne(context.Background(), task)
	if err != nil {
		http.Error(w, "Failed to create task", http.StatusInternalServerError)
		return
	}

	// Return created task
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":             task.ID.Hex(),
		"title":          task.Title,
		"description":    task.Description,
		"subject":        task.Subject,
		"dueDate":        task.DueDate,
		"priority":       task.Priority,
		"status":         task.Status,
		"estimatedHours": task.EstimatedHours,
		"actualHours":    task.ActualHours,
		"createdAt":      task.CreatedAt,
		"updatedAt":      task.UpdatedAt,
	})
}

// UpdateStudyTask updates an existing study task
func UpdateStudyTask(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	// Get task ID from URL
	vars := mux.Vars(r)
	taskID := vars["id"]
	if taskID == "" {
		http.Error(w, "Task ID is required", http.StatusBadRequest)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	tasksColl := models.GetCollection(client, "study_tasks")

	// Convert IDs to ObjectID
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	taskObjectID, err := primitive.ObjectIDFromHex(taskID)
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	// Decode request body
	var input struct {
		Title          string    `json:"title"`
		Description    string    `json:"description"`
		Subject        string    `json:"subject"`
		DueDate        time.Time `json:"dueDate"`
		Priority       string    `json:"priority"`
		Status         string    `json:"status"`
		EstimatedHours float64   `json:"estimatedHours"`
		ActualHours    float64   `json:"actualHours"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate priority if provided
	if input.Priority != "" && input.Priority != "low" && input.Priority != "medium" && input.Priority != "high" {
		http.Error(w, "Invalid priority value", http.StatusBadRequest)
		return
	}

	// Validate status if provided
	if input.Status != "" && input.Status != "pending" && input.Status != "in-progress" && input.Status != "completed" {
		http.Error(w, "Invalid status value", http.StatusBadRequest)
		return
	}

	// Prepare update
	update := bson.M{"$set": bson.M{}}
	if input.Title != "" {
		update["$set"].(bson.M)["title"] = input.Title
	}
	if input.Description != "" {
		update["$set"].(bson.M)["description"] = input.Description
	}
	if input.Subject != "" {
		update["$set"].(bson.M)["subject"] = input.Subject
	}
	if !input.DueDate.IsZero() {
		update["$set"].(bson.M)["due_date"] = input.DueDate
	}
	if input.Priority != "" {
		update["$set"].(bson.M)["priority"] = input.Priority
	}
	if input.Status != "" {
		update["$set"].(bson.M)["status"] = input.Status
	}
	if input.EstimatedHours > 0 {
		update["$set"].(bson.M)["estimated_hours"] = input.EstimatedHours
	}
	if input.ActualHours >= 0 {
		update["$set"].(bson.M)["actual_hours"] = input.ActualHours
	}
	update["$set"].(bson.M)["updated_at"] = time.Now()

	// Update task
	_, err = tasksColl.UpdateOne(
		context.Background(),
		bson.M{"_id": taskObjectID, "user_id": userObjectID},
		update,
	)
	if err != nil {
		http.Error(w, "Failed to update task", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Task updated successfully"})
}

// DeleteStudyTask deletes a study task
func DeleteStudyTask(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	// Get task ID from URL
	vars := mux.Vars(r)
	taskID := vars["id"]
	if taskID == "" {
		http.Error(w, "Task ID is required", http.StatusBadRequest)
		return
	}

	client, err := models.ConnectDB(getMongoURI())
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	tasksColl := models.GetCollection(client, "study_tasks")

	// Convert IDs to ObjectID
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	taskObjectID, err := primitive.ObjectIDFromHex(taskID)
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	// Delete task
	result, err := tasksColl.DeleteOne(
		context.Background(),
		bson.M{"_id": taskObjectID, "user_id": userObjectID},
	)
	if err != nil {
		http.Error(w, "Failed to delete task", http.StatusInternalServerError)
		return
	}

	// Check if task was found and deleted
	if result.DeletedCount == 0 {
		http.Error(w, "Task not found or unauthorized", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Task deleted successfully"})
}