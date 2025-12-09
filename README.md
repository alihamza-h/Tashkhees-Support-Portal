# Tashkhees Support Portal

A comprehensive support portal for Tashkhees, a multi-product technology company. This system allows end-users to register with license keys, create support tickets, and interact with developers. It features a robust role-based access control system with Admin, Developer, and User roles.

## Features

- **Role-Based Access Control**:
  - **Super Admin**: Full system control, user management, license generation, and ticket oversight.
  - **Developer**: Ticket management, status updates, and direct communication with users.
  - **End User**: License-based registration, ticket creation, and tracking.

- **Ticket Management**:
  - Create, track, and manage support tickets.
  - Priority levels (Critical, High, Medium, Low).
  - Status workflow (To Do -> In Progress -> QA -> Completed -> Done).
  - File attachments support.

- **License System**:
  - Secure license key generation for user registration.
  - Product-specific licenses (RxScan, Medscribe, Legalyze, etc.).

- **Modern UI/UX**:
  - Built with React and Tailwind CSS.
  - Dark mode aesthetic with premium gradients and animations.
  - Responsive design.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/CyberHamza/Tashkhees-Support-Portal.git
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Environment Setup**
    - Create a `.env` file in the `backend` directory with the following:
      ```env
      PORT=5000
      MONGODB_URI=your_mongodb_uri
      JWT_SECRET=your_jwt_secret
      ```

5.  **Run the Application**
    - Start Backend: `cd backend && npm run dev`
    - Start Frontend: `cd frontend && npm run dev`

## Project Structure

- `/backend`: Node.js/Express API and database models.
- `/frontend`: React frontend application.

## License

[MIT](LICENSE)
