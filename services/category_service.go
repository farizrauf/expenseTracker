package services

import (
	"github.com/antigravity/finance-tracker/models"
	"github.com/antigravity/finance-tracker/repositories"
)

type CategoryService struct {
	repo *repositories.CategoryRepository
}

func NewCategoryService(repo *repositories.CategoryRepository) *CategoryService {
	return &CategoryService{repo}
}

func (s *CategoryService) Create(userID uint, name string) error {
	category := &models.Category{
		UserID: &userID,
		Name:   name,
	}
	return s.repo.Create(category)
}

func (s *CategoryService) GetAll(userID uint) ([]models.Category, error) {
	return s.repo.FindAll(userID)
}

func (s *CategoryService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *CategoryService) GetOrCreateByName(userID uint, name string) (*models.Category, error) {
	return s.repo.GetOrCreateByName(userID, name)
}
