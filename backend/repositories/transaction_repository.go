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

func (r *TransactionRepository) GetTimeSeriesData(userID uint, days int) ([]map[string]interface{}, error) {
	var results []struct {
		Date  time.Time
		Type  string
		Total float64
	}

	startDate := time.Now().AddDate(0, 0, -days)

	err := r.db.Model(&models.Transaction{}).
		Select("DATE(date) as date, type, sum(amount) as total").
		Where("user_id = ? AND date >= ?", userID, startDate).
		Group("DATE(date), type").
		Order("DATE(date) asc").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// Group by date for frontend ease of use
	timeSeriesMap := make(map[string]map[string]interface{})
	for _, res := range results {
		dateStr := res.Date.Format("2006-01-02")
		if _, ok := timeSeriesMap[dateStr]; !ok {
			timeSeriesMap[dateStr] = map[string]interface{}{
				"date":    dateStr,
				"income":  0.0,
				"expense": 0.0,
			}
		}
		if res.Type == "income" {
			timeSeriesMap[dateStr]["income"] = res.Total
		} else {
			timeSeriesMap[dateStr]["expense"] = res.Total
		}
	}

	// Convert map back to sorted slice
	var timeSeries []map[string]interface{}
	for i := days; i >= 0; i-- {
		d := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
		if val, ok := timeSeriesMap[d]; ok {
			timeSeries = append(timeSeries, val)
		} else {
			timeSeries = append(timeSeries, map[string]interface{}{
				"date":    d,
				"income":  0.0,
				"expense": 0.0,
			})
		}
	}

	return timeSeries, nil
}
