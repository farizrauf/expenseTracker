# Finance Tracker App - Fullstack Fintech UI

Modern, responsive finance tracker built with Golang (Gin), React (Vite), and PostgreSQL.

## 🚀 Features

- **Auth**: JWT-based login/register with bcrypt hashing.
- **Dashboard**: Interactive charts (Recharts) with balance & 5 latest transactions.
- **Transactions**: CRUD operations for incomes/expenses with category filtering.
- **Modern UI**: Fintech aesthetic, responsive, glassmorphism, and animations.
- **DevOps**: Fully containerized with Docker & Docker Compose.

---

## 🛠️ Local Setup (Manual)

### Backend

1. Go to `backend/` folder.
2. Run `go mod download`.
3. Configure `.env` (DB credentials).
4. Run `go run main.go`.

### Frontend

1. Go to `frontend/` folder.
2. Run `npm install`.
3. Run `npm run dev`.

---

## 🐳 Running with Docker (Recommended)

1. Clone this repository.
2. Make sure Docker is running.
3. Run:
   ```bash
   docker-compose up --build
   ```
4. Access app at `http://localhost`.

---

## ☁️ Deployment Guide (VPS)

### 1. Prerequisite

- VPS with Ubuntu/Debian.
- Docker & Docker Compose installed.
- Nginx (for reverse proxy).

### 2. Steps

- Copy project to VPS.
- Run `docker-compose up -d`.
- Setup Nginx as reverse proxy to `localhost:80`.

### 3. Nginx Example Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
    }
}
```

### 4. Setup HTTPS (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 Database Schema

- **Users**: Authentication and profile data.
- **Categories**: Income/Expense types (Support custom user categories).
- **Transactions**: Financial records linked to users and categories.
