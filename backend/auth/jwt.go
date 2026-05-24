package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/thekripaverse/student-analyzer-backend/config"
	"github.com/thekripaverse/student-analyzer-backend/models"
)

// JWTSecret is the secret key used to sign JWT tokens
var JWTSecret []byte

// tokenExpiryHours stores the token expiry duration in hours
var tokenExpiryHours int

// Initialize sets up the JWT middleware with configuration
func Initialize(cfg *config.Config) {
	JWTSecret = []byte(cfg.JWTSecret)
	tokenExpiryHours = cfg.TokenExpiry
}

// Claims represents the JWT claims
type Claims struct {
	UserID string `json:"user_id"`
	Username string `json:"username"`
	Role string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for a user
func GenerateToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(time.Duration(tokenExpiryHours) * time.Hour)
	claims := &Claims{
		UserID:   user.ID.Hex(),
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "student-analyzer",
			Subject:   user.ID.Hex(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(JWTSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the claims
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return JWTSecret, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, errors.New("token has expired")
		}
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// GetTokenFromRequest extracts the JWT token from the Authorization header
func GetTokenFromRequest(authHeader string) string {
	if authHeader == "" {
		return ""
	}

	// Expect format: "Bearer <token>"
	const bearerPrefix = "Bearer "
	if len(authHeader) > len(bearerPrefix) && authHeader[:len(bearerPrefix)] == bearerPrefix {
		return authHeader[len(bearerPrefix):]
	}

	return authHeader
}