# 🔍 CampusFind — Lost & Found Portal

A full-stack web platform where students can report lost/found items on campus and connect with rightful owners.

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, PostgreSQL (Render), Multer (image uploads)
- **Auth**: JWT (JSON Web Tokens) + bcryptjs

---

## Project Structure

```
lost-found-portal/
├── backend/
│   ├── routes/
│   │   ├── auth.js        # Register, login, profile
│   │   ├── items.js       # Lost/found post CRUD
│   │   ├── claims.js      # Claim request system
│   │   └── admin.js       # Admin management
│   ├── middleware/
│   │   └── auth.js        # JWT auth & admin guard
│   ├── uploads/           # Uploaded images (auto-created)
│   ├── db.js              # PostgreSQL connection + table init
│   ├── server.js          # Express entry point
│   └── .env               # DB URL and JWT secret
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.js         # Landing page
    │   │   ├── Login.js        # Login form
    │   │   ├── Register.js     # Signup form
    │   │   ├── Browse.js       # Search & filter items
    │   │   ├── PostItem.js     # Create a new post
    │   │   ├── ItemDetail.js   # Item view + claim request
    │   │   ├── Dashboard.js    # User's posts & claims
    │   │   └── Admin.js        # Admin panel
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ItemCard.js
    │   ├── context/
    │   │   └── AuthContext.js  # Global auth state
    │   ├── api.js              # Axios instance
    │   ├── App.js              # Routes
    │   └── index.js
    └── package.json
```

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
# The .env file is already configured with your DB credentials
npm run dev
```

The server starts on `http://localhost:5000`. Tables are auto-created on first run.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app starts on `http://localhost:3000` and proxies API calls to port 5000.

---

## Features

### Students
- Register & login with secure JWT auth
- Post lost or found items with photo upload
- Browse and search by keyword or category
- Send claim requests with a message
- Dashboard showing their posts and claim history

### Item Owners
- View all claim requests on their posts
- Approve or reject individual claims
- Approved claim marks item as Resolved

### Admins
- Overview stats dashboard
- Manage all users (remove, toggle admin role)
- Manage all posts (remove inappropriate or duplicates)

---

## Creating an Admin Account

After registering normally, connect to your PostgreSQL database and run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or use the Admin Panel to promote another user once you're already an admin.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get profile |
| GET | /api/items | No | List items |
| GET | /api/items/:id | No | Item detail |
| POST | /api/items | Yes | Create post |
| PUT | /api/items/:id | Yes | Update post |
| DELETE | /api/items/:id | Yes | Delete post |
| GET | /api/items/user/my-posts | Yes | My posts |
| POST | /api/claims/:itemId | Yes | Submit claim |
| GET | /api/claims/item/:itemId | Yes | Get item claims |
| PATCH | /api/claims/:claimId | Yes | Approve/reject |
| GET | /api/claims/my-claims | Yes | My claims |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/users | Admin | All users |
| DELETE | /api/admin/users/:id | Admin | Remove user |
| GET | /api/admin/items | Admin | All items |
| DELETE | /api/admin/items/:id | Admin | Remove item |
| PATCH | /api/admin/users/:id/role | Admin | Change role |
