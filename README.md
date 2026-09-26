<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.6-000000?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</div>

<h1 align="center">Attendance Dashboard</h1>

<p align="center">
  A modern attendance tracking dashboard for schools, classes, and staff.
  <br />
  Built with <strong>Next.js</strong>, <strong>Express</strong>, and <strong>PostgreSQL</strong>.
</p>

<p align="center">
  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Team collaboration and attendance dashboard" width="100%" />
</p>

## ✨ Overview

This project is a lightweight attendance management demo that lets users log in as an Admin, Teacher, or Student and view class and attendance information from a single dashboard.

It was designed for quick local demos and educational projects, with role-based access and attendance tracking built into the backend and frontend.

## 🚀 Features

- Role-based login for Admin, Teacher, and Student
- Attendance summary analytics per role
- Teacher dashboard to mark attendance for each class
- Class listing and role-aware data access
- JWT-based authentication
- PostgreSQL-backed persistence
- Fast front-end experience with Next.js 16

## 🧩 Tech Stack

- Frontend: Next.js + React + TypeScript
- Backend: Express + TypeScript
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Styling: Tailwind CSS

## 🏗️ Project Structure

```bash
attendance-dashboard/
├── backend/
│   ├── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   ├── README.md
│   └── ...
└── .gitignore
```

## ⚙️ Quick Start

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Set up PostgreSQL

Create a database named:

```bash
attendance_demo
```

Then update your local database credentials in the backend config if needed:

```ts
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "attendance_demo",
  password: "your_password",
  port: 5432,
});
```

### 3) Run the app

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 🔐 Demo Credentials

The backend seeds demo users automatically.

- Admin: `admin1` / `password123`
- Teacher: `teacher1` / `password123`
- Student: `student1` / `password123`

## 👤 User Roles

- Admin: view overall attendance analytics
- Teacher: manage class attendance and mark present/absent records
- Student: view their personal attendance rate

## 📌 Notes

This project is intended as a local demo and learning project. It includes seeded sample data and a simple role-based dashboard, but it is not a production-ready security setup.

If you want, the next step could be adding:

- student profiles
- attendance charts
- CSV export
- admin management page
- deployment config for Docker or Vercel

## 💡 Summary

This is a practical example of a school attendance system built with modern web technologies, designed to be easy to run locally and extend for real-world use.
