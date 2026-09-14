# Team Onboarding & Setup Guide

Welcome to the team! This guide will take you step-by-step from a blank computer to running the complete ProcureBridge (SIH 26136) platform locally on your machine.

---

## Part 1: Install Required Software

Before you write any code, you need to install the fundamental tools. Download and install the following with their default settings:

1. **Git**
   * Download: [git-scm.com](https://git-scm.com/downloads)
   * *Why:* To clone the repository and manage version control.

2. **Visual Studio Code (VS Code)**
   * Download: [code.visualstudio.com](https://code.visualstudio.com/)
   * *Why:* Our primary code editor.

3. **Node.js (LTS Version)**
   * Download: [nodejs.org](https://nodejs.org/en)
   * *Why:* Required to run the React frontend and Vite server. (This will also install `npm`).

4. **Python (3.10 or newer)**
   * Download: [python.org/downloads](https://www.python.org/downloads/)
   * **CRITICAL:** During the Windows installer, make sure to check the box that says **"Add Python to PATH"** before clicking Install.

5. **PostgreSQL**
   * Download: [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   * *Important during setup:* 
     * Remember the password you set for the default `postgres` user (e.g., set it to `postgres` or `admin` for local development).
     * Leave the port as the default (`5432`).
     * Open the **pgAdmin 4** app (installed with PostgreSQL), log in, and create a new database named `sih26136`.

---

## Part 2: Clone the GitHub Repository

1. Open **VS Code**.
2. Open the terminal inside VS Code by pressing `` Ctrl + ` `` (or navigating to **Terminal > New Terminal** in the top menu).
3. Navigate to where you want to store the project (e.g., your Desktop):
   ```bash
   cd Desktop
   ```
4. Clone the repository from GitHub:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL_HERE>
   ```
5. Open the cloned folder in VS Code:
   * Go to **File > Open Folder...** and select the newly cloned folder.

---

## Part 3: Start the Backend (Python / FastAPI)

You will need two terminals running simultaneously (one for the backend, one for the frontend). 
In VS Code, open a New Terminal.

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```
2. **Create a Python Virtual Environment:**
   ```bash
   python -m venv .venv
   ```
3. **Activate the Virtual Environment:**
   * On Windows:
     ```bash
     .venv\Scripts\activate
     ```
   * *Note: You should see `(.venv)` appear at the start of your terminal line.*
4. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
5. **Configure the Database URL:**
   * Create a file named `.env` in the `backend/` folder and add your PostgreSQL connection string:
     ```env
     DATABASE_URL=postgresql://postgres:<YOUR_POSTGRES_PASSWORD>@localhost:5432/sih26136
     ```
6. **Run Database Migrations (Creates Tables):**
   ```bash
   alembic upgrade head
   ```
7. **Start the Backend Server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend is now running at `http://localhost:8000`.*

---

## Part 4: Start the Frontend (React / Vite)

Keep the backend terminal running. Open a **second** terminal window in VS Code (click the `+` icon in the terminal panel).

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   ```
2. **Install Node Dependencies:**
   ```bash
   npm install
   ```
3. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```

---

## Part 5: View the Website!

Once both servers are running, the frontend terminal will show a local web address (usually `http://localhost:5173`). 

Hold `Ctrl` and click that link, or paste it into your browser (Chrome/Edge/Firefox), and you will see the fully functional ProcureBridge website running locally on your computer!
