# 🏨 Hotel Management System – Backend REST API & Admin Dashboard

![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

A production-ready **backend-focused** hotel management system built with **Node.js**, **Express.js**, and **MySQL**. Includes a **functional single-page admin dashboard** (HTML/CSS/JS) for demonstration, real-time testing, and end-to-end evaluation of all backend features.

---

## 📌 Project Overview

This project showcases production-grade backend engineering practices:

- 🔐 **JWT Authentication & Security** – Password hashing with `bcryptjs`, environment separation, protected API routes.
- 🏨 **Room Management API** – Full CRUD operations, filtering by room type, searching, column sorting, and pagination.
- 📅 **Booking Engine Logic** – Real-time availability verification, **double-booking prevention** via SQL date-overlap logic (`check_in < new_checkout AND check_out > new_checkin`), and auto total price calculation.
- 💳 **Billing & Multi-Payment System** – Multi-payment recording per booking, support for room payments and additional services (extras), automatic due amount computation.
- 🛡️ **Request Validation & Error Handling** – Middleware input validation using `express-validator` and centralized error handling.
- 🖥️ **Admin Demonstration UI** – Responsive, real-time dashboard to test and interact with all backend endpoints.

---

## 🛠️ Tech Stack & Architecture

### Backend (Core Focus)
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js (v5)** | REST API routing & middleware architecture |
| **MySQL (v8)** | Relational database management system |
| **mysql2/promise** | Asynchronous MySQL connection pooling |
| **JWT (jsonwebtoken)** | Secure stateless session tokens (8h expiration) |
| **bcryptjs** | Password hashing algorithm |
| **express-validator** | Request payload sanitizer & validator |
| **dotenv** | Environment variable management |

### Dashboard (Demonstration UI)
| Technology | Purpose |
|------------|---------|
| **HTML5 & CSS3** | Clean, responsive modern layout |
| **Vanilla JavaScript** | Asynchronous Fetch API client with `localStorage` token management |

---

## 🏗️ System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────┐
│              Client / Dashboard / Postman               │
└────────────────────────────┬────────────────────────────┘
                             │ (HTTP / Bearer Token)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Express App (server.js)                 │
├────────────────────────────┬────────────────────────────┤
│  Middleware: CORS, JSON    │  Static Dashboard Host     │
└────────────────────────────┬────────────────────────────┘
                             │
     ┌───────────────────────┴───────────────────────┐
     ▼                                               ▼
[ Auth Routes ]                              [ Protected Routes ]
  POST /api/auth/login                         /api/rooms, /api/bookings, /api/payments
                                                     │
                                                     ▼
                                           [ validation.js & auth.js ]
                                           (express-validator & JWT Verification)
                                                     │
                                                     ▼
                                           [ Controllers (Business Logic) ]
                                           (roomController, bookingController, paymentController)
                                                     │
                                                     ▼ (Connection Pool)
                                           [ MySQL Relational Database ]
                                           (users, rooms, bookings, payments)
```

---

## 📂 Project Structure

```text
hotel-management-system/
│
├── config/
│   └── db.js                    # MySQL connection pool & SSL settings
│
├── controllers/                 # Core business logic layer
│   ├── authController.js        # Admin login & JWT issuance
│   ├── roomController.js        # Room CRUD, availability queries, pagination
│   ├── bookingController.js     # Double-booking check, price calculation, auto-complete
│   └── paymentController.js     # Payment recording, bill generation, extras handling
│
├── middleware/                  # Request processing layer
│   ├── auth.js                  # Bearer token verification
│   └── validation.js            # Input sanitization & validation rules
│
├── routes/                      # RESTful endpoint definitions
│   ├── authRoutes.js            # POST /api/auth/login
│   ├── roomRoutes.js            # GET, POST, PUT, DELETE /api/rooms (+ /availability)
│   ├── bookingRoutes.js         # GET, POST, PUT, DELETE /api/bookings
│   └── paymentRoutes.js         # GET, POST /api/payments (+ /bill/:id)
│
├── public/                      # Admin dashboard SPA
│   └── index.html               # Real-time UI for API demonstration
│
├── sql/
│   └── schema.sql               # Database creation script, indexes & sample data
│
├── .env.example                 # Environment variable template
├── .gitignore                   # Excluded dependencies and secrets
├── package.json                 # Project dependencies and npm scripts
├── server.js                    # Express application entry point
└── README.md                    # System documentation
```

---

## 🔐 Core Backend Features & Business Logic

### 1. Authentication & Security
- Password stored using **bcrypt** salt hashing (`$2b$10$...`).
- **JWT token** generated upon login containing payload `{ id, email, role }`.
- Route protection enforced via `Bearer <token>` HTTP headers.

---

### 2. Room Management API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rooms` | GET | Get rooms with pagination (`?page=1&limit=10`) |
| `/api/rooms/availability` | GET | Check room availability for date range (`?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD`) |
| `/api/rooms/:id` | GET | Get single room by ID |
| `/api/rooms` | POST | Create new room (requires `room_number`, `type`, `price_per_night`) |
| `/api/rooms/:id` | PUT | Update room details |
| `/api/rooms/:id` | DELETE | Delete room (prevented if active bookings exist) |

---

### 3. Booking Engine & Business Rules

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings` | GET | List bookings (filterable by status: `confirmed`, `cancelled`, `completed`) |
| `/api/bookings/:id` | GET | Fetch booking details |
| `/api/bookings` | POST | Create new booking |
| `/api/bookings/:id` | PUT | Update booking dates/room (re-calculates price and re-verifies availability) |
| `/api/bookings/:id` | DELETE | Soft cancel booking (retains record for auditing) |

**Key Business Rules Implemented:**
- **Double-Booking Prevention**:
  ```sql
  SELECT COUNT(*) FROM bookings 
  WHERE room_id = ? AND status != 'cancelled' 
  AND check_in < ? AND check_out > ?
  ```
- **Automatic Price Computation**: Calculated as `Math.ceil((check_out - check_in) in days) * price_per_night`.
- **Automatic Completion**: Active bookings past their `check_out` date are dynamically transitioned from `confirmed` to `completed`.

---

### 4. Billing & Payments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments` | POST | Record payment transaction (`booking_id`, `amount`, `payment_method`) |
| `/api/payments` | GET | Fetch payment ledger |
| `/api/payments/bill/:id` | GET | Generate itemized bill for booking |

**Features:**
- Multi-payment tracking per booking.
- Accepts extra payments beyond room cost for additional hotel services (laundry, room service, etc.), surfaced as `Additional paid (extras)`.
- Prevents negative due amounts.

---

## 📡 Sample API Request & Response Payloads

### 🔑 1. Admin Login (`POST /api/auth/login`)
**Request:**
```json
{
  "email": "tushar@example.com",
  "password": "admin123"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "tushar@example.com",
    "role": "admin"
  }
}
```

---

### 🏨 2. Check Available Rooms (`GET /api/rooms/availability`)
**Query Parameters:** `?check_in=2026-10-01&check_out=2026-10-05`  
**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "room_number": "101",
      "type": "Standard",
      "price_per_night": "80.00",
      "status": "available"
    },
    {
      "id": 3,
      "room_number": "201",
      "type": "Deluxe",
      "price_per_night": "120.00",
      "status": "available"
    }
  ]
}
```

---

### 📅 3. Create Booking (`POST /api/bookings`)
**Headers:** `Authorization: Bearer <token>`  
**Request:**
```json
{
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "room_id": 1,
  "check_in": "2026-10-01",
  "check_out": "2026-10-05"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "room_id": 1,
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "check_in": "2026-10-01",
    "check_out": "2026-10-05",
    "total_price": 320.00,
    "created_by": 1,
    "status": "confirmed"
  }
}
```

---

### 💳 4. Get Itemized Bill (`GET /api/payments/bill/10`)
**Headers:** `Authorization: Bearer <token>`  
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": 10,
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "room_number": "101",
      "type": "Standard",
      "check_in": "2026-10-01",
      "check_out": "2026-10-05",
      "total_price": "320.00"
    },
    "payments": [
      {
        "id": 1,
        "booking_id": 10,
        "amount": "320.00",
        "payment_method": "card",
        "payment_date": "2026-09-16T22:30:00.000Z"
      }
    ],
    "total_price": 320,
    "total_paid": 320,
    "due_amount": 0
  }
}
```

