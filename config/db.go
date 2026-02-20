package config

import (
	"fmt"
	"log"
	"os"

	"github.com/antigravity/finance-tracker/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	dbURL := os.Getenv("DATABASE_URL")
	var dsn string

	if dbURL != "" {
		dsn = dbURL
	} else {
		dbHost := os.Getenv("DB_HOST")
		dbUser := os.Getenv("DB_USER")
		dbPassword := os.Getenv("DB_PASSWORD")
		dbName := os.Getenv("DB_NAME")
		dbPort := os.Getenv("DB_PORT")
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
			dbHost, dbUser, dbPassword, dbName, dbPort)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migration
	err = db.AutoMigrate(&models.User{}, &models.Category{}, &models.Transaction{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db
	seedCategories(db)
	log.Println("Database connected, migrated, and seeded successfully")
}

func seedCategories(db *gorm.DB) {
	defaultCategories := []string{
		"Salary", "Freelance", "Investment", "Gift", "Bonus", // Income-friendly
		"Food & Beverage", "Transportation", "Shopping", "Rent", // Expense-friendly
		"Utilities", "Entertainment", "Health", "Education",
	}

	for _, name := range defaultCategories {
		var count int64
		db.Model(&models.Category{}).Where("name = ? AND user_id IS NULL", name).Count(&count)
		if count == 0 {
			cat := models.Category{
				Name:   name,
				UserID: nil,
			}
			if err := db.Create(&cat).Error; err != nil {
				log.Printf("Warning: Failed to seed category %s: %v", name, err)
			}
		}
	}
}
