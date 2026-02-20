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
	"github.com/joho/godotenv"
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
	r := gin.Default()

	// Middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"}, // Vite defaults
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Setup Routes
	routes.SetupRoutes(r, authCtrl, catCtrl, transCtrl)

	// Start Server
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}
