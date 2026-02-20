package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/antigravity/finance-tracker/models"
	"github.com/antigravity/finance-tracker/services"
	"github.com/gin-gonic/gin"
)

type TransactionController struct {
	service *services.TransactionService
}

func NewTransactionController(service *services.TransactionService) *TransactionController {
	return &TransactionController{service}
}

func (ctrl *TransactionController) Create(c *gin.Context) {
	var input struct {
		Type        string    `json:"type" binding:"required"`
		Amount      float64   `json:"amount" binding:"required"`
		CategoryID  uint      `json:"category_id" binding:"required"`
		Description string    `json:"description"`
		Date        time.Time `json:"date" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.MustGet("user_id").(uint)
	transaction := &models.Transaction{
		UserID:      userID,
		Type:        input.Type,
		Amount:      input.Amount,
		CategoryID:  input.CategoryID,
		Description: input.Description,
		Date:        input.Date,
	}

	if err := ctrl.service.Create(transaction); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

func (ctrl *TransactionController) GetAll(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	filter := make(map[string]interface{})
	if catIDStr := c.Query("category_id"); catIDStr != "" {
		id, _ := strconv.Atoi(catIDStr)
		filter["category_id"] = uint(id)
	}
	// Add more filters (date range) if needed

	transactions, err := ctrl.service.GetAll(userID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

func (ctrl *TransactionController) GetDashboard(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	data, err := ctrl.service.GetDashboard(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dashboard data"})
		return
	}

	c.JSON(http.StatusOK, data)
}

func (ctrl *TransactionController) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	userID := c.MustGet("user_id").(uint)

	if err := ctrl.service.Delete(uint(id), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted"})
}

func (ctrl *TransactionController) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	userID := c.MustGet("user_id").(uint)

	var input struct {
		Type        string    `json:"type" binding:"required"`
		Amount      float64   `json:"amount" binding:"required"`
		CategoryID  uint      `json:"category_id" binding:"required"`
		Description string    `json:"description"`
		Date        time.Time `json:"date" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction := &models.Transaction{
		ID:          uint(id),
		UserID:      userID,
		Type:        input.Type,
		Amount:      input.Amount,
		CategoryID:  input.CategoryID,
		Description: input.Description,
		Date:        input.Date,
	}

	if err := ctrl.service.Update(transaction); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transaction"})
		return
	}

	c.JSON(http.StatusOK, transaction)
}