---

## 🗄️ Database Schema Design

```text
 ┌──────────────────────┐        ┌──────────────────────┐
 │        users         │        │        rooms         │
 ├──────────────────────┤        ├──────────────────────┤
 │ id (PK, INT)         │        │ id (PK, INT)         │
 │ name (VARCHAR)       │        │ room_number (VARCHAR)│
 │ email (VARCHAR, UNQ) │        │ type (VARCHAR)       │
 │ password_hash (STR)  │        │ price_per_night (DEC)│
 │ role (ENUM)          │        │ status (ENUM)        │
 └──────────┬───────────┘        └──────────┬───────────┘
            │                               │
            │ 1:N                           │ 1:N
            ▼                               ▼
 ┌──────────────────────────────────────────────────────┐
 │                       bookings                       │
 ├──────────────────────────────────────────────────────┤
 │ id (PK, INT)                                         │
 │ room_id (FK -> rooms.id)                             │
 │ created_by (FK -> users.id)                          │
 │ guest_name / guest_email                             │
 │ check_in / check_out (DATE)                          │
 │ total_nights (GENERATED ALWAYS AS DATEDIFF)          │
 │ total_price (DECIMAL)                                │
 │ status ('confirmed', 'cancelled', 'completed')       │
 └──────────────────────────┬───────────────────────────┘
                            │
                            │ 1:N
                            ▼
 ┌──────────────────────────────────────────────────────┐
 │                       payments                       │
 ├──────────────────────────────────────────────────────┤
 │ id (PK, INT)                                         │
 │ booking_id (FK -> bookings.id)                       │
 │ amount (DECIMAL)                                     │
 │ payment_method ('cash', 'card', 'online')            │
 │ payment_date (TIMESTAMP)                             │
 └──────────────────────────────────────────────────────┘
```

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** (v16 or higher)
- **MySQL Server** (v8 or higher)
- **Git**

