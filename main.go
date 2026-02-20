package main

import (
	"log"
	"os"

	"github.com/antigravity/finance-tracker/config"
	"github.com/antigravity/finance-tracker/controllers"
	"github.com/antigravity/finance-tracker/repositories"
	"github.com/antigravity/finance-tracker/routes"
	"github.com/antigravity/finance-tracker/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize DB
	config.InitDB()

	// Initialize Repositories
	userRepo := repositories.NewUserRepository(config.DB)
	catRepo := repositories.NewCategoryRepository(config.DB)
	transRepo := repositories.NewTransactionRepository(config.DB)

	// Initialize Services
	authService := services.NewAuthService(userRepo)
	catService := services.NewCategoryService(catRepo)
	transService := services.NewTransactionService(transRepo)

	// Initialize Controllers
	authCtrl := controllers.NewAuthController(authService)
	catCtrl := controllers.NewCategoryController(catService)
	transCtrl := controllers.NewTransactionController(transService)

	// Setup Gin
	app := gin.Default()

	// Middleware
	frontendURL := os.Getenv("FRONTEND_URL")
	allowedOrigins := []string{"http://localhost:5173", "http://localhost:3000"}
	if frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Setup Routes
	routes.SetupRoutes(app, authCtrl, catCtrl, transCtrl)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := app.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
