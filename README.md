# 🧭 ParosGPT: Your AI Concierge for Paros, Greece

ParosGPT is a full-stack app that generates personalized travel itineraries for visitors to Paros. It uses GPT-4o, real-world preferences, and a slick UI to deliver tailored day-by-day plans.

---

## ⚙️ Technologies Used

- **Frontend**: React (Vite)
- **Backend**: Python (FastAPI)
- **AI Integration**: OpenAI GPT-4o
- **Styling**: Custom CSS
- **Hosting**: localhost (future: Render/Netlify)

---

## 🚀 Getting Started (Local Setup)

### 🧩 1. Clone the repository

```bash```
git clone https://github.com/gladikos/paros-gpt-app.git
cd paros-gpt-app

---

### 🧠 2. Run the Backend (FastAPI)

```bash```
cd backend
source venv/bin/activate     # or `source venv/bin/activate.fish` if using fish shell
pip install -r requirements.txt
uvicorn main:app --reload

**The backend runs at: http://localhost:8000**

**Make sure you have a .env file inside /backend with:**

```env```
OPENAI_API_KEY=your-openai-key-here

### 💻 3. Run the Frontend (React)
Open a second terminal tab (or split terminal in VS Code):

```bash```
cd frontend
npm install
npm start

**The frontend runs at: http://localhost:3000 (⚠️ or http://localhost:3001 if port 3000 is already in use)**

👨‍💻 Author
George Ladikos
github.com/gladikos
