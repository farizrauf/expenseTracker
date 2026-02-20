package services

import (
	"github.com/antigravity/finance-tracker/models"
	"github.com/antigravity/finance-tracker/repositories"
)

type TransactionService struct {
	repo *repositories.TransactionRepository
}

func NewTransactionService(repo *repositories.TransactionRepository) *TransactionService {
	return &TransactionService{repo}
}

func (s *TransactionService) Create(t *models.Transaction) error {
	return s.repo.Create(t)
}

func (s *TransactionService) Update(t *models.Transaction) error {
	return s.repo.Update(t)
}

func (s *TransactionService) Delete(id uint, userID uint) error {
	return s.repo.Delete(id, userID)
}

func (s *TransactionService) GetAll(userID uint, filter map[string]interface{}) ([]models.Transaction, error) {
	return s.repo.FindAll(userID, filter)
}

func (s *TransactionService) GetDashboard(userID uint, month int, year int) (map[string]interface{}, error) {
	summary, err := s.repo.GetSummary(userID, month, year)
	if err != nil {
		return nil, err
	}

	income := summary["income"]
	expense := summary["expense"]
	balance := income - expense

	// Get last 5 transactions (unfiltered for now to show context, or could be filtered)
	lastTransactions, err := s.repo.FindAll(userID, map[string]interface{}{})
	if err != nil {
		return nil, err
	}
	if len(lastTransactions) > 5 {
		lastTransactions = lastTransactions[:5]
	}

	// Get time-series data for the filtered month or last 7 days
	timeSeries, err := s.repo.GetTimeSeriesData(userID, month, year)
	if err != nil {
		return nil, err
	}

	// Get category breakdown for the filtered month
	breakdown, err := s.repo.GetCategoryBreakdown(userID, month, year)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_income":       income,
		"total_expense":      expense,
		"current_balance":    balance,
		"last_transactions":  lastTransactions,
		"time_series":        timeSeries,
		"category_breakdown": breakdown,
	}, nil
}
