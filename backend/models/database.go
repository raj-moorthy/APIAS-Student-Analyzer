package models

import (
	"context"
	"log"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Singleton pattern: one client, one connection pool, shared across all requests.
var (
	once      sync.Once
	db        *mongo.Client
	dbInitErr error
)

// InitDB connects to MongoDB once at startup and keeps the connection alive.
// Call this from main() before starting the HTTP server.
func InitDB(uri string) error {
	once.Do(func() {
		log.Println("Connecting to MongoDB Atlas...")

		clientOpts := options.Client().
			ApplyURI(uri).
			SetConnectTimeout(15 * time.Second).
			SetServerSelectionTimeout(15 * time.Second).
			SetSocketTimeout(30 * time.Second).
			SetMaxPoolSize(50).
			SetMinPoolSize(5).
			SetMaxConnIdleTime(5 * time.Minute)

		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		client, err := mongo.Connect(ctx, clientOpts)
		if err != nil {
			dbInitErr = err
			log.Printf("MongoDB connect error: %v", err)
			return
		}

		// Verify the connection is alive.
		if err = client.Ping(ctx, readpref.Primary()); err != nil {
			dbInitErr = err
			log.Printf("MongoDB ping error: %v", err)
			return
		}

		db = client
		log.Println("Connected to MongoDB Atlas successfully!")
	})
	return dbInitErr
}

// GetDB returns the singleton MongoDB client.
// Panics if InitDB has not been called or failed — this surfaces misuse early.
func GetDB() *mongo.Client {
	if db == nil {
		panic("MongoDB client is nil — call models.InitDB() before using GetDB()")
	}
	return db
}

// GetCollection returns a collection from the student_analyzer database.
func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	return client.Database("student_analyzer").Collection(collectionName)
}

// ConnectDB is kept for backward-compatibility but now delegates to the singleton.
// New code should call GetDB() directly.
func ConnectDB(uri string) (*mongo.Client, error) {
	if err := InitDB(uri); err != nil {
		return nil, err
	}
	return GetDB(), nil
}

// DisconnectDB closes the MongoDB connection pool gracefully (call on shutdown).
func DisconnectDB() {
	if db != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := db.Disconnect(ctx); err != nil {
			log.Printf("Error disconnecting MongoDB: %v", err)
		} else {
			log.Println("MongoDB connection closed.")
		}
	}
}