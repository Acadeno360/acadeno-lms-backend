# Maitexa LMS API Documentation

## Overview

The Maitexa Learning Management System (LMS) API provides comprehensive endpoints for managing students, trainers, courses, and authentication in an educational platform. This API is built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd maitexa-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
npm start
```

## 📚 API Documentation

### Interactive Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: `http://localhost:5000/api-docs`
- **OpenAPI JSON**: `http://localhost:5000/swagger.json`
- **Health Check**: `http://localhost:5000/health`

### API Base URL

```
http://localhost:5000/api/v1
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid JWT token in the Authorization header.

### Getting a Token

1. Use the login endpoint to authenticate:
```bash
POST /api/v1/user/auth/login
```

2. Include the token in subsequent requests:
```
Authorization: Bearer <your-jwt-token>
```

## 📋 API Endpoints

### Authentication (`/api/v1/user/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | No |
| GET | `/me` | Get current user | Yes |

### Students (`/api/v1/user/student`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/list` | Fetch all students | Yes | admin, trainer |
| POST | `/create` | Create new student | Yes | admin |

### Trainers (`/api/v1/user/trainer`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/list` | Fetch all trainers | Yes | admin, trainer |
| POST | `/create` | Create new trainer | Yes | admin |

### Courses (`/api/v1/course`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/add` | Create new course | Yes | admin |

## 🏗️ Data Models

### User (Base Model)
```json
{
  "_id": "64c3af23e897ad238cabc123",
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "profileImage": "https://example.com/profile.jpg",
  "gender": "male",
  "position": "Software Developer",
  "role": "student",
  "createdAt": "2024-08-01T07:10:47.403Z",
  "updatedAt": "2024-08-01T07:10:47.403Z"
}
```

### Student (Extended User)
```json
{
  "studentId": "STD1001",
  "isOnline": false,
  "parent": "64c3af23e897ad238cabc124",
  "assignedTrainer": "64c3af23e897ad238cabc125",
  "course": "64c3af23e897ad238cabc126",
  "currentStatus": "enrolled",
  "progress": 75,
  "attendance": 85,
  "fee": {
    "total": 5000,
    "paid": 3000,
    "pending": 2000
  },
  "joinDate": "2024-01-15T00:00:00.000Z",
  "resumeUrl": "https://example.com/resume.pdf",
  "address": {
    "addressLine": "123 Main Street",
    "pin": 12345
  },
  "lastLogin": "2024-08-01T10:30:00.000Z",
  "batchCode": "BATCH2024A"
}
```

### Trainer (Extended User)
```json
{
  "expertise": ["JavaScript", "React", "Node.js"],
  "availability": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ],
  "position": "Senior Developer",
  "bio": "Experienced software developer with 5+ years in web development",
  "isActive": true
}
```

### Course
```json
{
  "_id": "64c3af23e897ad238cabc126",
  "title": "Full Stack Web Development",
  "type": "internship",
  "createdBy": "64c3af23e897ad238cabc123",
  "duration": {
    "years": 1,
    "months": 6,
    "days": 0
  },
  "fees": 5000,
  "level": "intermediate",
  "courseHead": "64c3af23e897ad238cabc125",
  "isDeleted": false,
  "status": "active",
  "createdAt": "2024-08-01T07:10:47.403Z",
  "updatedAt": "2024-08-01T07:10:47.403Z"
}
```

## 🔧 Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Invalid credentials",
  "statusCode": 401
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🛠️ Development

### Project Structure

```
maitexa-backend/
├── app.js                 # Main application file
├── swagger.js            # Swagger configuration
├── config/               # Configuration files
├── controllers/          # Route controllers
├── middlewares/          # Custom middlewares
├── models/              # Database models
├── repositories/        # Data access layer
├── routes/              # API routes
├── services/            # Business logic
└── utils/               # Utility functions
```

### Adding New Endpoints

1. Create the controller in `controllers/`
2. Add the route in `routes/`
3. Document the endpoint using Swagger JSDoc comments
4. Update the main router in `app.js`

### Example Swagger Documentation

```javascript
/**
 * @swagger
 * /api/v1/example:
 *   get:
 *     summary: Example endpoint
 *     description: This is an example endpoint
 *     tags: [Example]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Example'
 */
```

## 🧪 Testing

### Using the Swagger UI

1. Navigate to `http://localhost:5000/api-docs`
2. Click "Authorize" and enter your JWT token
3. Test endpoints directly from the interface

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/v1/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","role":"student"}'

# Use token for authenticated requests
curl -X GET http://localhost:5000/api/v1/user/auth/me \
  -H "Authorization: Bearer <your-token>"
```

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/maitexa
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=90d
BASE_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Email: support@maitexa.com
- Documentation: `http://localhost:5000/api-docs`
- Issues: Create an issue in the repository

---

**Note**: This documentation is automatically generated from the Swagger configuration. For the most up-to-date information, always refer to the interactive Swagger UI at `/api-docs`. 