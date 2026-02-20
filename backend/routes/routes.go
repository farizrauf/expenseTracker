package routes

import (
	"github.com/antigravity/finance-tracker/controllers"
	"github.com/antigravity/finance-tracker/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	r *gin.Engine,
	authCtrl *controllers.AuthController,
	catCtrl *controllers.CategoryController,
	transCtrl *controllers.TransactionController,
) {
	api := r.Group("/api")
	{
		// Auth Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authCtrl.Register)
			auth.POST("/login", authCtrl.Login)
		}

		// Protected Routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Category Routes
			categories := protected.Group("/categories")
			{
				categories.GET("", catCtrl.GetAll)
				categories.POST("", catCtrl.Create)
				categories.DELETE("/:id", catCtrl.Delete)
			}

			// Transaction Routes
			transactions := protected.Group("/transactions")
			{
				transactions.GET("", transCtrl.GetAll)
				transactions.POST("", transCtrl.Create)
				transactions.DELETE("/:id", transCtrl.Delete)
				transactions.GET("/dashboard", transCtrl.GetDashboard)
			}
		}
	}
}
