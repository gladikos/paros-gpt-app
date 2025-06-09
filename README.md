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
<pre> cd backend </pre>
<pre> source venv/bin/activate     # or `source venv/bin/activate.fish` if using fish shell </pre>
 <pre> pip install -r requirements.txt </pre>
<pre> uvicorn main:app --reload </pre>

**The backend runs at: http://localhost:8000**

**Make sure you have a .env file inside /backend with:**

```env```
OPENAI_API_KEY=your-openai-key-here

### 💻 3. Run the Frontend (React)

**Make sure you have a .env file inside /backend with:**

```env```
PORT=3001

Open a second terminal tab (or split terminal in VS Code):

```bash```
<pre> cd frontend </pre>
<pre> npm install </pre>
<pre> npm start </pre>

**The frontend runs at: http://localhost:3001 (⚠️ or http://localhost:3000 if port 3001 is already in use)**


👨‍💻 **Author**

**George Ladikos**

github.com/gladikos
