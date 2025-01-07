# Hamlet Information System Backend

A robust Node.js backend service for the Hamlet Information System with integrated hoax detection capabilities. This project utilizes Express, PostgreSQL, and various AI services for content verification.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Owner, Admin, User)
  - Token refresh mechanism
  - Rate limiting for sensitive endpoints

- **Hoax Detection**
  - Integration with multiple AI services (Hugging Face, Google Gemini)
  - Real-time content validation
  - Detailed validation reports
  - Optional Google Fact Check Tools integration

- **User Management**
  - Hierarchical user roles
  - Profile management
  - Secure password handling
  - Email verification support

- **Infrastructure**
  - Docker containerization
  - CI/CD pipeline with Jenkins
  - Grafana monitoring integration
  - Comprehensive logging system

## 📋 Prerequisites

- Node.js >= 16
- PostgreSQL
- Docker & Docker Compose (optional)
- Jenkins (optional)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lukmannurh/HIS-Backend.git
   cd HIS-Backend
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Configure your `.env` file with appropriate values:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=his_db
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run database migrations:
   ```bash
   npm run migrate
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using Docker
```bash
docker-compose up -d
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## 📚 API Documentation

API documentation is available through Swagger UI at `/api-docs` when running the server.

### Key Endpoints

- **Authentication**
  - POST `/api/auth/register` - Register new user
  - POST `/api/auth/login` - User login
  - POST `/api/auth/refresh` - Refresh access token
  - POST `/api/auth/logout` - User logout

- **Users**
  - GET `/api/users` - List all users (admin/owner)
  - GET `/api/users/:userId` - Get user details
  - PUT `/api/users/profile` - Update user profile
  - DELETE `/api/users/:userId` - Delete user

- **Reports**
  - POST `/api/reports` - Create new report
  - GET `/api/reports` - List all reports
  - GET `/api/reports/:reportId` - Get report details
  - PUT `/api/reports/:reportId` - Update report
  - DELETE `/api/reports/:reportId` - Delete report

## 🔒 Security Features

- Password encryption using bcrypt
- JWT token encryption
- Rate limiting
- Helmet security headers
- CORS protection
- Input validation & sanitization

## 📊 Monitoring

The application includes Grafana dashboards for monitoring:

- System metrics
- API endpoints performance
- Database statistics
- Error rates and logging

Access Grafana at `http://localhost:3001` with default credentials:
- Username: `admin`
- Password: `admin`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Lukman Nur Hakim** - [Github](https://github.com/lukmannurh)
