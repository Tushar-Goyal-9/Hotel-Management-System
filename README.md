# 🏨 Hotel Management System – Backend with Admin Dashboard

A **backend-focused** hotel management system built with **Node.js**, **Express.js**, and **MySQL**.  
Includes a **functional admin dashboard** (HTML/CSS/JS) for demonstration and real-time testing of all backend features.

> ⚡ **Note:** This project is primarily backend-driven. The frontend dashboard is kept simple to focus on core backend functionality – authentication, room/booking management, double-booking prevention, and billing logic.

---

## 📌 Project Overview

This project demonstrates backend development skills through a complete hotel management system:

- **Admin authentication** using JWT (JSON Web Tokens)
- **Room management** – CRUD operations with pagination
- **Booking system** – Create, update, cancel with automatic price calculation
- **Double-booking prevention** – Real-time room availability checking
- **Billing & payments** – Track payments, calculate due amounts
- **RESTful API design** – Clean, consistent endpoint structure
- **Admin dashboard** – Simple UI to test and demonstrate all features

---

## 🛠️ Tech Stack

### Backend (Core Focus)
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API framework |
| **MySQL** | Relational database |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **dotenv** | Environment configuration |

### Dashboard (Demonstration UI)
| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **CSS3** | Styling with professional design |
| **Vanilla JavaScript** | API integration, dynamic updates |

### Development
| Tool | Purpose |
|------|---------|
| **Nodemon** | Auto-restart during development |
| **MySQL Workbench** | Database management |
| **Git & GitHub** | Version control |

---

## 📂 Project Structure

```text
hotel-management-system/
│
├── config/
│   └── db.js                    # MySQL connection pool
│
├── controllers/                  # Business logic
│   ├── authController.js        # Login, JWT generation
│   ├── roomController.js        # Room CRUD + availability
│   ├── bookingController.js     # Booking CRUD + double-booking prevention
│   └── paymentController.js     # Payment recording, billing
│
├── middleware/                   # Request processing
│   ├── auth.js                  # JWT verification
│   └── validation.js            # Input validation rules
│
├── routes/                       # API endpoints
│   ├── authRoutes.js            # POST /api/auth/login
│   ├── roomRoutes.js            # /api/rooms (CRUD + availability)
│   ├── bookingRoutes.js         # /api/bookings (CRUD + cancel)
│   └── paymentRoutes.js         # /api/payments (record + bill)
│
├── public/                       # Admin dashboard
│   └── index.html               # Simple UI for API demonstration
│
├── sql/
│   └── schema.sql               # Complete database schema
│
├── .env                          # Environment variables (not committed)
├── .gitignore
├── package.json
├── server.js                     # Application entry point
└── README.md
```

## 🔐 Core Backend Features

### 1. Authentication System
- **JWT-based authentication** with 8-hour expiry
- **bcrypt password hashing** – no plain-text storage
- **Protected routes** – all APIs require valid token
- **Environment variables** for sensitive configuration

---

### 2. Room Management API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rooms` | GET | Get rooms (paginated: `?page=1&limit=10`) |
| `/api/rooms/availability` | GET | Get available rooms for date range |
| `/api/rooms/:id` | GET | Get single room |
| `/api/rooms` | POST | Create new room |
| `/api/rooms/:id` | PUT | Update room |
| `/api/rooms/:id` | DELETE | Delete room (fails if has bookings) |

**Features:**
- Pagination support for large datasets
- Filter by room type
- Search by room number
- Sort by any column (ID, number, type, price)

---

### 3. Booking System (Core Logic)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings` | GET | Get bookings (filter by status) |
| `/api/bookings/:id` | GET | Get single booking |
| `/api/bookings` | POST | Create booking |
| `/api/bookings/:id` | PUT | Update booking |
| `/api/bookings/:id` | DELETE | Cancel booking |

**Business Logic Implemented:**

| ✅ | Feature | Description |
|----|---------|-------------|
| ✅ | **Double-booking prevention** | SQL query checks overlapping dates |
| ✅ | **Automatic price calculation** | Nights × room price per night |
| ✅ | **Date validation** | Check-in cannot be in past, check-out must be after check-in |
| ✅ | **Booking status management** | confirmed → completed (auto after check-out) |
| ✅ | **Soft delete** | Cancelled bookings remain in database for records |

---

