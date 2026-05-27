package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Feedback represents scholar testimonial reviews
type Feedback struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Text      string             `bson:"text" json:"text"`
	Name      string             `bson:"name" json:"name"`
	Role      string             `bson:"role" json:"role"`
	Avatar    string             `bson:"avatar" json:"avatar"`
	Rating    int                `bson:"rating" json:"rating"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
}
