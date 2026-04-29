<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./frontend/public/SATASATANG_LOGO_WH_VERTICAL_EN.svg">
    <img alt="SatiSatang Logo" src="./frontend/public/SATASATANG_LOGO_BLACK_VERTICAL_EN.svg" width="170">
  </picture>
</p>

<p align="center">
  <a href="https://สติสตางค์.com" target="_blank" rel="noopener noreferrer"><strong>Live Demo</strong> - https://สติสตางค์.com</a>
</p>

<p align="center">
  <a href="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  </a>
  <a href="https://www.python.org" target="_blank">
    <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  </a>
  <a href="https://bun.sh" target="_blank">
    <img src="https://img.shields.io/badge/Bun-1.2-ffffff?style=for-the-badge&logo=bun" alt="Bun" />
  </a>
  <a href="https://react.dev" target="_blank">
    <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React" />
  </a>
  <a href="https://vite.dev" target="_blank">
    <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="https://v2.tailwindcss.com/" target="_blank">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  </a>
  <a href="https://elysiajs.com" target="_blank">
    <img src="https://img.shields.io/badge/Elysia-latest-0099ff?style=for-the-badge" alt="Elysia" />
  </a>
  <a href="https://www.postgresql.org" target="_blank">
    <img src="https://img.shields.io/badge/PostgreSQL-18-316192?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  </a>
  <a href="https://orm.drizzle.team" target="_blank">
    <img src="https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F?style=for-the-badge&logo=drizzle" alt="Drizzle ORM" />
  </a>
  <a href="https://qdrant.tech" target="_blank">
    <img src="https://img.shields.io/badge/Qdrant-Vector_DB-ff4b4b?style=for-the-badge&logo=qdrant" alt="Qdrant" />
  </a>
  <a href="https://redis.io" target="_blank">
    <img src="https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  </a>
  <a href="https://www.nginx.com" target="_blank">
    <img src="https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
  </a>
  <br>
  <a href="https://openai.com" target="_blank">
    <img src="https://img.shields.io/badge/OpenAI-GPT--4o--mini-000000?style=for-the-badge&logo=openai" alt="OpenAI" />
  </a>
  <a href="https://cloud.google.com/vision" target="_blank">
    <img src="https://img.shields.io/badge/Google_Cloud-Vision_AI-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Vision" />
  </a>
  <a href="https://firebase.google.com" target="_blank">
    <img src="https://img.shields.io/badge/Firebase-FCM-ffca28?style=for-the-badge&logo=firebase" alt="Firebase" />
  </a>
  <a href="https://biomejs.dev" target="_blank">
    <img src="https://img.shields.io/badge/Biome-Toolchain-60a5fa?style=for-the-badge&logo=biome" alt="Biome" />
  </a>
  <a href="https://docusaurus.io" target="_blank">
    <img src="https://img.shields.io/badge/Docusaurus-3.x-3ecc5f?style=for-the-badge&logo=docusaurus&logoColor=white" alt="Docusaurus" />
  </a>
</p>

---

## เริ่มต้นใช้งาน

### 1. เตรียมโปรเจกต์และไฟล์ Environment
```bash
git clone https://github.com/mrapiiwat/SatiSatang.git && cd SatiSatang
cp docker/.env.example docker/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp cron/.env.example cron/.env
```
> [!IMPORTANT]
> **อย่าลืม:** แก้ไขไฟล์ `.env` และใส่ค่าคอนฟิกจริง (เช่น Database, API Keys, OAuth Secrets)

### 2. รันระบบด้วย Docker Compose
```bash
cd docker && docker compose -f docker-compose.dev.yaml up -d --build
```


| Path      | Service        | Description              |
| --------- | -------------- | ------------------------ |
| `/`       | **Frontend**   | Web Application UI       |
| `/api/*`  | **Backend API**| ElysiaJS API Endpoints   |
| `/docs/*` | **Docs**       | Project Documentation    |

---

## CI/CD

ใช้ **GitHub Actions** บน branch `main` และ `develop`

| Category  | Tooling           | Purpose                  |
| --------- | ----------------- | ------------------------ |
| **Backend**  | Biome             | Linting & Formatting     |
| **Frontend** | ESLint + Prettier | Code Quality Standards   |
| **Docs**     | Docusaurus        | Documentation Generation |
| **Cron**     | Black + isort     | Python PEP 8 Compliance  |
| **Docker**   | Buildx            | Multi-platform Builds    |

---

## License

[Apache License 2.0](LICENSE)

---

<p align="center">
  <sub>Built with ❤️ by the SatiSatang team</sub>
</p>