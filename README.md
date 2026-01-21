# 🏥 Tashkhees Support Portal

A premium, state-of-the-art Support Ticketing and License Management system built for the Tashkhees ecosystem. Featuring a high-end UI/UX with glassmorphism, real-time updates, and multi-role dashboards.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/alihamza-h/Tashkhees-Support-Portal.git
cd Tashkhees-Support-Portal
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env from .env.example and fill in your details
cp .env.example .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion (Animations), Socket.io-client.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT Authentication.
- **Design**: Slate & Violet Theme, Glassmorphism, Responsive Layouts.

---

## 📊 Database Schemas (MongoDB)

### 👤 User
- `name`: Full name of the user.
- `email`: Unique email address.
- `password`: Hashed password (bcrypt).
- `role`: `Admin`, `Developer`, or `User`.
- `licenseKey`: Associated product license.

### 🎫 Ticket
- `ticketId`: Auto-generated unique ID (e.g., TKT-12345).
- `userEmail`: Email of the reporter.
- `product`: `RxScan`, `Medscribe`, `Legalyze`, etc.
- `subject`: Ticket title.
- `priority`: `Low`, `Medium`, `High`, `Critical`.
- `status`: `TO DO`, `In Progress`, `QA`, `Completed`.
- `assignedTo`: Developer assigned to the ticket.

### 🔑 License Key
- `code`: Unique alphanumeric license code.
- `product`: Associated product name.
- `isUsed`: Boolean status.
- `usedBy`: Email of the user who activated it.

---

## ✨ Features

- **Admin Dashboard**: Comprehensive overview of metrics, user management, and ticket distribution.
- **Developer Console**: Performance metrics, documentation shortcuts, and task management.
- **End User Portal**: Modern two-column layout with knowledge base integration and ticket tracking.
- **Real-time Notifications**: Instant alerts for ticket updates and replies via Socket.IO.
- **Premium UI**: Floating particles, glass-card effects, and smooth Framer Motion transitions.

---

## 🔐 Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `superadmin@tashkhees.com` | `superadmin123` |
| **Developer** | `alihamza@tashkhees.com` | `alihamza123` |
| **End User** | `amna@example.com` | `amna123` |

---

## 📄 License
This project is licensed under the MIT License.
