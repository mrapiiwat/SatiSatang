<div align="center">

<img src="frontend/public/SATASATANG_LOGO_BLACK_VERTICAL_TH.svg" alt="SatiSatang Logo" width="170"/>

**แอปพลิเคชันจัดการเงินส่วนตัวอัจฉริยะ ขับเคลื่อนด้วย AI**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.2-FBF0DF?style=flat-square&logo=bun)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Elysia-latest-5C7EE0?style=flat-square)](https://elysiajs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)

</div>

---

## 📋 สารบัญ

- [ภาพรวม](#-ภาพรวม)
- [ฟีเจอร์หลัก](#-ฟีเจอร์หลัก)
- [สถาปัตยกรรม](#-สถาปัตยกรรม)
- [Tech Stack](#-tech-stack)
- [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [Prerequisites](#-prerequisites)
- [การติดตั้งและรัน](#-การติดตั้งและรัน)
- [ตัวแปรสภาพแวดล้อม](#-ตัวแปรสภาพแวดล้อม)
- [API Overview](#-api-overview)
- [Database Schema](#-database-schema)

---

## 🌟 ภาพรวม

**สติสตางค์** คือแอปพลิเคชัน Progressive Web App (PWA) สำหรับจัดการการเงินส่วนตัวแบบครบวงจร ผสมผสานระหว่างการบันทึกรายรับ-รายจ่าย, การตั้งเป้าหมายออมเงิน, การตั้งงบประมาณ และผู้ช่วย AI 2 ตัวที่เชี่ยวชาญด้านการเงิน ได้แก่:

- **🧠 น้องสติ (Sati)** — AI สำหรับบันทึกรายการผ่านการสนทนาภาษาธรรมชาติ และสร้างเป้าหมาย/งบได้ด้วยคำสั่งเดียว
- **📈 พี่สตางค์ (Satang)** — AI นักวิเคราะห์การเงิน ตอบคำถามเชิงลึก วิเคราะห์พฤติกรรมการใช้จ่าย และให้คำปรึกษาด้านการลงทุน โดยใช้ RAG (Retrieval-Augmented Generation) ดึงข้อมูลจริงจากฐานข้อมูลของผู้ใช้

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---|---|
| 💰 **บันทึกรายรับ-รายจ่าย** | บันทึกได้ด้วยการกรอกแบบฟอร์ม, สั่งผ่าน AI หรืออัปโหลดสลิป |
| 🤖 **AI สแกนสลิป (OCR)** | ถ่ายรูปสลิปธนาคาร ระบบจะอ่านและสร้างรายการให้อัตโนมัติด้วย Google Cloud Vision + GPT |
| 🗂️ **หมวดหมู่** | จัดการหมวดหมู่พร้อมไอคอนได้เอง และระบบจะแนะนำหมวดหมู่อัตโนมัติจาก ML (NLP Classifier) |
| 🎯 **เป้าหมายออมเงิน** | ตั้งเป้าหมาย ติดตามความคืบหน้า และโอนเงินเข้าเป้าหมายได้ |
| 📊 **งบประมาณ (Budget)** | ตั้งงบแบบรายวัน/สัปดาห์/เดือน/ปี ต่อหมวดหมู่ ระบบแจ้งเตือนเมื่อเกินงบ |
| 📈 **วิเคราะห์การเงิน** | กราฟรายรับ-รายจ่าย, จัดอันดับหมวดใช้จ่าย, เปรียบเทียบเดือน |
| 💹 **ข้อมูลหุ้น** | ติดตามราคาหุ้นไทยและต่างประเทศ อัปเดตอัตโนมัติทุก 15 นาที (Cron Job) |
| 🔐 **Auth** | Email + OTP Verification, Google OAuth, Facebook OAuth, JWT + Refresh Token Rotation |
| 🪪 **Consent Management** | บันทึก Terms of Service, Privacy Policy, AI Disclaimer ตาม PDPA |
| 📱 **PWA** | ติดตั้งได้บนมือถือเหมือนแอปปกติ |

---

## 🏗️ สถาปัตยกรรม

```
                        Users / Browser
                               │
              ┌────────────────▼──────────────────┐
              │        Nginx Reverse Proxy        │
              │             (Port 80)             │
              └──────────┬──────────────┬─────────┘
                         │              │
                   /api/*│              │/* (static)
                         │              │
             ┌───────────▼────┐  ┌──────▼──────────┐
             │    Backend     │  │    Frontend     │
             │  Elysia + Bun  │  │  React + Vite   │
             │  (Port 8080)   │  │    (Nginx)      │
             └─┬──────┬────┬──┘  └─────────────────┘
               │      │    │
       ┌───────┘      │    └─────────┐
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│  PostgreSQL │ │   Qdrant   │ │   Redis    │
│  (Database) │ │  (Vectors) │ │  (Cache)   │
└─────────────┘ └────────────┘ └────────────┘

┌─────────────┐    ┌─────────────┐
│    MinIO    │    │   Cron Job  │
│  (S3-like)  │◄───┤   (Python)  │
│  (Receipts) │    └──────┬──────┘
└─────────────┘           │
  (Backend ────────►)  yfinance + OpenAI
```

---

## 🛠️ Tech Stack

### Backend
| ส่วน | เทคโนโลยี |
|---|---|
| Runtime | [Bun](https://bun.sh/) v1.2 |
| Framework | [Elysia](https://elysiajs.com/) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Database | PostgreSQL 18 (with `pg_cron`, `tds_fdw`) |
| Auth | JWT + Cookie-based Refresh Token, arctic (OAuth) |
| AI / LLM | OpenAI GPT-4o-mini |
| OCR | Google Cloud Vision API |
| Vector DB | Qdrant (RAG) |
| Cache | Redis (ioredis) |
| Object Storage | MinIO (AWS S3-compatible) |
| Linting | Biome |

### Frontend
| ส่วน | เทคโนโลยี |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | TailwindCSS v3 |
| State | Zustand |
| HTTP Client | Axios |
| Animation | Framer Motion |
| Charts | Recharts |
| PWA | vite-plugin-pwa |

### Cron Job
| ส่วน | เทคโนโลยี |
|---|---|
| Language | Python 3 |
| Stock Data | yfinance |
| Vector DB | qdrant-client |
| DB | SQLAlchemy + psycopg2 |
| Scheduler | schedule |

---

## 📁 โครงสร้างโปรเจกต์

```
SatiSatang/
├── backend/                  # Elysia API Server (Bun)
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── setup.ts          # Elysia plugins setup (JWT, cookie)
│   │   ├── db/
│   │   │   ├── schema.ts     # Drizzle ORM table definitions
│   │   │   ├── relations.ts  # Table relationships
│   │   │   └── index.ts      # DB connection
│   │   ├── common/
│   │   │   ├── config/       # S3, Qdrant, OpenAI configs
│   │   │   ├── middlewares/  # Auth, Error middlewares
│   │   │   ├── services/     # RAG, OpenAI, OCR, Financial services
│   │   │   └── utils/        # Mail, Token, OAuth, AI Tools, Prompts
│   │   └── modules/          # Feature modules
│   │       ├── auth/         # Login, Register, OAuth, OTP, JWT
│   │       ├── transaction/  # CRUD + OCR Upload + RAG Index
│   │       ├── budget/       # Budget management
│   │       ├── goal/         # Savings goals
│   │       ├── category/     # Categories with icons
│   │       ├── chat/         # Sati & Satang AI chat
│   │       ├── stock/        # Stock data endpoints
│   │       ├── user/         # User profile
│   │       ├── icon/         # Icon management
│   │       └── consent/      # Policy consent tracking
│   ├── dockerfile
│   ├── dockerfile.dev
│   ├── drizzle.config.ts
│   └── package.json
│
├── frontend/                 # React SPA (Vite + PWA)
│   ├── src/
│   │   ├── api/              # Axios instances & auth interceptors
│   │   ├── assets/           # Static assets (images, icons)
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── routes/           # React Router setup
│   │   ├── store/            # Zustand global state
│   │   ├── interface/        # TypeScript interfaces
│   │   └── constants/        # App constants
│   ├── nginx/
│   │   ├── default.conf      # Production nginx config
│   │   └── default.dev.conf  # Dev nginx config
│   ├── dockerfile
│   └── dockerfile.dev
│
├── cron/                     # Python cron job
│   ├── main.py               # Stock updater + Qdrant vector upsert
│   ├── database.py           # SQLAlchemy connection
│   └── requirements.txt
│
├── db/                       # PostgreSQL Docker image
│   ├── SATISATANG.sql        # Schema DDL
│   ├── seeds.sql             # Seed data (preset categories, icons)
│   └── dockerfile
│
└── docker/                   # Docker Compose configs
    ├── docker-compose.yaml       # Production
    └── docker-compose.dev.yaml   # Development
```

---

## 📦 Prerequisites

- [Docker](https://www.docker.com/) + Docker Compose
- (Development) [Bun](https://bun.sh/) v1.2+, Node.js v22+, Python 3.10+
- OpenAI API Key
- Google Cloud Vision API credentials JSON
- Google OAuth 2.0 credentials
- Facebook OAuth credentials (optional)

---

## 🚀 การติดตั้งและรัน

### 1. Clone Repository

```bash
git clone https://github.com/your-username/SatiSatang.git
cd SatiSatang
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในแต่ละโฟลเดอร์ตามตัวอย่างด้านล่าง:

```bash
# ไฟล์ที่ต้องสร้าง
docker/.env
backend/.env
frontend/.env
cron/.env
```

> ⚠️ ดูรายละเอียดแต่ละตัวแปรได้ใน [ส่วน Environment Variables](#-ตัวแปรสภาพแวดล้อม)

---

### 🐳 รันด้วย Docker Compose (แนะนำ)

#### Development

```bash
cd docker
docker compose -f docker-compose.dev.yaml up --build
```

เข้าใช้งานที่: `http://localhost`

| Service | URL |
|---|---|
| Frontend (Nginx Gateway) | http://localhost |
| Backend API | http://localhost/api |
| MinIO Console | http://localhost:${MINIO_CONSOLE_PORT} |
| Qdrant Dashboard | http://localhost:${QDRANT_PORT}/dashboard |

#### Production

```bash
cd docker
docker compose up --build -d
```

---

### 💻 รัน Local (Development โดยไม่ใช้ Docker)

#### Backend

```bash
cd backend
bun install
bun run dev          # Watch mode
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Cron

```bash
cd cron
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python main.py
```

---

### 🗄️ Database Migration

```bash
cd backend
bunx drizzle-kit push     # Push schema to DB
bunx drizzle-kit studio   # Open Drizzle Studio GUI
```

---

## ⚙️ ตัวแปรสภาพแวดล้อม

### `backend/.env`

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# App
PORT=8080
NODE_ENV="development"
JWT_SECRET="your-strong-secret"
APP_SECRET="your-app-secret"
FRONTEND_BASE_URL="http://localhost"
APP_BASE_URL="http://localhost"
ACCESS_TOKEN_EXPIRES="15m"
REFRESH_EXPIRES_DAYS=30

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Google Cloud Vision (OCR)
GOOGLE_APPLICATION_CREDENTIALS="./src/..."

# Qdrant
QDRANT_URL="http://qdrant:6333"
CHAT_COLLECTION="memory"
STOCK_COLLECTION="stocks"
TRANSACTION_COLLECTION="transaction"

# MinIO (S3-compatible)
AWS_REGION="ap-southeast-1"
MINIO_ENDPOINT="http://minio:9000"
MINIO_ROOT_USER="minioadmin"
MINIO_ROOT_PASSWORD="your-password"
MINIO_BUCKET="satisatang"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="http://localhost/api/google/callback"
FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."

# SMTP (Email)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Redis
REDIS_HOST="redis"
REDIS_PORT=6379
REDIS_PASSWORD="your-password"
```

### `frontend/.env`

```env
# Google Apps Script (สำหรับ feedback/reporting ถ้ามี)
VITE_GOOGLE_SCRIPT_URL="https://script.google.com/..."
```

### `docker/.env`

```env
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=sati-satang
DATABASE_PORT=5432
DATABASE_PORT_BIND=5432

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your-password
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001

QDRANT_PORT=6333

REDIS_PASSWORD=your-password
REDIS_PORT=6379
```

### `cron/.env`

```env
DATABASE_URL="postgresql://user:password@db:5432/sati-satang"
SCHEMA=public
QDRANT_HOST="qdrant"
QDRANT_PORT=6333
COLLECTION_NAME="stocks"
OPENAI_API_KEY="sk-proj-..."
```

---

## 📡 API Overview

ทุก endpoint อยู่ภายใต้ prefix `/api`

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/check-email` | ตรวจสอบสถานะอีเมล (sign up / sign in) |
| POST | `/register` | สมัครสมาชิก |
| POST | `/login` | เข้าสู่ระบบ (Local) |
| POST | `/verify-email` | ยืนยัน OTP |
| POST | `/resend-otp` | ขอ OTP ใหม่ |
| GET | `/refreshToken` | Refresh Access Token |
| POST | `/forgot-password` | ขอรีเซ็ตรหัสผ่าน |
| POST | `/reset-password` | รีเซ็ตรหัสผ่าน |
| GET | `/google` | Google OAuth |
| GET | `/facebook` | Facebook OAuth |
| POST | `/logout` | ออกจากระบบ |

### Transactions
| Method | Path | Description |
|---|---|---|
| GET | `/transactions` | ดึงรายการ (paginated, ค้นหาได้) |
| POST | `/transactions` | สร้างรายการ (รองรับ Multipart สำหรับสลิป) |
| PATCH | `/transactions/:id` | แก้ไขรายการ |
| DELETE | `/transactions/:id` | ลบรายการ |
| GET | `/transactions/total` | ยอดรวมรายรับ/รายจ่าย |
| GET | `/transactions/receipt/:id` | ดู URL สลิป (Presigned S3 URL) |
| POST | `/transactions/upload` | อัปโหลดสลิป (OCR สกัดข้อมูล) |
| GET | `/transactions/predict` | ทำนายหมวดหมู่จาก description (ML) |

### Goals, Budgets, Categories, Icons, Chat, Stocks
> ทุก Module มี CRUD มาตรฐาน และ endpoint พิเศษในแต่ละ feature

---

## 🗃️ Database Schema

```
users ─┬─< oauth_accounts
       ├─< refresh_tokens
       ├─< password_reset_tokens
       ├─< email_verifications
       ├─< user_consents
       ├─< categories ──< transactions
       │        └─< budgets
       ├─< goals ──< goal_transactions
       ├─< icons
       └─< chat_sessions ──< chat_messages

stocks   (ข้อมูลหุ้น อัปเดตโดย Cron Job)
```

---

## 👥 Contributors

| ชื่อ | Role |
|---|---|
| [**Apiwat** (@mrapiiwat)](https://github.com/mrapiiwat) | Full-stack Development |
| [**Bhumipax** (@Bahmimoodang)](https://github.com/Bahmimoodang) | UX/UI Design & Frontend |

---

## 📄 License

This project is licensed under the [Apache License 2.0](./LICENSE).