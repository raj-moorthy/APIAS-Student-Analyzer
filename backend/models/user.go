package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a student/user in the system
type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Username    string             `bson:"username" json:"username"`
	Email       string             `bson:"email" json:"email"`
	Password    string             `bson:"password" json:"-"` // Never return password in JSON
	FirstName   string             `bson:"first_name" json:"firstName"`
	LastName    string             `bson:"last_name" json:"lastName"`
	Role        string             `bson:"role" json:"role"` // student, teacher, admin
	Semester    int                `bson:"semester" json:"semester"`
	Major       string             `bson:"major" json:"major"`
	CreatedAt   time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
	LastLogin   *time.Time         `bson:"last_login,omitempty" json:"lastLogin,omitempty"`
	IsActive           bool               `bson:"is_active" json:"isActive"`
	IsEmailVerified    bool               `bson:"is_email_verified" json:"isEmailVerified"`
	Preferences Preferences        `bson:"preferences,omitempty" json:"preferences,omitempty"`
}

// Preferences stores user-specific settings
type Preferences struct {
	Theme           string `bson:"theme,omitempty" json:"theme,omitempty"` // light, dark
	Notifications   bool   `bson:"notifications,omitempty" json:"notifications,omitempty"`
	EmailUpdates    bool   `bson:"email_updates,omitempty" json:"emailUpdates,omitempty"`
	StudyReminders  bool   `bson:"study_reminders,omitempty" json:"studyReminders,omitempty"`
	DefaultView     string `bson:"default_view,omitempty" json:"defaultView,omitempty"` // dashboard, planner, etc.
	Language        string `bson:"language,omitempty" json:"language,omitempty"`
	TimeZone        string `bson:"time_zone,omitempty" json:"timeZone,omitempty"`
	HighContrast    bool   `bson:"high_contrast,omitempty" json:"highContrast,omitempty"`
	PrivacyMode     bool   `bson:"privacy_mode,omitempty" json:"privacyMode,omitempty"`
	ReduceMotion    bool   `bson:"reduce_motion,omitempty" json:"reduceMotion,omitempty"`
	TwentyFourHour  bool   `bson:"twenty_four_hour,omitempty" json:"twentyFourHour,omitempty"`
}