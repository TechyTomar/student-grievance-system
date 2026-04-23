# Student Grievance Management System

A full-stack **MERN** web application for managing student grievances at a college.

## Features
- 🔐 Student Registration & Login (JWT + bcrypt)
- 📝 Submit Grievances (Academic / Hostel / Transport / Other)
- 📂 View all your grievances with status tracking
- 🔍 Search grievances by title
- ✏️ Edit grievance title, description, category, and status
- 🗑 Delete grievances
- 📊 Stats dashboard (Total / Pending / Resolved)
- 🚪 Logout

## Tech Stack
- **Frontend:** React 18, React Router v6, Axios, Vite
- **Backend:** Node.js, Express.js, MongoDB (Atlas), Mongoose
- **Auth:** JWT, bcryptjs

## Local Setup

### Backend
```bash
cd backend
npm install
# Create .env with MONGO_URI, JWT_SECRET, PORT
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Register student |
| POST | /api/login | Login |
| POST | /api/grievances | Submit grievance |
| GET | /api/grievances | Get all grievances |
| GET | /api/grievances/:id | Get grievance by ID |
| PUT | /api/grievances/:id | Update grievance |
| DELETE | /api/grievances/:id | Delete grievance |
| GET | /api/grievances/search?title=xyz | Search grievances |
