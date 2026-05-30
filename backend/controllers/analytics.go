package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/thekripaverse/student-analyzer-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Mark represents a student's marks/score in a subject exam
type Mark struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID    primitive.ObjectID `bson:"user_id" json:"userId"`
	Subject   string             `bson:"subject" json:"subject"`
	ExamName  string             `bson:"exam_name" json:"examName"`
	Score     float64            `bson:"score" json:"score"`
	MaxScore  float64            `bson:"max_score" json:"maxScore"`
	Date      time.Time          `bson:"date" json:"date"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updatedAt"`
}

// GetMarks retrieves all marks for the current user
func GetMarks(w http.ResponseWriter, r *http.Request) {
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

	userOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	coll := models.GetCollection(client, "marks")
	cursor, err := coll.Find(context.Background(), bson.M{"user_id": userOID})
	if err != nil {
		http.Error(w, "Failed to retrieve marks", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var rawMarks []Mark
	if err = cursor.All(context.Background(), &rawMarks); err != nil {
		http.Error(w, "Failed to decode marks", http.StatusInternalServerError)
		return
	}

	var marks []Mark
	var badIds []primitive.ObjectID
	for _, m := range rawMarks {
		if isCleanSubject(m.Subject) {
			marks = append(marks, m)
		} else {
			badIds = append(badIds, m.ID)
		}
	}

	// Proactively clean the database in the background of any corrupted binary records
	if len(badIds) > 0 {
		go func(ids []primitive.ObjectID) {
			coll.DeleteMany(context.Background(), bson.M{"_id": bson.M{"$in": ids}})
		}(badIds)
	}

	if marks == nil {
		marks = []Mark{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(marks)
}

// CreateMark adds a new exam mark for the current user
func CreateMark(w http.ResponseWriter, r *http.Request) {
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

	userOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Subject  string    `json:"subject"`
		ExamName string    `json:"examName"`
		Score    float64   `json:"score"`
		MaxScore float64   `json:"maxScore"`
		Date     time.Time `json:"date"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Subject == "" || input.ExamName == "" || input.MaxScore <= 0 {
		http.Error(w, "Missing required fields: subject, examName, maxScore", http.StatusBadRequest)
		return
	}

	if input.Date.IsZero() {
		input.Date = time.Now()
	}

	mark := Mark{
		ID:        primitive.NewObjectID(),
		UserID:    userOID,
		Subject:   input.Subject,
		ExamName:  input.ExamName,
		Score:     input.Score,
		MaxScore:  input.MaxScore,
		Date:      input.Date,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	coll := models.GetCollection(client, "marks")
	_, err = coll.InsertOne(context.Background(), mark)
	if err != nil {
		http.Error(w, "Failed to create mark entry", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mark)
}

// DeleteMark deletes an exam mark entry
func DeleteMark(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	markID := vars["id"]

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

	markOID, err := primitive.ObjectIDFromHex(markID)
	if err != nil {
		http.Error(w, "Invalid mark ID", http.StatusBadRequest)
		return
	}

	coll := models.GetCollection(client, "marks")
	result, err := coll.DeleteOne(context.Background(), bson.M{"_id": markOID, "user_id": userOID})
	if err != nil {
		http.Error(w, "Failed to delete mark", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Mark not found or unauthorized", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Mark entry deleted successfully"})
}

// GetPerformanceAnalytics returns performance analytics and actionable plans based on real marks
func GetPerformanceAnalytics(w http.ResponseWriter, r *http.Request) {
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

	userOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Fetch all marks for this user
	marksColl := models.GetCollection(client, "marks")
	cursor, err := marksColl.Find(context.Background(), bson.M{"user_id": userOID})
	if err != nil {
		http.Error(w, "Failed to retrieve marks", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var rawMarks []Mark
	if err = cursor.All(context.Background(), &rawMarks); err != nil {
		http.Error(w, "Failed to decode marks", http.StatusInternalServerError)
		return
	}

	var marks []Mark
	for _, m := range rawMarks {
		if isCleanSubject(m.Subject) {
			marks = append(marks, m)
		}
	}

	// If no marks logged, return standard default initial analysis
	if len(marks) == 0 {
		defaultResponse := map[string]interface{}{
			"overallScore":     0,
			"subjectScores":    []map[string]interface{}{},
			"strengths":        []string{"No marks recorded yet"},
			"improvementAreas": []string{"Please enter your marks to generate a performance profile"},
			"learningStyle":    "Adaptive Learner",
			"recommendations": []string{
				"Start by adding your recent marks in the Marks Panel below.",
				"Set a study goal for your weak subjects to trigger smart recommendations.",
			},
			"studyPlan": []map[string]interface{}{
				{
					"step":        "Record initial grades",
					"description": "Log your recent exam, test or quiz marks in the Marks Manager to begin compiling a real academic profile.",
					"priority":    "High",
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(defaultResponse)
		return
	}

	// Calculate statistics
	subjectSums := make(map[string]float64)
	subjectCounts := make(map[string]float64)

	for _, m := range marks {
		percentage := (m.Score / m.MaxScore) * 100
		subjectSums[m.Subject] += percentage
		subjectCounts[m.Subject]++
	}

	var subjectScores []map[string]interface{}
	var overallSum float64
	var strengths []string
	var improvementAreas []string
	var recommendations []string
	var studyPlan []map[string]interface{}

	for sub, sum := range subjectSums {
		count := subjectCounts[sub]
		avg := sum / count
		overallSum += avg

		trend := "stable"
		// Simple trend calculation if there are multiple marks for the subject
		var subMarks []Mark
		for _, m := range marks {
			if m.Subject == sub {
				subMarks = append(subMarks, m)
			}
		}
		if len(subMarks) > 1 {
			// Compare last two by date
			lastIdx := len(subMarks) - 1
			prevIdx := len(subMarks) - 2
			lastPerc := (subMarks[lastIdx].Score / subMarks[lastIdx].MaxScore) * 100
			prevPerc := (subMarks[prevIdx].Score / subMarks[prevIdx].MaxScore) * 100
			if lastPerc > prevPerc+1.5 {
				trend = "up"
			} else if lastPerc < prevPerc-1.5 {
				trend = "down"
			}
		}

		subjectScores = append(subjectScores, map[string]interface{}{
			"subject": sub,
			"score":   int(avg),
			"trend":   trend,
		})

		if avg >= 80 {
			strengths = append(strengths, sub)
		} else if avg < 70 {
			improvementAreas = append(improvementAreas, sub)
		}
	}

	overallScore := int(overallSum / float64(len(subjectSums)))

	// Formulate actionable plan and recommendations dynamically
	if len(strengths) == 0 {
		strengths = []string{"General Effort", "Consistency"}
	}
	if len(improvementAreas) == 0 {
		improvementAreas = []string{"Time management under exam conditions"}
		recommendations = append(recommendations, "Practice mock papers under strictly timed conditions.")
	}

	for _, area := range improvementAreas {
		if area == "General effort" || area == "Time management under exam conditions" {
			continue
		}
		recommendations = append(recommendations, fmt.Sprintf("Focus on solving active recall flashcards and practicing textbook questions for %s.", area))
		studyPlan = append(studyPlan, map[string]interface{}{
			"step":        fmt.Sprintf("Boost proficiency in %s", area),
			"description": "Dedicate at least 3 hours of focused active study this week. Practice 15 custom practice problems and review missed exam questions.",
			"priority":    "High",
		})
	}

	// Add general recommendations and study plans if list is short
	if len(recommendations) < 3 {
		recommendations = append(recommendations, "Use spaced-repetition models (like 2-3-5-7 day reviews) to strengthen long-term memorization.")
	}
	if len(studyPlan) == 0 {
		studyPlan = append(studyPlan, map[string]interface{}{
			"step":        "Maintain current standard",
			"description": "Keep up your excellent scores! Advance ahead by reading upcoming topics and tutoring peers to solidify memory.",
			"priority":    "Medium",
		})
	} else {
		studyPlan = append(studyPlan, map[string]interface{}{
			"step":        "Consistent Spaced Repetition",
			"description": "Schedule a 20-minute daily review session of concepts covered 2 days ago to retain theoretical definitions.",
			"priority":    "Medium",
		})
	}

	response := map[string]interface{}{
		"overallScore":     overallScore,
		"subjectScores":    subjectScores,
		"strengths":        strengths,
		"improvementAreas": improvementAreas,
		"learningStyle":    "Structured Analytics Learner",
		"recommendations":  recommendations,
		"studyPlan":        studyPlan,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetRiskAnalytics returns risk levels dynamically based on grades and study activities
func GetRiskAnalytics(w http.ResponseWriter, r *http.Request) {
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

	userOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Calculate dynamically based on marks and task completion rates
	marksColl := models.GetCollection(client, "marks")
	marksCount, _ := marksColl.CountDocuments(context.Background(), bson.M{"user_id": userOID})

	var overallScore float64 = 85.0 // starting baseline
	if marksCount > 0 {
		cursor, _ := marksColl.Find(context.Background(), bson.M{"user_id": userOID})
		var rawMarks []Mark
		_ = cursor.All(context.Background(), &rawMarks)
		var sum float64
		var count float64
		for _, m := range rawMarks {
			if isCleanSubject(m.Subject) {
				sum += (m.Score / m.MaxScore) * 100
				count++
			}
		}
		if count > 0 {
			overallScore = sum / count
		}
	}

	tasksColl := models.GetCollection(client, "study_tasks")
	totalTasks, _ := tasksColl.CountDocuments(context.Background(), bson.M{"user_id": userOID})
	completedTasks, _ := tasksColl.CountDocuments(context.Background(), bson.M{"user_id": userOID, "status": "completed"})

	completionRate := 100.0
	if totalTasks > 0 {
		completionRate = (float64(completedTasks) / float64(totalTasks)) * 100
	}

	// Calculate a simple risk score
	// Lower is better, 0-100.
	// Factors: Grade average, task completion rate
	gradeFactor := 100.0 - overallScore
	completionFactor := 100.0 - completionRate

	riskScore := (gradeFactor*0.6 + completionFactor*0.4)
	if riskScore < 0 {
		riskScore = 0
	} else if riskScore > 100 {
		riskScore = 100
	}

	riskLevel := "low"
	if riskScore > 50 {
		riskLevel = "high"
	} else if riskScore > 25 {
		riskLevel = "medium"
	}

	factors := []map[string]interface{}{
		{"name": "Exam Performance", "value": int(overallScore), "impact": "positive"},
		{"name": "Task Completion Rate", "value": int(completionRate), "impact": "positive"},
		{"name": "Assignments Submitted", "value": int(completedTasks), "impact": "neutral"},
	}
	if overallScore < 70 {
		factors[0]["impact"] = "negative"
	}
	if completionRate < 60 {
		factors[1]["impact"] = "negative"
	}

	trend := "stable"
	if riskScore < 20 {
		trend = "excellent"
	} else if riskScore < 35 {
		trend = "improving"
	} else {
		trend = "requires-attention"
	}

	interventions := []string{
		"Maintain current study routine",
	}
	if riskLevel == "high" {
		interventions = []string{
			"Schedule an immediate counseling/peer tutoring session",
			"Break upcoming tasks into 30-minute hyper-focused sessions",
			"Set smaller study goals (e.g. 1 task completed per day)",
		}
	} else if riskLevel == "medium" {
		interventions = []string{
			"Conduct a weekly review of low scoring subjects",
			"Create a planner schedule for upcoming due dates",
		}
	}

	response := map[string]interface{}{
		"riskLevel":      riskLevel,
		"riskScore":      int(riskScore),
		"factors":        factors,
		"trend":          trend,
		"projectedScore": int(overallScore + (completionRate-50)*0.1),
		"interventions":  interventions,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// isCleanSubject returns false if the subject name contains invalid characters or looks like corrupted binary data.
func isCleanSubject(subject string) bool {
	// If it contains the Unicode replacement character
	if strings.Contains(subject, "\uFFFD") {
		return false
	}
	// If it has weird control chars or is mostly binary garbage
	nonPrintable := 0
	for _, r := range subject {
		if r < 32 || r > 126 {
			// Allow standard international characters if they are letters/spaces,
			// but if it's junk characters like control sequences, mark it as junk
			if r < 32 {
				return false
			}
			nonPrintable++
		}
	}
	if len(subject) > 0 && float64(nonPrintable)/float64(len(subject)) > 0.15 {
		return false
	}
	// If the name is extremely long or short
	if len(subject) > 80 || len(subject) < 2 {
		return false
	}
	// Check for common binary parser remnants
	if strings.Contains(subject, "") || strings.Contains(subject, "%%") {
		return false
	}
	return true
}