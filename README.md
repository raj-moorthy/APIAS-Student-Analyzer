# APAIS: AI Personal Academic Intelligence System

![APAIS Banner](https://img.shields.io/badge/Project-Student%20Analyzer-06b6d4?style=for-the-badge&logo=react)
![Go](https://img.shields.io/badge/Backend-Go_1.21+-00ADD8?style=for-the-badge&logo=go)
![React](https://img.shields.io/badge/Frontend-React_Vite-20232A?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb)

**APAIS (Student Analyzer)** is an enterprise-grade, full-stack application engineered to optimize academic and career workflows. By utilizing data-driven analytics, real-time resource indexing, and intelligent career mapping, the platform empowers students to track their academic performance, plan their study schedules, and seamlessly transition into the professional workforce.

---

## 🚀 Key Features

*   **📊 Predictive Analytics & Dashboard:** Upload performance data and visualize metrics, task completions, and GPA improvements in real-time.
*   **🎯 Smart Career Matcher:** A dynamic wizard that takes your location preferences and technical specifications to generate 12+ tailored job roles and directs you to active global applications.
*   **📚 Resource Discovery Engine:** Filter top-rated educational YouTube content by rigorous parameters (Subject, Format, and Difficulty Level).
*   **📅 Automated Study Planner:** Manage academic goals, track daily tasks, and receive automated email digest reminders via SMTP integration.
*   **🌐 Real-Time Insights:** Pulls live, trending tech articles and blogs from the Dev.to API directly into your personalized dashboard.
*   **⚙️ Enterprise UI/UX & Accessibility:** A globally persistent settings engine featuring **High Contrast Mode**, **Privacy Mode** (blurs sensitive data), **Reduce Motion**, and a real-time **24-Hour live clock**.

---

## 🛠️ Technology Stack

### **Frontend**
*   **Framework:** React 18 (via Vite)
*   **Routing:** React Router DOM
*   **Styling:** Pure CSS3 (Custom Glassmorphism, CSS Variables, Responsive Grids)
*   **State Management:** React Context API (`AuthContext`)

### **Backend**
*   **Language:** Go (Golang)
*   **Database:** MongoDB Atlas (NoSQL) using `go.mongodb.org/mongo-driver`
*   **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
*   **Architecture:** RESTful API with Singleton DB connection pooling

---

## 📦 Local Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [Go](https://go.dev/) (v1.20 or higher)
*   A [MongoDB Atlas](https://www.mongodb.com/atlas) Cluster and connection URI.

### 1. Clone the Repository
```bash
git clone https://github.com/raj-moorthy/APIAS-Student-Analyzer.git
cd APIAS-Student-Analyzer
```

### 2. Backend Setup (Go Server)
```bash
# Navigate to the backend directory
cd backend

# Install Go dependencies
go mod tidy

# Create a .env file based on environment requirements:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/
# JWT_SECRET=your_super_secret_key

# Run the Go server (runs on port 8080 by default)
go run main.go
```

### 3. Frontend Setup (React/Vite)
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The application will now be running on `http://localhost:5173`.*

---

## 📁 Project Architecture

```text
Student_Analyzer/
├── backend/
│   ├── controllers/      # Route handlers (auth.go, settings.go, etc.)
│   ├── models/           # MongoDB schemas and DB initialization
│   ├── routes/           # Mux routing definitions
│   └── main.go           # Entry point and server configuration
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI (Sidebar, Header)
    │   ├── context/      # Global state (AuthContext)
    │   ├── pages/        # Views (Dashboard, Settings, Resources, etc.)
    │   ├── App.jsx       # Layout and routing wrapper
    │   └── main.jsx      # React DOM bootstrapper
    └── index.html        # Main HTML entry
```

---

## 🎨 UI/UX Design Philosophy

APAIS is styled using a modern "Fortune 500" corporate aesthetic:
*   **Glassmorphism:** Layered, semi-transparent panels with background blurs.
*   **Dark-First Paradigm:** Deep navy and slate color tokens (`#030712`) designed to reduce eye strain during late-night study sessions.
*   **Liquid Animations:** Smooth CSS transitions that make the interface feel responsive and alive, strictly respecting the user's `Reduce Motion` accessibility preferences.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License
This project is proprietary and built for personal/academic demonstration purposes.
