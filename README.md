# Hamlet Information System Backend

Proyek **HIS Hoax Checker** dengan Node.js, Express, PostgreSQL, serta integrasi Hoax Checking API (Hugging Face, Gemini, dll.). Dilengkapi CI/CD (Jenkins), Docker, dan contoh monitoring (Grafana).

## Fitur
1. Authentication (JWT).
2. Role-based access (owner, admin, user).
3. Laporan/Report dengan validasi hoax (panggil Hoax Checking API).
4. CI/CD pipeline (Jenkinsfile).
5. Containerization (Docker, docker-compose).
6. Migrations (Sequelize).
7. Contoh Monitoring (Grafana).

## Persiapan

- Node.js >= 16
- PostgreSQL
- (Optional) Docker & Docker Compose
- (Optional) Jenkins

## Menjalankan Secara Lokal

1. Copy `.env.example` ke `.env` lalu atur variabel (DB_HOST, JWT_SECRET, dsb.).
2. `npm install`
3. Jalankan migrations (opsional):
   ```bash
   npx sequelize-cli db:migrate
