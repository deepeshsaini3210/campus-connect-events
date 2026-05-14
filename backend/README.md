# Event Discovery & Booking Backend

A production-ready, enterprise-grade backend for University Event Discovery and Booking Platform built with Spring Boot and clean architecture principles.

## 🏗️ Architecture

This project follows a **3-module clean architecture**:

### 📁 Module Structure

```
backend/
├── api/                    # API Module
│   ├── entities/          # JPA Entities
│   ├── dto/               # Data Transfer Objects
│   └── common/            # Common API utilities
├── service/              # Service Module  
│   ├── impl/             # Service Implementations
│   ├── repository/       # JPA Repositories
│   ├── mapper/           # MapStruct Mappers
│   └── security/         # Security Configuration
└── app/                  # Application Module
    ├── controller/       # REST Controllers
    ├── main/             # Main Application Class
    └── resources/        # Configuration Files
```

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Email verification structure
- Password reset functionality
- 5 user roles: Student, College Admin, Event Organizer, External Partner, Super Admin

### 👥 User Management
- Multi-role user system with college associations
- Profile management
- Account activation/deactivation
- Email verification system

### 📅 Event Management
- Complete CRUD operations for events
- Event approval workflow
- Event categories and highlights
- Featured events system
- Advanced search and filtering
- Seat availability management
- Multi-mode events (Online, Offline, Hybrid)

### 🎫 Booking System
- Event registration with seat management
- QR code generation structure
- Booking confirmation and cancellation
- Booking history
- Payment-ready architecture

### 🤝 Collaboration Features
- Inter-college partnerships
- Collaboration requests and approvals
- Cross-college event participation
- Special offers management

### 📢 Notification System
- Real-time notifications
- Email notifications structure
- Event reminders
- Approval notifications

### 📊 Admin Dashboard
- Analytics and reporting structure
- User management
- Event approval workflow
- Participation statistics

## 🛠️ Technology Stack

- **Java 17** - Programming Language
- **Spring Boot 3.2.5** - Application Framework
- **Spring Security 6** - Security Framework
- **JWT** - Authentication Tokens
- **MySQL 8.3** - Primary Database
- **JPA/Hibernate** - ORM Framework
- **MapStruct** - DTO Mapping
- **Swagger/OpenAPI 3** - API Documentation
- **Lombok** - Code Generation
- **Maven** - Build Tool
- **TestContainers** - Integration Testing

## 📋 Database Schema

The system uses a comprehensive relational database schema with the following main entities:

- **Users** - User accounts with roles and college associations
- **Roles** - User roles and permissions
- **Colleges** - Educational institutions
- **Events** - Event listings with categories and details
- **Bookings** - Event registrations and tickets
- **Collaborations** - College partnerships
- **Notifications** - User notifications
- **Audit Logs** - System audit trail

See `database-schema.sql` for complete schema definition.

## 🔧 Setup & Installation

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Git

### Database Setup

1. Create MySQL database:
```bash
mysql -u root -p < database-schema.sql
```

2. Update database configuration in `app/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/event_discovery_db
    username: your_username
    password: your_password
```

### Build & Run

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run -pl app
```

The application will start on `http://localhost:8080/api`

## 📚 API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/api-docs

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

#### Events
- `GET /api/v1/events` - Search events
- `POST /api/v1/events` - Create event
- `GET /api/v1/events/{id}` - Get event details
- `PUT /api/v1/events/{id}` - Update event
- `DELETE /api/v1/events/{id}` - Delete event

#### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/my-bookings` - Get user bookings
- `POST /api/v1/bookings/{id}/cancel` - Cancel booking

## 🧪 Testing

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

### Test Coverage
The project includes comprehensive test coverage using:
- JUnit 5
- Mockito
- TestContainers for database testing
- Spring Boot Test

## 🔒 Security

### Authentication
- JWT tokens with configurable expiration
- Refresh token mechanism
- Password encryption with BCrypt

### Authorization
- Role-based access control
- Method-level security annotations
- API endpoint protection

### Security Headers
- CORS configuration
- XSS protection
- CSRF protection

## 📊 Monitoring & Health

### Actuator Endpoints
- `/api/actuator/health` - Application health
- `/api/actuator/metrics` - Application metrics
- `/api/actuator/info` - Application information

### Logging
- Structured logging with log levels
- Request/response logging
- Error tracking

## 🚀 Deployment

### Production Configuration
- Environment-specific configurations
- Database connection pooling
- Performance optimization
- Security hardening

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT secret key | `mySecretKey...` |
| `JWT_EXPIRATION` | JWT expiration (ms) | `86400000` |
| `MAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `MAIL_USERNAME` | Email username | - |
| `MAIL_PASSWORD` | Email password | - |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔄 Version History

- **v1.0.0-SNAPSHOT** - Initial release with core functionality
  - Authentication & Authorization
  - Event Management
  - Booking System
  - Collaboration Features
  - Notification System
  - Admin Dashboard APIs

---

**Built with ❤️ for University Event Management**
