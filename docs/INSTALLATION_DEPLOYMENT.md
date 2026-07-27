# Installation / Deployment Process Description

**Project:** AI Personalized Learning System  
**Document Type:** Final Year Project (FYP) – Deployment Guide

---

## 1. Overview

The AI Personalized Learning System was deployed on a cloud virtual machine so that users can access the application over the internet. The deployment follows a layered architecture:

| Layer | Technology | Public exposure |
|--------|------------|-----------------|
| Frontend (React build) | Nginx (port 80) | Public |
| Backend API (Node.js / Express) | PM2 on port 5000 | Internal only (via Nginx reverse proxy) |
| AI Service (Python / FastAPI) | PM2 on port 8000 | Internal only (`127.0.0.1`) |
| Database | MongoDB Atlas (cloud) | External managed service |
| Public URL / HTTPS tunnel | ngrok | Used for public domain access and Google OAuth |

Only the frontend is directly exposed through Nginx. The Node backend and Python AI services run as background daemons and are **not** opened on the public firewall.

---

## 2. Cloud Instance Setup (Google Cloud Platform)

A Google Cloud Compute Engine instance was created with the following configuration:

| Setting | Value |
|---------|--------|
| Region | `us-central1` |
| Zone | `us-central1-a` |
| Series | E2 |
| Machine type | `e2-standard-4` (4 vCPU, 16 GB RAM) |
| Boot disk | Ubuntu 24.04 LTS, 100 GB SSD |
| Firewall | Allow HTTP traffic, Allow HTTPS traffic |

### Why this machine type?

The AI pipeline uses computer-vision and OCR models (YOLO, EasyOCR) along with LLM calls. A machine with **16 GB RAM** and **4 vCPUs** was selected so model loading and exam analysis could run reliably on CPU.

After the instance was created, SSH access was used to install system packages and deploy the project (for example under `/var/www/AI-Personalized-Learning-System`).

---

## 3. System Software Installation

On Ubuntu 24.04 LTS, the following software was installed:

1. **Node.js** – for the Express backend and frontend build  
2. **Python 3** and virtual environment – for the FastAPI AI service  
3. **Nginx** – to serve the React production build and reverse-proxy API requests  
4. **PM2** – to keep Node and Python processes running as daemons  
5. **Git** – to clone/pull the project repository  
6. **ngrok** – to expose the application on a temporary public HTTPS domain  

### Project dependencies

- **Python AI:** installed from `backend/python_ai/requirements.txt` (OpenCV, PyTorch, Ultralytics, EasyOCR, Transformers, FastAPI, Uvicorn, Groq SDK, etc.)
- **Backend:** `npm install` inside `backend/`
- **Frontend:** `npm install` inside `frontend/`, then `npm run build` for production

### Environment configuration

Environment variables were configured in:

| File | Purpose |
|------|---------|
| `backend/.env` | MongoDB URI, JWT secret, email, Google OAuth, frontend URL, Python API URL |
| `backend/python_ai/.env` | Groq API key, CORS origins, host/port |
| `frontend/.env` | `VITE_API_URL` pointing to the deployed backend/API base URL |

---

## 4. Application Architecture on the Server

```text
Internet User
     |
     |  HTTPS (ngrok) / HTTP (VM IP)
     v
+------------------+
|      Nginx       |  <-- public entry point
|  (port 80)       |
+--------+---------+
         |
         | /            --> static React build (frontend/dist)
         | /api/*       --> proxy to Node.js (127.0.0.1:5000)
         | /uploads/*   --> proxy to Node.js static uploads
         v
+------------------+         +------------------+
| Node.js Backend  | ------> | Python AI API    |
| Express :5000    |         | FastAPI :8000    |
| (PM2 daemon)     |         | (PM2 daemon)     |
+--------+---------+         +------------------+
         |
         v
   MongoDB Atlas
```

### Component roles

- **Frontend:** Built with `npm run build` and served by Nginx from the production `dist` folder.
- **Backend:** Express API handles authentication, uploads, admin features, and forwards AI requests to Python.
- **Python AI:** Performs exam image analysis, tutoring, quiz generation, and insights. Bound to `127.0.0.1:8000` so it is not publicly reachable.
- **Database:** MongoDB Atlas is used as a managed cloud database (no local MongoDB required on the VM).

---

## 5. Process Management with PM2

Both long-running services were started with **PM2** so they continue running after SSH logout and restart automatically if they crash.

### Example startup commands

