package utils

import (
	"os"
	"testing"
)

func TestHashAndCheckPassword(t *testing.T) {
	password := "my_secret_password"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if !CheckPasswordHash(password, hash) {
		t.Errorf("CheckPasswordHash failed for correct password")
	}

	if CheckPasswordHash("wrong_password", hash) {
		t.Errorf("CheckPasswordHash succeeded for wrong password")
	}
}

func TestGenerateAndValidateToken(t *testing.T) {
	os.Setenv("JWT_SECRET", "test_secret")
	defer os.Unsetenv("JWT_SECRET")

	var userID uint = 123
	token, err := GenerateToken(userID)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	validatedID, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if validatedID != userID {
		t.Errorf("Expected user ID %d, got %d", userID, validatedID)
	}
}