---

### Step 1: Clone Repository
```bash
git clone https://github.com/Tushar-Goyal-9/Hotel-Management-System.git
cd Hotel-Management-System
```

---

### Step 2: Install Dependencies
```bash
npm install
```

---

### Step 3: Database Setup
Import `sql/schema.sql` into MySQL:
```bash
mysql -u root -p < sql/schema.sql
```
*Or execute `sql/schema.sql` via MySQL Workbench.*

---

### Step 4: Environment Configuration
Copy `.env.example` to create your `.env` file:
```bash
cp .env.example .env
```
Edit `.env` with your database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hotel_management
JWT_SECRET=your_super_secret_jwt_key_here
```

---

### Step 5: Start the Server

**Development Mode** (Auto-restart via Nodemon):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

---

### Step 6: Access Dashboard & Default Credentials
Open `http://localhost:5000` in your web browser.

| Field | Default Value |
|-------|---------------|
| **Email** | `tushar@example.com` |
| **Password** | `admin123` |

---

## ✨ Key Technical Highlights

- **Database Constraints**: Foreign keys with `ON DELETE RESTRICT` for referential integrity.
- **Query Performance**: Indexing on `(room_id, check_in, check_out, status)` speeds up date checking algorithms under high concurrency.
- **RESTful Best Practices**: Correct HTTP verb usage, JSON content negotiation, and consistent error status codes (`400`, `401`, `403`, `404`, `409`, `500`).

---

## 👨‍💻 Developer

**Tushar Goyal**
- GitHub: [@Tushar-Goyal-9](https://github.com/Tushar-Goyal-9)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for educational and commercial use.
