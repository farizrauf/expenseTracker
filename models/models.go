package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:100;not null" json:"name"`
	Email     string         `gorm:"size:100;uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"size:255;not null" json:"-"`
	Role      string         `gorm:"size:20;default:'user'" json:"role"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Category struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    *uint          `json:"user_id"` // Nullable for default categories
	Name      string         `gorm:"size:100;not null" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Transaction struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UserID       uint           `gorm:"not null" json:"user_id"`
	User         User           `gorm:"foreignKey:UserID" json:"-"`
	Type         string         `gorm:"size:20;not null" json:"type"` // income or expense
	CategoryID   uint           `gorm:"not null" json:"category_id"`
	Category     Category       `gorm:"foreignKey:CategoryID" json:"category"`
	Amount       float64        `gorm:"type:decimal(15,2);not null" json:"amount"`
	Description  string         `gorm:"size:255" json:"description"`
	Date         time.Time      `gorm:"not null" json:"date"`
	CategoryName string         `gorm:"-" json:"category_name"` // Flattens category name for frontend
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
