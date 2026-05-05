# 🔍 CampusFind — Lost & Found Portal

> A full-stack web platform that helps students report, search, and reclaim lost items on campus — fast, simple, and secure.

---

## 🌐 Live Demo

👉 [View Live Project](https://campus-lost-found-portal-frontend.onrender.com)

> ⚠️ **Note:** The backend is hosted on Render's free tier. It may take **10–20 seconds** to wake up on the first load.

> 🧪 **To test the project**, login using — **Email:** `group-project@gmail.com` &nbsp;|&nbsp; **Password:** `group-project`

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Admin Setup](#-admin-setup)
- [Author](#-author)

---

## 📖 About the Project

CampusFind is a campus-wide Lost & Found portal built for students and staff. Instead of posting on notice boards or WhatsApp groups, users can report a lost or found item in seconds — complete with a photo, location, and description.

Anyone who recognizes their item can send a claim request with a message, and the original poster reviews and approves it. Once approved, the item is automatically marked as **Resolved**.

The platform also includes a full **Admin Panel** for moderating posts and managing users across the campus.

---

## ✨ Features

### 👤 For Students
- Register and log in with a secure JWT-based account
- Profile with name, department, and contact number
- Post lost or found items with image upload (up to 5MB)
- Browse all active posts with real-time search and category filters
- Send a claim request with a personal message to the poster
- Personal dashboard to track posts and submitted claims

### 🤝 For Item Owners
- View all incoming claim requests for your posts
- See claimant name, email, department, and contact info
- Approve or reject each claim individually
- Approved claims automatically mark the item as Resolved

### 🛡️ For Admins
- Overview dashboard with live platform stats
- View and manage all registered users
- Remove inappropriate or duplicate posts
- Promote or demote user roles (student ↔ admin)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, React Hot Toast |
| Styling | Custom CSS with CSS Variables (dark theme) |
| Backend | Node.js, Express.js |
| Database | PostgreSQL hosted on Render |
| Authentication | JWT (JSON Web Tokens) + bcryptjs |
| File Uploads | Multer (local storage, 5MB limit) |

---

## 📁 Project Structure

```
lost-found-portal/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js           # JWT auth guard & admin-only guard
│   ├── routes/
│   │   ├── auth.js           # Register, login, get profile
│   │   ├── items.js          # Lost/found post CRUD + image upload
│   │   ├── claims.js         # Submit, view, approve/reject claims
│   │   └── admin.js          # Admin stats, user & post management
│   ├── uploads/              # Uploaded item images (auto-created)
│   ├── db.js                 # PostgreSQL connection + auto table init
│   ├── server.js             # Express app entry point
│   ├── .env                  # Environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js       # Sticky nav with user dropdown
        │   └── ItemCard.js     # Reusable item preview card
        ├── context/
        │   └── AuthContext.js  # Global auth state (login/logout)
        ├── pages/
        │   ├── Home.js         # Landing page with hero & recent posts
        │   ├── Login.js        # Login form
        │   ├── Register.js     # Signup form with department select
        │   ├── Browse.js       # Search, filter & paginate all items
        │   ├── PostItem.js     # Create a new lost/found post
        │   ├── ItemDetail.js   # Item view + claim request + owner actions
        │   ├── Dashboard.js    # User's posts and claim history
        │   └── Admin.js        # Admin panel (users, posts, stats)
        ├── api.js              # Axios instance with JWT interceptor
        ├── App.js              # Route definitions & protected routes
        ├── index.js            # React entry point
        └── index.css           # Global styles & CSS variables
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed on your machine:

- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)
- A code editor like [VS Code](https://code.visualstudio.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Udit-Gunagi/campus-lost-found-portal.git
cd lost-found-portal
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The server will start on **http://localhost:5000**

> Database tables are created automatically on the first run — no manual SQL needed.

### 3. Start the Frontend

Open a **new terminal window** and run:

```bash
cd frontend
npm install
npm start
```

The React app will open at **http://localhost:3000**

> The frontend automatically proxies all `/api` requests to port 5000.

---

## 🔐 Environment Variables

The `backend/.env` file is already configured. Here is what each variable does:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Render hosted) |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens |
| `PORT` | Port the backend server runs on (default: 5000) |
| `NODE_ENV` | Environment mode (`development` or `production`) |

If you want to use your own database, replace `DATABASE_URL` with your own PostgreSQL connection string.

---

## 📡 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create a new student account |
| POST | `/login` | No | Login and receive JWT token |
| GET | `/me` | Yes | Get currently logged-in user profile |

### Item Routes — `/api/items`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Get all items (supports search, filter, pagination) |
| GET | `/:id` | No | Get a single item by ID |
| POST | `/` | Yes | Create a new lost/found post (with image) |
| PUT | `/:id` | Yes | Update your own post |
| DELETE | `/:id` | Yes | Delete your own post |
| GET | `/user/my-posts` | Yes | Get all posts by the logged-in user |

### Claim Routes — `/api/claims`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/:itemId` | Yes | Submit a claim request for an item |
| GET | `/item/:itemId` | Yes | Get all claims for your item (owner only) |
| PATCH | `/:claimId` | Yes | Approve or reject a claim request |
| GET | `/my-claims` | Yes | Get all claims submitted by logged-in user |

### Admin Routes — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Get platform overview statistics |
| GET | `/users` | Admin | Get list of all registered users |
| DELETE | `/users/:id` | Admin | Remove a user and all their posts |
| PATCH | `/users/:id/role` | Admin | Change a user's role (student/admin) |
| GET | `/items` | Admin | Get all posts on the platform |
| DELETE | `/items/:id` | Admin | Remove any post from the platform |

---

## 🗄️ Database Schema

Three tables are auto-created on first startup — no manual setup needed.

**users**
```
id, name, email, password, department, contact, role, created_at
```

**items**
```
id, user_id, title, description, category, location, type, status, image_url, created_at
```

**claim_requests**
```
id, item_id, claimant_id, message, status, created_at
```

---

## 🛡️ Admin Setup

After registering a normal student account, run this SQL query on your PostgreSQL database to promote yourself to admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

You can run this using any PostgreSQL client like [pgAdmin](https://www.pgadmin.org/) or [TablePlus](https://tableplus.com/), or directly from the **PostgreSQL Query Results** tab in VS Code.

Once you are an admin, you can promote other users through the Admin Panel inside the app — no more manual SQL needed after that.

---

## 👨‍💻 Team

Built as a group project during a **Glowlogics Solutions Pvt Ltd Internship**.

- Pranay S Chinchankar
- Udit U Gunagi
- Sahil S Vernekar

---

> **Note:** This project uses a shared Render PostgreSQL instance. For production use, set up your own dedicated database and update `DATABASE_URL` in the `.env` file accordingly.