```bash
# Node.js backend
cd /var/www/AI-Personalized-Learning-System/backend
pm2 start App.js --name node-api

# Python AI (FastAPI via Uvicorn)
cd /var/www/AI-Personalized-Learning-System/backend/python_ai
source venv/bin/activate
pm2 start "uvicorn app:app --host 127.0.0.1 --port 8000" --name python-ai --interpreter none

pm2 save
pm2 startup
```

### Benefits of PM2 in this deployment

- Daemon / background mode
- Auto-restart on failure
- Centralized logs (`pm2 logs`)
- Persistence across reboot (`pm2 save` + startup script)

---

## 6. Nginx Reverse Proxy Configuration

Nginx was configured as the only public-facing web server to:

1. Serve the React production files for `/`
2. Reverse-proxy `/api/` requests to `http://127.0.0.1:5000`
3. Reverse-proxy `/uploads/` for profile and related static files
4. Increase timeout values for AI analysis (exam OCR + LLM can exceed the default 60 seconds and otherwise cause **504 Gateway Timeout**)

### Example Nginx configuration

```nginx
server {
    listen 80;
    server_name <VM_IP_OR_DOMAIN>;

    root /var/www/AI-Personalized-Learning-System/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        client_max_body_size 20M;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
    }
}
```

This design keeps the backend and Python AI **hidden behind Nginx** and not directly exposed on public ports.

---

## 7. Public Access using ngrok

Because Google OAuth requires a registered redirect URI with a valid public domain/HTTPS endpoint, and because a permanent custom domain was not required for FYP demonstration, **ngrok** was used to create a secure public tunnel to the server (Nginx on port 80).

### Purpose of ngrok in this project

- Provide a temporary public HTTPS URL for the deployed system
- Allow external users/evaluators to open the application without opening extra ports
- Satisfy Google Login redirect requirements (callback URL updated to the ngrok domain)
- Bypass limitations of accessing the app only via raw VM IP during OAuth testing

### After starting ngrok

Environment variables such as the following were updated to match the ngrok URL:

- `FRONTEND_URL`
- `BACKEND_URL` / `VITE_API_URL`
- `GOOGLE_CALLBACK_URL`
- CORS origins

The Google Cloud Console OAuth redirect URI was also updated accordingly.

---

## 8. External Services Used

| Service | Role |
|---------|------|
| Google Cloud Compute Engine | Hosts the application VM |
| MongoDB Atlas | Cloud NoSQL database for users, quizzes, contacts |
| Groq API | LLM backend for evaluation, tutoring, quiz, and insights |
| Gmail (App Password) | OTP and password-reset emails |
| Google OAuth 2.0 | Social login |
| ngrok | Public HTTPS tunnel / free temporary domain |

---

## 9. Deployment Steps Summary

1. Create GCP VM (`e2-standard-4`, Ubuntu 24.04, HTTP/HTTPS firewall enabled).
2. Install Node.js, Python, Nginx, PM2, Git, and ngrok.
3. Clone the project and install frontend, backend, and Python dependencies.
4. Place required AI model files on the server and configure `.env` files.
5. Build the frontend (`npm run build`) and point Nginx to the `dist` folder.
6. Start Node backend and Python AI with PM2 (daemon mode).
7. Configure Nginx reverse proxy so only frontend is public; API is proxied internally.
8. Start ngrok tunnel to expose Nginx over a public HTTPS domain.
9. Update OAuth and environment URLs to the ngrok domain.
10. Verify login, upload/analyze, tutor, quiz, and insights flows end-to-end.

---

## 10. Security and Design Choices

- Backend (port 5000) and Python AI (port 8000) listen on localhost and are accessed only through Nginx.
- Upload directories are created with proper permissions so the AI service can read uploaded exam images.
- Long AI requests are supported by increased Nginx proxy timeouts.
- Secrets (JWT, API keys, DB URI, OAuth secrets) are stored in `.env` files and not committed to the repository.
- ngrok was used for demonstration-time public access and Google Login compatibility without purchasing a permanent domain.

---

## 11. Useful Operations Commands

```bash
# Check running services
pm2 status
pm2 logs node-api
pm2 logs python-ai

# Restart services after code update
pm2 restart node-api
pm2 restart python-ai

# Rebuild frontend after UI changes
cd frontend
npm run build
sudo systemctl reload nginx

# Test Nginx config
sudo nginx -t
```

---

*End of Installation / Deployment Process Description*
