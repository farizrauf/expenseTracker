package services

import (
	"errors"

	"github.com/antigravity/finance-tracker/models"
	"github.com/antigravity/finance-tracker/repositories"
	"github.com/antigravity/finance-tracker/utils"
)

type AuthService struct {
	userRepo *repositories.UserRepository
}

func NewAuthService(userRepo *repositories.UserRepository) *AuthService {
	return &AuthService{userRepo}
}

func (s *AuthService) Register(name, email, password string) error {
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: hashedPassword,
	}

	return s.userRepo.Create(user)
}

func (s *AuthService) Login(email, password string) (string, *models.User, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return "", nil, errors.New("invalid email or password")
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return "", nil, errors.New("invalid email or password")
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}
