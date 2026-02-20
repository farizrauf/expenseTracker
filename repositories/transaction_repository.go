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

func (r *TransactionRepository) GetSummary(userID uint, month int, year int) (map[string]float64, error) {
	var results []struct {
		Type  string
		Total float64
	}

	query := r.db.Model(&models.Transaction{}).
		Select("type, sum(amount) as total").
		Where("user_id = ?", userID)

	if month > 0 && year > 0 {
		startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
		endDate := startDate.AddDate(0, 1, 0)
		query = query.Where("date >= ? AND date < ?", startDate, endDate)
	}

	err := query.Group("type").Scan(&results).Error

	summary := make(map[string]float64)
	for _, res := range results {
		summary[res.Type] = res.Total
	}
	return summary, err
}

func (r *TransactionRepository) GetTimeSeriesData(userID uint, month int, year int) ([]map[string]interface{}, error) {
	var results []struct {
		Date  time.Time
		Type  string
		Total float64
	}

	loc, _ := time.LoadLocation("Asia/Jakarta")
	var startDate, endDate time.Time

	if month > 0 && year > 0 {
		startDate = time.Date(year, time.Month(month), 1, 0, 0, 0, 0, loc)
		endDate = startDate.AddDate(0, 1, 0)
	} else {
		now := time.Now().In(loc)
		startDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc).AddDate(0, 0, -6)
		endDate = now.Add(24 * time.Hour)
	}

	err := r.db.Model(&models.Transaction{}).
		Select("DATE(date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') as date, type, sum(amount) as total").
		Where("user_id = ? AND date >= ? AND date < ?", userID, startDate, endDate).
		Group("1, type").
		Order("1 asc").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

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

	var timeSeries []map[string]interface{}
	curr := startDate
	for curr.Before(endDate) {
		// If filtering by current month, stop at today
		if month == int(time.Now().Month()) && year == time.Now().Year() && curr.After(time.Now()) {
			break
		}
		// If default 7 days, stop at 7
		if month <= 0 && curr.After(time.Now()) {
			break
		}

		d := curr.Format("2006-01-02")
		if val, ok := timeSeriesMap[d]; ok {
			timeSeries = append(timeSeries, val)
		} else {
			timeSeries = append(timeSeries, map[string]interface{}{
				"date":    d,
				"income":  0.0,
				"expense": 0.0,
			})
		}
		curr = curr.AddDate(0, 0, 1)
	}

	return timeSeries, nil
}

func (r *TransactionRepository) GetCategoryBreakdown(userID uint, month int, year int) ([]map[string]interface{}, error) {
	var results []struct {
		CategoryName string  `json:"category_name"`
		Total        float64 `json:"total"`
	}

	query := r.db.Model(&models.Transaction{}).
		Select("categories.name as category_name, sum(amount) as total").
		Joins("left join categories on categories.id = transactions.category_id").
		Where("transactions.user_id = ? AND transactions.type = 'expense'", userID)

	if month > 0 && year > 0 {
		startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
		endDate := startDate.AddDate(0, 1, 0)
		query = query.Where("transactions.date >= ? AND transactions.date < ?", startDate, endDate)
	}

	err := query.Group("categories.name").Order("total desc").Scan(&results).Error
	if err != nil {
		return nil, err
	}

	var breakdown []map[string]interface{}
	for _, res := range results {
		name := res.CategoryName
		if name == "" {
			name = "Uncategorized"
		}
		breakdown = append(breakdown, map[string]interface{}{
			"name":  name,
			"value": res.Total,
		})
	}

	return breakdown, nil
}
