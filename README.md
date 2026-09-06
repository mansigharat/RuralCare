# 🏥 RuralCare - Healthcare Access Platform for Rural India

A full-stack web application designed to help rural citizens find nearby primary health centres, community health centres, and district hospitals, view live doctor availability, track essential medicine stock, and report facility issues.

---

## 📋 Prerequisites (What you need installed)

Before doing anything, ensure these three programs are installed on your computer:

1. **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
2. **[Python](https://python.org/)** (v3.10 to v3.12+ recommended) — *make sure to check "Add Python to PATH" during installation*
3. **[PostgreSQL](https://www.postgresql.org/download/)** — *recommended: set `postgres` or `admin` as the password during installation and keep port as `5432`*

---

## 🛠️ Step-by-Step Setup Guide (For Teammates / Judges)

### 1. Set up the Backend Database

By default, Git ignores `.env` files for security. You can generate or configure it in one simple step:

- Open a terminal in the `backend/` folder.
- Run the automatic database creator script:
  ```bash
  python create_db.py
  ```
  *(This will attempt common passwords, create the `ruralcare` database in PostgreSQL, and generate a working `.env` file automatically).*

- **(Manual Alternative)**:
  - Copy `backend/.env.example` to `backend/.env`.
  - Ensure the database URL matches your PostgreSQL credentials:
    ```env
    DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ruralcare
    SECRET_KEY=ruralcare-sih-hackathon-secret-key-2024
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=60
    ```

---

### 2. Seed the Database with Demo Data

In the project root folder:

- **Option A (Easy)**: Double-click **`seed-database.bat`**
- **Option B (Terminal)**:
  ```bash
  cd backend
  pip install -r requirements.txt
  python seed.py
  ```

This creates all database tables and seeds:
- **15 realistic healthcare facilities** across Pune, Nashik, and Ahmednagar
- Doctors and OPD schedules
- Essential Jan Aushadhi medicines & stock status
- Demo users and sample citizen issue reports

---

### 3. Run the Application

Once the one-time database setup above is done, starting the app takes just two clicks:

1. **Start the Backend**:
   - Double-click **`start-backend.bat`** *(leaves the terminal window open)*
   - API will run at: **`http://localhost:8000`**
   - Interactive Swagger API docs: **`http://localhost:8000/docs`**

2. **Start the Frontend**:
   - Double-click **`start-frontend.bat`** *(leaves the terminal window open)*
   - Frontend web application will open at: **`http://localhost:5173`**

3. Open your browser and navigate to:
   👉 **`http://localhost:5173`**

---

## 🔑 Demo Login Accounts

You can test different user roles using the seeded accounts:

| Role | Phone Number | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Admin** | `9000000001` | `admin123` | Review & verify citizen reports, manage facilities |
| **Staff** | `9000000002` | `staff123` | Update doctor duty schedules and medicine inventory |
| **Citizen** | `9000000003` | `citizen123` | Search facilities, filter by service/distance, report issues |
