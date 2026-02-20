package repositories

import (
	"github.com/antigravity/finance-tracker/models"
	"gorm.io/gorm"
)

type CategoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db}
}

func (r *CategoryRepository) Create(category *models.Category) error {
	return r.db.Create(category).Error
}

func (r *CategoryRepository) FindAll(userID uint) ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Where("user_id = ? OR user_id IS NULL", userID).Find(&categories).Error
	return categories, err
}

func (r *CategoryRepository) FindByID(id uint) (*models.Category, error) {
	var category models.Category
	err := r.db.First(&category, id).Error
	return &category, err
}

func (r *CategoryRepository) Delete(id uint) error {
	return r.db.Delete(&models.Category{}, id).Error
}

func (r *CategoryRepository) GetOrCreateByName(userID uint, name string) (*models.Category, error) {
	var category models.Category
	err := r.db.Where("(user_id = ? OR user_id IS NULL) AND name = ?", userID, name).First(&category).Error
	if err == gorm.ErrRecordNotFound {
		category = models.Category{
			UserID: &userID,
			Name:   name,
		}
		if err := r.db.Create(&category).Error; err != nil {
			return nil, err
		}
		return &category, nil
	}
	return &category, err
}
