package handler

import (
	"net/http"
	"os"

	"github.com/antigravity/finance-tracker/config"
	"github.com/antigravity/finance-tracker/controllers"
	"github.com/antigravity/finance-tracker/repositories"
	"github.com/antigravity/finance-tracker/routes"
	"github.com/antigravity/finance-tracker/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var app *gin.Engine

func init() {
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
	transCtrl := controllers.NewTransactionController(transService, catService)

	// Setup Gin
	gin.SetMode(gin.ReleaseMode)
	app = gin.New()
	app.Use(gin.Recovery())

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
}

func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
