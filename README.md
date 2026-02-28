# 🎉 EventSphere – Campus Event Management Platform

EventSphere is a **full-stack campus event management web application** built using **Node.js, Express, MongoDB, Nginx, and Docker**.  
It allows **students** to explore and register for campus events and **admins** to create and manage events and registrations.

The entire system runs inside **Docker containers**, making it portable, consistent, and easy to deploy.

---

## 🚀 Features

### 👨‍🎓 Student Features
- View all upcoming campus events
- Register for events
- View registrations for a specific event

### 🧑‍💼 Admin Features
- Admin login (demo authentication)
- Create new events
- View registrations per event

### 🛠 Platform Features
- RESTful API using Express.js
- MongoDB database
- Nginx reverse proxy
- Dockerized frontend, backend, and database
- SPA (Single Page Application) routing
- Production-style container setup

---

## 🧱 Tech Stack

### Frontend
- HTML, CSS, JavaScript (ES Modules)
- SPA routing (hash-based)
- Served via **Nginx**

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### DevOps
- Docker
- Docker Compose
- Nginx (Reverse Proxy)

---

## 📁 Project Structure

```
EVENT-SPHERE/
│
├── src/                    # Backend (Express + MongoDB)
│   ├── config/             # Database config
│   ├── controllers/        # Request handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── app.js
│   └── server.js
│
├── frontend/build/         # Frontend (served by Nginx)
│   ├── components/         # UI components
│   ├── pages/              # SPA pages
│   ├── services/           # API + auth services
│   ├── styles/             # CSS
│   ├── index.html
│   └── main.js
│
├── nginx/
│   └── nginx.conf          # Nginx configuration
│
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env                    # Environment variables (not committed)
└── README.md
```

---

## 🔧 Prerequisites

Make sure you have the following installed:

- **Docker**
- **Docker Compose**
- **Git**

Check versions:

```bash
docker --version
docker compose version
git --version
```

---

## ▶️ How to Run the Project (Local)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/event-sphere.git
cd event-sphere
```

### 2️⃣ Create `.env` file (backend)

Create a `.env` file in the backend root:

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/eventsphere
```

### 3️⃣ Start the application using Docker

```bash
docker compose up --build
```

### 4️⃣ Open in browser

```
http://localhost
```

---

## 🔍 API Health Check

To verify the backend is running correctly:

```
http://localhost/api/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

## 🔑 Demo Admin Credentials

- **Username:** admin  
- **Password:** admin123  

---

## 🧪 MongoDB Useful Commands

### Enter Mongo shell

```bash
docker exec -it mongo mongosh
```

### Use database

```js
use eventsphere
```

### View collections

```js
show collections
```

### Insert a document

```js
db.events.insertOne({ title: "Sample Event", date: "2026-03-01" })
```

### Update documents

```js
db.events.updateOne(
  { title: "Sample Event" },
  { $set: { description: "Updated description" } }
)
```

### Delete documents

```js
db.events.deleteOne({ title: "Sample Event" })
```

### Exit Mongo shell

```bash
exit
```

---

## ❌ What Is NOT Pushed to GitHub

The following are excluded using `.gitignore`:

- `node_modules`
- `.env`
- Docker containers / images

They will be generated automatically when Docker runs.

---

## 🧠 How the Application Works (Simple Explanation)

1. User opens browser → Nginx serves frontend files  
2. Frontend makes API calls to `/api/...`  
3. Nginx forwards API requests to backend container  
4. Backend processes request and talks to MongoDB  
5. Response flows back to frontend  
6. UI updates dynamically (SPA behavior)  

All services run inside Docker containers.

---

## 📌 Future Enhancements

- JWT-based authentication  
- Role-based access (Admin / Organizer)  
- Better UI themes and animations  
- Email notifications  
- AWS EC2 deployment with CI/CD  

---

## 👨‍💻 Author

Built as part of Skill Lab – 6th Semester  
Project Name: EventSphere – Campus Event Platform  

---

## ⭐ Final Note

If Docker works, this project works anywhere.

**Clone → Docker Compose Up → Done 🚀**  
No dependency issues. No system conflicts.

Happy Coding! 🎯
