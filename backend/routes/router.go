package routes

import (
	"github.com/gorilla/mux"
	"github.com/thekripaverse/student-analyzer-backend/config"
	"github.com/thekripaverse/student-analyzer-backend/controllers"
	"github.com/thekripaverse/student-analyzer-backend/middleware"
)

// SetupRouter sets up and returns the main router with all routes
func SetupRouter(cfg *config.Config) *mux.Router {
	router := mux.NewRouter()

	// Authentication routes (public)
	authRouter := router.PathPrefix("/api/auth").Subrouter()
	authRouter.HandleFunc("/register", controllers.RegisterUser).Methods("POST")
	authRouter.HandleFunc("/login", controllers.LoginUser).Methods("POST")
	authRouter.HandleFunc("/logout", controllers.LogoutUser).Methods("POST")
	authRouter.HandleFunc("/forgot-password", controllers.ForgotPassword).Methods("POST")
	authRouter.HandleFunc("/reset-password", controllers.ResetPassword).Methods("POST")
	authRouter.HandleFunc("/send-verification", controllers.SendVerificationEmail).Methods("POST")
	authRouter.HandleFunc("/verify-email", controllers.VerifyEmail).Methods("POST")
	authRouter.HandleFunc("/send-inline-otp", controllers.SendInlineEmailOTP).Methods("POST")
	authRouter.HandleFunc("/verify-inline-otp", controllers.VerifyInlineEmailOTP).Methods("POST")

	// Feedback routes (publicly shared)
	router.HandleFunc("/api/feedback", controllers.GetFeedbacks).Methods("GET")
	router.HandleFunc("/api/feedback", controllers.CreateFeedback).Methods("POST")

	// Protected routes (require authentication)
	protectedRouter := router.PathPrefix("/api").Subrouter()
	protectedRouter.Use(middleware.AuthMiddleware)

	// User routes
	protectedRouter.HandleFunc("/profile", controllers.GetUserProfile).Methods("GET")
	protectedRouter.HandleFunc("/profile", controllers.UpdateUserProfile).Methods("PUT")
	protectedRouter.HandleFunc("/password", controllers.ChangePassword).Methods("PUT")

	// Dashboard routes
	protectedRouter.HandleFunc("/dashboard/stats", controllers.GetDashboardStats).Methods("GET")
	protectedRouter.HandleFunc("/dashboard/trend", controllers.GetTrendData).Methods("GET")

	// Study Planner routes
	protectedRouter.HandleFunc("/planner/tasks", controllers.GetStudyTasks).Methods("GET")
	protectedRouter.HandleFunc("/planner/tasks", controllers.CreateStudyTask).Methods("POST")
	protectedRouter.HandleFunc("/planner/tasks/{id}", controllers.UpdateStudyTask).Methods("PUT")
	protectedRouter.HandleFunc("/planner/tasks/{id}", controllers.DeleteStudyTask).Methods("DELETE")

	// Analytics routes
	protectedRouter.HandleFunc("/analytics/performance", controllers.GetPerformanceAnalytics).Methods("GET")
	protectedRouter.HandleFunc("/analytics/risk", controllers.GetRiskAnalytics).Methods("GET")
	protectedRouter.HandleFunc("/analytics/marks", controllers.GetMarks).Methods("GET")
	protectedRouter.HandleFunc("/analytics/marks", controllers.CreateMark).Methods("POST")
	protectedRouter.HandleFunc("/analytics/marks/{id}", controllers.DeleteMark).Methods("DELETE")
	protectedRouter.HandleFunc("/analytics/parse-marksheet", controllers.ParseMarksheet).Methods("POST")

	// Resources routes
	protectedRouter.HandleFunc("/resources/search", controllers.SearchYoutubeResources).Methods("GET")
	protectedRouter.HandleFunc("/resources", controllers.GetResources).Methods("GET")
	protectedRouter.HandleFunc("/resources/{id}", controllers.GetResourceByID).Methods("GET")

	// Goals routes
	protectedRouter.HandleFunc("/goals", controllers.GetGoals).Methods("GET")
	protectedRouter.HandleFunc("/goals", controllers.CreateGoal).Methods("POST")
	protectedRouter.HandleFunc("/goals/{id}", controllers.UpdateGoal).Methods("PUT")
	protectedRouter.HandleFunc("/goals/{id}", controllers.DeleteGoal).Methods("DELETE")

	// Study Logs routes
	protectedRouter.HandleFunc("/logs", controllers.GetStudyLogs).Methods("GET")
	protectedRouter.HandleFunc("/logs", controllers.CreateStudyLog).Methods("POST")
	protectedRouter.HandleFunc("/logs/{id}", controllers.UpdateStudyLog).Methods("PUT")
	protectedRouter.HandleFunc("/logs/{id}", controllers.DeleteStudyLog).Methods("DELETE")

	// Settings routes
	protectedRouter.HandleFunc("/settings", controllers.GetUserSettings).Methods("GET")
	protectedRouter.HandleFunc("/settings", controllers.UpdateUserSettings).Methods("PUT")

	// Notification / SMTP routes
	protectedRouter.HandleFunc("/notify/task", controllers.SendTaskReminderEmail).Methods("POST")
	protectedRouter.HandleFunc("/notify/goal", controllers.SendGoalUpdateEmail).Methods("POST")
	protectedRouter.HandleFunc("/notify/resources", controllers.SendResourceDigestEmail).Methods("POST")

	// In-app notifications
	protectedRouter.HandleFunc("/notifications", controllers.GetNotifications).Methods("GET")

	// Collaboration routes
	protectedRouter.HandleFunc("/collaborate/send", controllers.CollaborateSendResource).Methods("POST")
	protectedRouter.HandleFunc("/collaborate/received", controllers.CollaborateGetReceived).Methods("GET")

	return router
}
