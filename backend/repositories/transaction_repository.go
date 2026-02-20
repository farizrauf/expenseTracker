package repositories

import (
	"time"

	"github.com/antigravity/finance-tracker/models"
	"gorm.io/gorm"
)

type TransactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db}
}

func (r *TransactionRepository) Create(t *models.Transaction) error {
	return r.db.Create(t).Error
}

func (r *TransactionRepository) Update(t *models.Transaction) error {
	return r.db.Save(t).Error
}

func (r *TransactionRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Transaction{}).Error
}

func (r *TransactionRepository) FindByID(id uint, userID uint) (*models.Transaction, error) {
	var t models.Transaction
	err := r.db.Preload("Category").Where("id = ? AND user_id = ?", id, userID).First(&t).Error
	return &t, err
}

func (r *TransactionRepository) FindAll(userID uint, filter map[string]interface{}) ([]models.Transaction, error) {
	var transactions []models.Transaction
	query := r.db.Preload("Category").Where("user_id = ?", userID)

	if startDate, ok := filter["start_date"].(time.Time); ok {
		query = query.Where("date >= ?", startDate)
	}
	if endDate, ok := filter["end_date"].(time.Time); ok {
		query = query.Where("date <= ?", endDate)
	}
	if categoryID, ok := filter["category_id"].(uint); ok && categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}

	err := query.Order("date desc").Find(&transactions).Error
	return transactions, err
}

func (r *TransactionRepository) GetSummary(userID uint) (map[string]float64, error) {
	var results []struct {
		Type  string
		Total float64
	}
	err := r.db.Model(&models.Transaction{}).
		Select("type, sum(amount) as total").
		Where("user_id = ?", userID).
		Group("type").
		Scan(&results).Error

	summary := make(map[string]float64)
	for _, res := range results {
		summary[res.Type] = res.Total
	}
	return summary, err
}
