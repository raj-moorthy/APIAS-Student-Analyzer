package config

import (
	"log"
	"os"
	"fmt"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	Environment string
	MongoURI    string
	ServerPort  string
	JWTSecret   string
	TokenExpiry int // in hours
	SMTPHost    string
	SMTPPort    string
	SMTPUser    string
	SMTPPass    string
}

var envOnce sync.Once

// LoadConfig loads configuration from environment variables or .env file
func LoadConfig() (*Config, error) {
	// Load .env file if it exists, exactly once to prevent concurrent map writes in os.Environ
	envOnce.Do(func() {
		err := godotenv.Load()
		if err != nil {
			log.Println("No .env file found, using environment variables")
		}
	})

	config := &Config{
		Environment: getEnv("ENVIRONMENT", "development"),
		MongoURI:    getEnv("MONGO_URI", "mongodb://localhost:27017/student_analyzer"),
		ServerPort:  getEnv("PORT", getEnv("SERVER_PORT", "8080")),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
		SMTPHost:    getEnv("SMTP_HOST", ""),
		SMTPPort:    getEnv("SMTP_PORT", "587"),
		SMTPUser:    getEnv("SMTP_USER", ""),
		SMTPPass:    getEnv("SMTP_PASS", ""),
	}

	// Parse token expiry
	tokenExpiry := getEnv("TOKEN_EXPIRY_HOURS", "24")
	var expiry int
	if _, err := fmt.Sscanf(tokenExpiry, "%d", &expiry); err != nil {
		expiry = 24
	}
	config.TokenExpiry = expiry

	return config, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}