### 4. Billing & Payment System

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments` | POST | Record payment against booking |
| `/api/payments/bill/:bookingId` | GET | Get complete bill |

**Features:**
- Calculate total stay cost (nights × price)
- Track multiple payments per booking
- Prevent overpayment (validation)
- Show due amount after payments
- Payment methods: cash, card, online

---


### Tables

| Table | Primary Key | Foreign Keys | Description |
|-------|-------------|--------------|-------------|
| **users** | id | - | Admin users (authentication) |
| **rooms** | id | - | Room details + availability status |
| **bookings** | id | room_id, created_by | Booking records with date range |
| **payments** | id | booking_id | Payment transactions |


---

## 🖥️ Admin Dashboard Features

The dashboard is a **demonstration UI** to test and showcase backend functionality:

### Room Management View
- View all rooms with real-time availability status
- Add new rooms (number, type, price)
- Delete rooms (validation prevents deletion if has bookings)
- Filter by room type (Standard/Deluxe/Suite/Presidential)
- Search by room number
- Sortable columns (click on headers)
- Visual status badges (Available/Booked/Free/Maintenance)

### Booking Creation
- **Two-level categorized dropdown:**
  1. Select room type
  2. Select specific free room (auto-populated)
- Date pickers for check-in/check-out
- Automatic total price calculation (backend)
- Real-time availability check

### Booking Management
- View all bookings with status badges
- Filter by status (All/Confirmed/Cancelled/Completed)
- Cancel active bookings (soft delete)
- Auto-update completed bookings after check-out date

### Dashboard Highlights
- Responsive layout
- Professional color scheme
- Emoji icons for visual clarity
- Real-time updates (no page refresh needed)

---

## 🚀 How to Run Locally

### Prerequisites

Make sure you have installed:

- Node.js (**v16 or higher**)
- MySQL (**v8 or higher**)
- Git

---

## Step 1: Clone Repository

```bash
git clone https://github.com/Tushar-Goyal-9/Hotel-Management-System.git
cd Hotel-Management-System
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Set Up Database

Open MySQL and run:

```bash
mysql -u root -p < sql/schema.sql
```

Or if using MySQL Workbench:

- Open `sql/schema.sql`
- Execute the script

---

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_super_secret_jwt_key_here
```

---

## Step 5: Start Server

Development mode (auto restart):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

---

## Step 6: Access Application

- **Dashboard:** http://localhost:5000

---

# 🔐 Default Admin Credentials

| Field | Value |
|------|-------|
| Email | tushar@example.com |
| Password | admin123 |

---

# 📊 Sample Data (Pre-loaded)

| Room | Type | Price/Night |
|------|------|------------|
| 101 | Standard | $80 |
| 102 | Standard | $80 |
| 201 | Deluxe | $120 |
| 202 | Deluxe | $120 |
| 301 | Suite | $200 |

---

# ✨ Key Backend Concepts Demonstrated

| Concept | Implementation |
|--------|---------------|
| RESTful API Design | Proper HTTP methods, status codes, and resource naming |
| JWT Authentication | Token generation, verification, protected routes |
| Password Security | bcrypt hashing, no plain-text password storage |
| Database Normalization | 4 tables with proper relationships |
| Foreign Key Constraints | Data integrity using `ON DELETE RESTRICT` |
| Query Optimization | Composite index for faster availability checks |
| Double-Booking Prevention | Overlapping date SQL validation |
| Request Validation | `express-validator` middleware |
| Error Handling | Global error handler with consistent API responses |
| Pagination | `limit` and `offset` support |
| Environment Configuration | Separate configs for development and production |
| MVC Architecture | Clear separation of controllers, models, and routes |

---


# 📈 What I Learned

## Backend Development

- Building RESTful APIs with proper architecture
- Implementing secure authentication using JWT + bcrypt
- Writing complex SQL queries for availability checking
- Database design with relationships and constraints
- Proper error handling and request validation
- Environment-based configuration management

---

## Database Design

- Database normalization principles
- Eliminating redundant data
- Foreign key constraints for data integrity
- Indexing strategies for better query performance
- Generated columns for automatic calculations

---

## Project Management

- Git workflow and version control
- Development vs production environment setup
- Preparing backend projects for deployment

---

# 👨‍💻 Developer

**Tushar Goyal**

- GitHub: [@Tushar-Goyal-9](https://github.com/Tushar-Goyal-9)

---

# 🚧 Future Enhancements

| Feature | Description |
|--------|-------------|
| Email Notifications | Send booking confirmations using Nodemailer |
| Rate Limiting | Prevent API abuse using express-rate-limit |
| API Versioning | Support versioned endpoints (`/api/v2`) |
| Logging | Request/response logging using Winston |
| Unit Testing | Add Jest/Mocha test coverage |
| Swagger/OpenAPI | Auto-generated API documentation |
| Refresh Tokens | Better JWT session management |
| Redis Caching | Cache frequently requested data |
| WebSocket Notifications | Real-time booking updates |

---

# 📄 License

MIT License — Free for learning and commercial use.

---

# 🙏 Acknowledgments

- **Express.js** — Minimalist backend web framework
- **MySQL Community** — Reliable relational database
- **bcrypt.js** — Secure password hashing
- **jsonwebtoken** — JWT implementation
- Open-source contributors

---
