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

// GetDashboardStats returns statistics for the user dashboard based on real database records
func GetDashboardStats(w http.ResponseWriter, r *http.Request) {
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

	now := time.Now()
	sevenDaysAgo := now.AddDate(0, 0, -7)

	// 1. Calculate study hours this week from study logs
	logsColl := models.GetCollection(client, "study_logs")
	logsCursor, err := logsColl.Find(context.Background(), bson.M{
		"user_id": userOID,
		"date":    bson.M{"$gte": sevenDaysAgo},
	})
	
	var studyHoursThisWeek float64 = 0.0
	dailyHoursMap := make(map[string]float64)
	
	// Pre-fill daily hours map for last 7 days
	for i := 6; i >= 0; i-- {
		d := now.AddDate(0, 0, -i).Format("2006-01-02")
		dailyHoursMap[d] = 0.0
	}

	if err == nil {
		defer logsCursor.Close(context.Background())
		for logsCursor.Next(context.Background()) {
			var logEntry StudyLog
			if err := logsCursor.Decode(&logEntry); err == nil {
				studyHoursThisWeek += logEntry.Duration
				dateStr := logEntry.Date.Format("2006-01-02")
				if _, ok := dailyHoursMap[dateStr]; ok {
					dailyHoursMap[dateStr] += logEntry.Duration
				} else {
					dailyHoursMap[dateStr] = logEntry.Duration
				}
			}
		}
	}

	// 2. Calculate task statistics
	tasksColl := models.GetCollection(client, "study_tasks")
	totalTasks, _ := tasksColl.CountDocuments(context.Background(), bson.M{"user_id": userOID})
	completedTasks, _ := tasksColl.CountDocuments(context.Background(), bson.M{"user_id": userOID, "status": "completed"})
	
	var completionRate int = 0
	if totalTasks > 0 {
		completionRate = int((float64(completedTasks) / float64(totalTasks)) * 100)
	}

	// Upcoming deadlines count (status != completed and due_date >= now)
	upcomingTasksCount, _ := tasksColl.CountDocuments(context.Background(), bson.M{
		"user_id":  userOID,
		"status":   bson.M{"$ne": "completed"},
		"due_date": bson.M{"$gte": now},
	})

	// Find the nearest task deadline
	var nearestTask *StudyTask
	opts := options.FindOne().SetSort(bson.M{"due_date": 1})
	err = tasksColl.FindOne(context.Background(), bson.M{
		"user_id":  userOID,
		"status":   bson.M{"$ne": "completed"},
		"due_date": bson.M{"$gte": now},
	}, opts).Decode(&nearestTask)
	
	nearestTaskTitle := "No pending tasks"
	nearestTaskDue := ""
	if err == nil && nearestTask != nil {
		nearestTaskTitle = nearestTask.Title
		nearestTaskDue = nearestTask.DueDate.Format(time.RFC3339)
	}

	// 3. Find the nearest goal deadline
	goalsColl := models.GetCollection(client, "goals")
	var nearestGoal *Goal
	optsGoal := options.FindOne().SetSort(bson.M{"deadline": 1})
	err = goalsColl.FindOne(context.Background(), bson.M{
		"user_id":  userOID,
		"status":   "active",
		"deadline": bson.M{"$gte": now},
	}, optsGoal).Decode(&nearestGoal)

	nearestGoalTitle := "No active goals"
	nearestGoalDue := ""
	if err == nil && nearestGoal != nil {
		nearestGoalTitle = nearestGoal.Title
		nearestGoalDue = nearestGoal.Deadline.Format(time.RFC3339)
	}

	// 4. Updates on new learning materials
	// Mock list of recent system updates / resources
	updates := []map[string]interface{}{
		{"title": "Organic Chemistry Fundamentals (Video Series)", "type": "Video", "added": "Just now"},
		{"title": "Advanced Data Structures Handout", "type": "PDF", "added": "1 day ago"},
		{"title": "Calculus II - Integration Exercises", "type": "Exercises", "added": "2 days ago"},
	}

	// 5. Build daily performance trend for charts
	var performanceTrend []map[string]interface{}
	// Sorting daily trend by date
	for i := 6; i >= 0; i-- {
		t := now.AddDate(0, 0, -i)
		dateStr := t.Format("2006-01-02")
		displayStr := t.Format("Mon")
		performanceTrend = append(performanceTrend, map[string]interface{}{
			"date":  displayStr,
			"score": dailyHoursMap[dateStr], // Return the study hours logged each day
		})
	}

	// 6. Streak Days calculation (how many consecutive days had study logs)
	var streakDays int = 0
	checkDate := now
	for {
		count, err := logsColl.CountDocuments(context.Background(), bson.M{
			"user_id": userOID,
			"date": bson.M{
				"$gte": time.Date(checkDate.Year(), checkDate.Month(), checkDate.Day(), 0, 0, 0, 0, checkDate.Location()),
				"$lte": time.Date(checkDate.Year(), checkDate.Month(), checkDate.Day(), 23, 59, 59, 999999999, checkDate.Location()),
			},
		})
		if err == nil && count > 0 {
			streakDays++
			checkDate = checkDate.AddDate(0, 0, -1)
		} else {
			break
		}
	}

	// Calculate subject distributions
	subjectsMap := make(map[string]int)
	tasksCursor, err := tasksColl.Find(context.Background(), bson.M{"user_id": userOID})
	if err == nil {
		defer tasksCursor.Close(context.Background())
		for tasksCursor.Next(context.Background()) {
			var task StudyTask
			if err := tasksCursor.Decode(&task); err == nil && task.Subject != "" {
				subjectsMap[task.Subject]++
			}
		}
	}
	if len(subjectsMap) == 0 {
		subjectsMap["Mathematics"] = 1
		subjectsMap["Physics"] = 1
	}

	response := map[string]interface{}{
		"studyHoursThisWeek":  studyHoursThisWeek,
		"completionRate":      completionRate,
		"upcomingDeadlines":   upcomingTasksCount,
		"streakDays":          streakDays,
		"nearestTaskTitle":    nearestTaskTitle,
		"nearestTaskDeadline": nearestTaskDue,
		"nearestGoalTitle":    nearestGoalTitle,
		"nearestGoalDeadline": nearestGoalDue,
		"updates":             updates,
		"subjects":            subjectsMap,
		"performanceTrend":    performanceTrend,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetTrendData returns trend data for the analytics line chart based on subject performance
func GetTrendData(w http.ResponseWriter, r *http.Request) {
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

	// Group marks by day of week
	now := time.Now()
	
	// Create weekdays labels
	var labels []string
	weekdayIndexMap := make(map[string]int)
	for i := 6; i >= 0; i-- {
		t := now.AddDate(0, 0, -i)
		dayName := t.Format("Mon")
		labels = append(labels, dayName)
		weekdayIndexMap[dayName] = 6 - i
	}

	// Retrieve user marks
	marksColl := models.GetCollection(client, "marks")
	cursor, err := marksColl.Find(context.Background(), bson.M{"user_id": userOID})
	
	subjectGradesMap := make(map[string][]int) // subject -> [MonScore, TueScore...]
	subjectCountsMap := make(map[string][]int) // subject -> [MonCount, TueCount...]

	if err == nil {
		defer cursor.Close(context.Background())
		for cursor.Next(context.Background()) {
			var m Mark
			if err := cursor.Decode(&m); err == nil {
				dayName := m.Date.Format("Mon")
				idx, ok := weekdayIndexMap[dayName]
				if ok {
					if _, exists := subjectGradesMap[m.Subject]; !exists {
						subjectGradesMap[m.Subject] = make([]int, 7)
						subjectCountsMap[m.Subject] = make([]int, 7)
					}
					percentage := int((m.Score / m.MaxScore) * 100)
					subjectGradesMap[m.Subject][idx] += percentage
					subjectCountsMap[m.Subject][idx]++
				}
			}
		}
	}

	colors := []string{"#4361ee", "#f72585", "#4cc9f0", "#7209b7", "#2ec4b6", "#ff9f1c"}
	var datasets []map[string]interface{}
	colorIdx := 0

	for sub, scoreList := range subjectGradesMap {
		countList := subjectCountsMap[sub]
		finalData := make([]int, 7)
		for i := 0; i < 7; i++ {
			if countList[i] > 0 {
				finalData[i] = scoreList[i] / countList[i]
			} else {
				// Fallback to previous day or 0
				if i > 0 {
					finalData[i] = finalData[i-1]
				} else {
					finalData[i] = 0
				}
			}
		}
		
		color := colors[colorIdx%len(colors)]
		colorIdx++

		datasets = append(datasets, map[string]interface{}{
			"label": sub,
			"data":  finalData,
			"color": color,
		})
	}

	// If no data, return a default mock dataset to keep charts alive
	if len(datasets) == 0 {
		datasets = []map[string]interface{}{
			{
				"label": "Demo Performance",
				"data":  []int{75, 76, 78, 80, 82, 85, 87},
				"color": "#4361ee",
			},
		}
	}

	response := map[string]interface{}{
		"labels":   labels,
		"datasets": datasets,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}