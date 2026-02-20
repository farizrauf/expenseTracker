package controllers

import (
	"net/http"
	"strconv"

	"github.com/antigravity/finance-tracker/services"
	"github.com/gin-gonic/gin"
)

type CategoryController struct {
	service *services.CategoryService
}

func NewCategoryController(service *services.CategoryService) *CategoryController {
	return &CategoryController{service}
}

func (ctrl *CategoryController) Create(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.MustGet("user_id").(uint)
	if err := ctrl.service.Create(userID, input.Name); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Category created"})
}

func (ctrl *CategoryController) GetAll(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	categories, err := ctrl.service.GetAll(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, categories)
}

func (ctrl *CategoryController) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := ctrl.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
}
