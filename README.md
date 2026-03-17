<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="frontend/public/SATASATANG_LOGO_WH_VERTICAL_EN.svg">
  <img alt="SatiSatang Logo" src="frontend/public/SATASATANG_LOGO_BLACK_VERTICAL_EN.svg" width="170">
</picture>

**แอปพลิเคชันจัดการเงินส่วนตัวระดับพรีเมียม ขับเคลื่อนด้วย AI อัจฉริยะแบบครบวงจร**
*(Progressive Web App - ใช้งานได้เสมือนแอปเนทีฟบนมือถือ)*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.2-FBF0DF?style=flat-square&logo=bun)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Elysia-latest-5C7EE0?style=flat-square)](https://elysiajs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FCM-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)

</div>

---

## 📋 สารบัญ

- [ภาพรวม (Overview)](#-ภาพรวม-overview)
- [ฟีเจอร์เด่นระดับโปรเจกต์ใหญ่ (Key Features)](#-ฟีเจอร์เด่นระดับโปรเจกต์ใหญ่-key-features)
- [สถาปัตยกรรมระดับลึก (Deep Architecture)](#-สถาปัตยกรรมระดับลึก-deep-architecture)
- [Tech Stack เผยรายละเอียด (Full Tech Stack)](#-tech-stack-เผยรายละเอียด-full-tech-stack)
- [โครงสร้างโค้ดและกลไกแฝง (Project Structure & Hidden Mechanics)](#-โครงสร้างโค้ดและกลไกแฝง-project-structure--hidden-mechanics)
- [ก่อนเริ่มใช้งาน (Prerequisites)](#-ก่อนเริ่มใช้งาน-prerequisites)
- [การตั้งค่าและรันโปรเจกต์ (Installation & Running)](#-การตั้งค่าและรันโปรเจกต์-installation--running)
- [ตัวแปรสภาพแวดล้อม (.env Configuration)](#-ตัวแปรสภาพแวดล้อม-env-configuration)
- [โครงสร้างฐานข้อมูลแบบผูกพัน (Database Schema)](#-โครงสร้างฐานข้อมูลแบบผูกพัน-database-schema)
- [ผู้ร่วมพัฒนา (Contributors)](#-ผู้ร่วมพัฒนา-contributors)

---

## 🌟 ภาพรวม (Overview)

**สติสตางค์ (SatiSatang)** เป็นแอปพลิเคชันจัดการและวิเคราะห์การเงินที่ถูกสร้างขึ้นในรูปแบบเชิงบริการเต็มตัว **(Microservices-like PWA)** ที่มาพร้อมฟังก์ชันการเงินที่ครบถ้วน (บัญชีรายรับ-รายจ่าย, งบประมาณ, เป้าหมายการออมเงิน) แต่เหนือชั้นด้วย **AI อัจฉริยะ 2 ระบบ และระบบหลังบ้านที่แน่นหนา**

- **🧠 น้องสติ (Sati)** — AI Chatbot ตอบสนองไวบนหน้าแดชบอร์ด ควบคุมการประมวลผลหมวดหมู่ หรือเป้าหมายด้วยภาษาพูดธรรมดา
- **📈 พี่สตางค์ (Satang)** — ผู้เชี่ยวชาญส่วนตัว (RAG-based AI) ดึงประวัติบัญชี ฐานข้อมูล และบริบทตลาดหุ้นมาตอบคำถามและให้คำปรึกษาการเงินแบบ Real-time
- **☁️ การทำงานเหมือน Native App** — รองรับ Push Notification สมบูรณ์แบบ (Firebase FCM), อัปโหลดรูปภาพผ่าน MinIO และเชื่อมต่อข้อมูลไร้รอยต่อ

---

## ✨ ฟีเจอร์เด่นระดับโปรเจกต์ใหญ่ (Key Features)

| ระบบหลัก | รายละเอียดความสามารถ |
|---|---|
| 🤖 **AI Assistant ขั้นสุด** | บริหาร NLP Classify ด้วยโมเดล Natural.js จับคู่ความน่าจะเป็นของหมวดหมู่. RAG ใช้ Qdrant Vector Search ดึงข้อมูลความจำแชท (`chat_sessions`) ตลอดจนเชื่อมโยงบอทเข้ากับเครื่องมือการเงิน (Toolings & Prompts Engineering ล้ำลึก) |
| 📸 **Cloud Vision OCR AI** | อัปโหลดสลิปโอนเงินธนาคาร แล้วให้ Google Cloud Vision API ดูดตัวหนังสือ ก่อนโยนให้ GPT สกัดมูลค่า, ชื่อบัญชี และวันที่ออกมาเป็นรายการแบบไม่ต้องพิมพ์เอง |
| 🔔 **Push Notifications (FCM)** | **Firebase Cloud Messaging** ผนึกกำลังกับ `vite-plugin-pwa` (Service Worker) พร้อม Service หลังบ้านคอยยิงแจ้งเตือนสถานะงบประมาณ/เป้าหมาย ถึงผู้ใช้บนมือถือ/เว็บ ตรงจุดแบบ Multicast |
| 🛡️ **Auth & Email Verification** | ผูกระบบ Cookie Rotation JWT Security, รองรับ OAuth (Google/FB) และที่สำคัญ: มี **Nodemailer SMTP** เจน OTP และ Template HTML สวยงามส่งหาอีเมลจริงได้ |
| 🎨 **UI / UX พรีเมียมไร้รอยต่อ** | โทนสี Light/Dark Mode ลึกซึ้ง (บันทึกลง Database แบบ Persist). กราฟวิเคราะห์ทำด้วย `recharts`, Animations ด้วย `framer-motion`, และ i18n ที่แปลไทย-อังกฤษแบบเรียลไทม์ (i18next) |
| 🚦 **Rate Limiting & Caching** | มีการนำ `ioredis` มาเขียนตัวจัดการ Token Request/OTP Limit ซ้อนอีกชั้น เพื่อลดภาระโหลดและป้องกันสแปม |
| ⚖️ **Legal Policy & Consent** | ป้องกันทางกฎหมาย PDPA ด้วย Router Interceptor ผู้ใช้ต้องยินยอม Privacy / Terms of Service หรือ AI Disclaimer ระบบจะเก็บ IP และ Version การกดยินยอมลงฐานข้อมูลอย่างรัดกุม |
| 📈 **Automated Cron Jobs** | สคริปต์ Background (Python) ทำงานตามตาราง คอยดึงราคาหุ้นและค่าเงินล่าสุดจาก Yahoo Finance (yfinance) ป้อนเข้า Qdrant เสมอ |

---

## 🏗️ สถาปัตยกรรมระดับลึก (Deep Architecture)

```mermaid
graph TD;
    Users[ผู้ใช้ผ่าน PWA / Browser] -->|HTTPS & Service Worker| Nginx[Nginx Gateway Load Balancer]
    
    %% Nginx Routes
    Nginx -->|/api/*| Backend[Elysia Backend Cluster (Bun)]
    Nginx -->|/* static| Frontend[React Vite SPA]
    
    %% API Services
    Backend -->|Push Event| FCM(Firebase Cloud Messaging & Admin SDK)
    Backend -->|SMTP Email| Mail(Nodemailer Service)
    Backend -->|Drizzle ORM| DB[(PostgreSQL 18 - Source of Truth)]
    Backend -->|RAG Vectorization| Qdrant[(Qdrant Memory & Knowledge)]
    Backend -->|Limit & Auth Cache| Redis[(Redis 7 Cache Layer)]
    Backend -->|S3 Upload Receipt| MinIO[(MinIO Object Storage)]
    Backend -->|OCR API| Vision(Google Cloud Vision)
    Backend -->|Chatbot Prompt| GPT(OpenAI GPT-4o-mini)
    
    %% Cron Worker
    CronJob[Python Daemon Worker] -->|Update Data| MinIO
    CronJob -->|Update Vectors| Backend
    CronJob -->|Fetch External| YFinance(Yahoo Finance API)
    
    %% Mobile Push Route
    FCM -->|Push Notification| Users
```

---

## 🛠️ Tech Stack เผยรายละเอียด (Full Tech Stack)

### 💻 Client Side (Frontend โครงสร้าง PWA)
- **Framework:** React 19 + TypeScript (ผ่าน Vite)
- **PWA & Offline:** `vite-plugin-pwa`, Workbox, Firebase Messaging Service Worker
- **State Management:** Zustand Stores (`authStore`, `settingStore`, `toastStore`) หล่อหลอม API Call ผ่าน Axios Interceptors ที่แนบ JWT Token เสมอ
- **Component Libraries:** Headless UI, SweetAlert2, React Icons
- **Visuals:** TailwindCSS v3 (ออกแบบ Design System แบบฉบับพรีเมียม), Framer Motion, Recharts
- **Internationalization:** i18next + react-i18next
- **Routing:** `react-router-dom` (บังคับทิศทางด้วย `ProtectRoute`, `RedirectIfAuth` และ `ConsentInterceptor`)

### ⚙️ Server Side (Backend ทะลุขีดจำกัด)
- **ElysiaJS x Bun:** เร็วทะลุโลกพร้อม Plugin จุใจ (Cron, JWT)
- **ORM & SQL:** Drizzle ORM คู่กับ PostgreSQL 18
- **Firebase Admin SDK:** ใช้ลงทะเบียนและยิง Notification (FCM Token Handling)
- **Utilities & Logic:** Nodemailer สำหรับส่งเมลส่ง OTP, `ioredis` สำหรับ Caching Logic, `natural` (NLP Node module)
- **Cloud Components:** S3 Presigned URL + MinIO อัปโหลดภาพ (Receipt/Icons), Qdrant สำหรับ Vector Storage เชิงแชท
- **OAuth:** โครงสร้าง OAuth 2.0 จัดการโดย `arctic`

### 🕰️ Background Engine (Cron Jobs)
- **Python 3:** จัดตารางเวลาด้วย Schedule
- **yfinance / SQLAlchemy / qdrant-client:** ดึงตลาดหุ้นและจัดตารางประมวลผลยัดเข้า Vector Database หลังบ้านอัตโนมัติ

---

## 📁 โครงสร้างโค้ดและกลไกแฝง (Project Structure & Hidden Mechanics)

```text
SatiSatang/
├── backend/
│   ├── src/
│   │   ├── index.ts        # รวม Controller (Modular)
│   │   ├── db/             # Drizzle Schema (เป็นศูนย์กลางความถูกต้องของ DB)
│   │   ├── common/         
│   │   │   ├── config/     # Init ฝั่ง Firebase Admin, Qdrant, MinIO, OpenAI
│   │   │   ├── utils/      # Hidden Logic: mail.ts (ส่ง OTP), cache.ts (Redis Rate Limit), prompts.ts (AI Engineer)
│   │   │   └── middlewares/# ตรวจ JWT
│   │   └── modules/        
│   │       ├── auth/       # จัดการ Cookie Rotation, OAuth Callback
│   │       ├── chat/       # กระบวนการ Chatbot ดึง Session เข้าหา OpenAI/Qdrant
│   │       ├── consent/    # ตรวจสอบและบันทึก IP ข้อสัญญาการยินยอม (PDPA)
│   │       ├── notification/# Firebase Cloud Messaging: SendMulticast Push
│   │       └── (Transaction, Goal, Budget, Category, Icon, Stock, Setting, User)
│   └── package.json        # แสดงถึงเครื่องมือต่างๆ (เช่น "@google-cloud/vision")
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # จุดเริ่มต้น: จัดการ i18next ให้ตรงกับ DB AppLanguage เสมอ
│   │   ├── components/     # UI ใช้งานร่วม เช่น Modal, Form, และ PWA Install Prompt
│   │   ├── routes/         # ระบบป้องกันและบังคับ Route ตรวจสถานะล็อกอินและ Consent
│   │   └── store/          # Store เล็กๆ ใช้งานว่องไว 
│   ├── public/             # logo, manifest.webmanifest, firebase-messaging-sw.js (ตัวรับ Push)
│   └── vite.config.ts      # กำหนด VitePWA, Service Workers
│
├── cron/
│   └── main.py             # Script ขยันทำงาน Background (Python)
├── db/
│   └── SATISATANG.sql      # โครงสร้างตารางตอนเปิดระบบ (Initialization)
└── docker/                 # แยก Docker Compose ฝั่ง Dev / Production
```

---

## 📦 ก่อนเริ่มใช้งาน (Prerequisites)

ต้องมีองค์ประกอบดังนี้บนเครือข่ายก่อนเปิดเซิร์ฟเวอร์
1. **Docker & Docker Compose**
2. **OpenAI API Key** (`sk-proj-...`) ขาดไม่ได้สำหรับฟีเจอร์แชทและ RAG 
3. **Google Cloud Vision Credentials File** (ไฟล์ `.json` จาก GCP Service Account เพื่อใช้อ่านสลิป)
4. (แนะนำ) **Firebase FCM Credentials / Client config** (ถ้าต้องการให้ Push Notification และ Service Worker แผลงฤทธิ์)
5. **Google / Facebook OAuth Config**
6. **SMTP Email / App Password** (ต้องการใช้ Nodemailer ในการส่ง OTP สำหรับลงทะเบียน Email)

---

## 🚀 การตั้งค่าและรันโปรเจกต์ (Installation & Running)

### 1. โคลนคลังข้อมูล
```bash
git clone https://github.com/mrapiiwat/SatiSatang.git
cd SatiSatang
```

### 2. กำหนดตัวแปรระบบ (.env)
สร้างไฟล์และเตรียมโครงสร้างตัวแปรใน 4 โฟลเดอร์ `docker/.env`, `backend/.env`, `frontend/.env`, `cron/.env` (ดูได้ที่หัวข้อ [ตัวแปรสภาพแวดล้อม](#-ตัวแปรสภาพแวดล้อม-env-configuration))

### 3. รันระบบทั้งหมดด้วย Docker (Full Development Stack)
> ⚠️ **คำเตือนสถาปัตยกรรม:** ไฟล์ `docker-compose.yaml` ตัวหลักบนระดับชั้น Production จะทำงานเฉพาะ **บริการฐานข้อมูล Stateful** เท่านั้น (`db`, `qdrant`, `redis`) หากต้องการทดสอบระบบและ API เต็มใบพัดให้ใช้ `docker-compose.dev.yaml`
```bash
cd docker
docker compose -f docker-compose.dev.yaml up --build
```
ระบบย่อยต่างๆ จะจำลองขึ้นมาหมด ทั้ง Nginx Proxy รับส่งที่ Port 80 ตลอดจน Minio Port 9001 (รอเปิดใช้งานราวๆ 30 วินาทีให้ Service ทั้งหมดเสถียร).

**จุดเชื่อมต่อเว็บ:** `http://localhost`

### 4. การจัดการฐานข้อมูลแบบ Manual (Development Only)
ถ้าไม่ใช้ Docker ควบคุม Backend และรันผ่านสคริปต์ `bun`:
```bash
cd backend
bunx drizzle-kit push      # ดันอัปเดต Schema เข้า DB ล่าสุด
```

---

## ⚙️ ตัวแปรสภาพแวดล้อม (.env Configuration)

### โฟลเดอร์ `backend/.env` (หัวใจของทุกเซอร์วิส)
```env
# ฐานข้อมูลและพอร์ต
DATABASE_URL="postgresql://postgres:password_ตรงกับ_docker@localhost:5432/sati-satang"
PORT=8080
NODE_ENV="development"

# ความปลอดภัย และ JWT Cookies
JWT_SECRET="YOUR_JWT_SECRET_KEY"
APP_SECRET="YOUR_APP_SECRET_KEY"
FRONTEND_BASE_URL="http://localhost"
APP_BASE_URL="http://localhost"
ACCESS_TOKEN_EXPIRES="15m"
REFRESH_EXPIRES_DAYS=30

# ปัญญาประดิษฐ์และ OCR Vision
OPENAI_API_KEY="sk-proj-xxxxxxxx"
GOOGLE_APPLICATION_CREDENTIALS="./src/common/utils/your-cloud-vision-key.json"

# Vector Database (Qdrant)
QDRANT_URL="http://localhost:6333" 
CHAT_COLLECTION="memory"
STOCK_COLLECTION="stocks"
TRANSACTION_COLLECTION="transaction"

# S3 File Storage (MinIO)
AWS_REGION="ap-southeast-1"
MINIO_ENDPOINT="http://localhost:9000"
MINIO_ROOT_USER="minioadmin"
MINIO_ROOT_PASSWORD="miniopassword"
MINIO_BUCKET="satisatang"

# Firebase Admin SDK (สำหรับ Push แจ้งเตือน ถ้าเซ็ตเพิ่ม)
FIREBASE_PROJECT_ID="your-fb-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Authentication (Social Login)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"
GOOGLE_CALLBACK_URL="http://localhost/api/auth/google/callback"

# อีเมล (Nodemailer OTP System)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app_password"
EMAIL_FROM="SatiSatang Team <your-email@gmail.com>"

# Rate Limit Cache (Redis)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD="redispassword"
```

### โฟลเดอร์ `frontend/.env`
```env
# Firebase Client SDK Credentials (บังคับใช้รัน Service Worker ทำ Notification)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

---

## 🗃️ โครงสร้างฐานข้อมูลแบบผูกพัน (Database Schema)

โครงสร้างฐานข้อมูลผ่านการออกแบบอย่างระมัดระวัง (ตามไฟล์ `src/db/schema.ts` ของ Drizzle ORM):

```text
users ─┬─> oauth_accounts               (ล็อกอินเชื่อมต่อ Google/Facebook)
       ├─> user_settings                (บรรจุความจำแอป Language, App Theme และวันตัดยอดเงิน)
       ├─> user_consents                (ระบบยินยอมนโยบาย/สัญญากฎหมาย ผูกเวอร์ชันและ IP ของผู้ใช้)
       ├─> user_fcm_tokens              (คลังคอยเก็บ Firebase Client Token เพื่อส่ง Push)
       ├─> refresh_tokens               (ความปลอดภัยล็อกอิน)
       ├─> password_reset_tokens
       ├─> email_verifications          (ระบบ OTP)
       │
       ├─> categories ──> transactions  (รายการบันทึกทั้งหมด, ผูกไฟล์สลิป MinIO / โหมดรายรับ-รายจ่าย)
       │        └─> budgets             (งบประมาณตั้งลิมิตค่าใช้จ่าย)
       │
       ├─> goals ──> goal_transactions  (ระบบตู้เซฟเป้าหมายการเงิน และประวัติการสะสม)
       ├─> icons                        (ไอคอนในระบบ)
       └─> chat_sessions ──> chat_messages (ระบบคลังความจำให้ AI RAG - Chat Threading)

stocks   (ตารางลอย: ใช้รับข้อมูลหุ้น/กองทุนจาก Cron Job ภายนอก)
```

---

## 👥 ผู้ร่วมพัฒนา (Contributors)

| ชื่อ | บทบาทและรายละเอียด |
|---|---|
| [**Apiwat** (@mrapiiwat)](https://github.com/mrapiiwat) | Full-stack Development (Architecture, Backend Microservices, DB, DevOps, AI Integrations) |
| [**Bhumipax** (@Bahmimoodang)](https://github.com/Bahmimoodang) | UX/UI Design & Frontend (Design System, SPA Routing, User Experience, Component Structures) |

---

## 📄 License

ลิขสิทธิ์โปรเจกต์ (License) อยู่ภายใต้ [Apache License 2.0](./LICENSE). ครบถ้วนทุกประการ.