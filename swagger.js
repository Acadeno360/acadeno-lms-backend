import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Maitexa LMS API Documentation",
      version: "1.0.0",
      description: "Comprehensive API documentation for the Maitexa Learning Management System backend. This API provides endpoints for user management, authentication, course management, and student/trainer operations.",
      contact: {
        name: "Maitexa API Support",
        email: "support@maitexa.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:5000",
        description: "Development Server",
      },
      {
        url: "https://api.maitexa.com",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from login endpoint",
        },
      },
      schemas: {
        // Base User Schema
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "64c3af23e897ad238cabc123",
              description: "Unique user identifier",
            },
            name: {
              type: "string",
              example: "John Doe",
              description: "Full name of the user",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
              description: "User's email address",
            },
            phone: {
              type: "string",
              example: "+1234567890",
              description: "User's phone number",
            },
            profileImage: {
              type: "string",
              example: "https://example.com/profile.jpg",
              description: "URL to user's profile image",
            },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              example: "male",
              description: "User's gender",
            },
            position: {
              type: "string",
              example: "Software Developer",
              description: "User's position or title",
            },
            role: {
              type: "string",
              enum: ["student", "trainer", "admin", "parent", "hr"],
              example: "student",
              description: "User's role in the system",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-08-01T07:10:47.403Z",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-08-01T07:10:47.403Z",
              description: "User last update timestamp",
            },
          },
          required: ["name", "email", "role"],
        },
        
        // Student Schema
        Student: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              properties: {
                studentId: {
                  type: "string",
                  example: "STD1001",
                  description: "Auto-generated student ID",
                },
                isOnline: {
                  type: "boolean",
                  example: false,
                  description: "Student's online status",
                },
                parent: {
                  type: "string",
                  example: "64c3af23e897ad238cabc124",
                  description: "Reference to parent user",
                },
                assignedTrainer: {
                  type: "string",
                  example: "64c3af23e897ad238cabc125",
                  description: "Reference to assigned trainer",
                },
                course: {
                  type: "string",
                  example: "64c3af23e897ad238cabc126",
                  description: "Reference to enrolled course",
                },
                currentStatus: {
                  type: "string",
                  enum: ["enrolled", "paused", "completed"],
                  example: "enrolled",
                  description: "Student's current enrollment status",
                },
                progress: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                  example: 75,
                  description: "Course progress percentage",
                },
                attendance: {
                  type: "number",
                  example: 85,
                  description: "Attendance percentage",
                },
                fee: {
                  type: "object",
                  properties: {
                    total: {
                      type: "number",
                      example: 5000,
                      description: "Total course fee",
                    },
                    paid: {
                      type: "number",
                      example: 3000,
                      description: "Amount paid",
                    },
                    pending: {
                      type: "number",
                      example: 2000,
                      description: "Pending amount (calculated)",
                    },
                  },
                },
                joinDate: {
                  type: "string",
                  format: "date-time",
                  example: "2024-01-15T00:00:00.000Z",
                  description: "Student enrollment date",
                },
                resumeUrl: {
                  type: "string",
                  example: "https://example.com/resume.pdf",
                  description: "URL to student's resume",
                },
                address: {
                  type: "object",
                  properties: {
                    addressLine: {
                      type: "string",
                      example: "123 Main Street",
                    },
                    pin: {
                      type: "number",
                      example: 12345,
                    },
                  },
                },
                lastLogin: {
                  type: "string",
                  format: "date-time",
                  example: "2024-08-01T10:30:00.000Z",
                  description: "Last login timestamp",
                },
                batchCode: {
                  type: "string",
                  example: "BATCH2024A",
                  description: "Student's batch code",
                },
              },
            },
          ],
        },
        
        // Trainer Schema
        Trainer: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              properties: {
                expertise: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: ["JavaScript", "React", "Node.js"],
                  description: "Areas of expertise",
                },
                availability: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: {
                        type: "string",
                        example: "Monday",
                      },
                      startTime: {
                        type: "string",
                        example: "09:00",
                      },
                      endTime: {
                        type: "string",
                        example: "17:00",
                      },
                    },
                  },
                  description: "Trainer's availability schedule",
                },
                position: {
                  type: "string",
                  example: "Senior Developer",
                  description: "Trainer's position",
                },
                bio: {
                  type: "string",
                  example: "Experienced software developer with 5+ years in web development",
                  description: "Trainer's biography",
                },
                isActive: {
                  type: "boolean",
                  example: true,
                  description: "Trainer's active status",
                },
              },
            },
          ],
        },
        
        // Course Schema
        Course: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "64c3af23e897ad238cabc126",
              description: "Unique course identifier",
            },
            title: {
              type: "string",
              example: "Full Stack Web Development",
              description: "Course title",
            },
            type: {
              type: "string",
              enum: ["internship", "course_project"],
              example: "internship",
              description: "Type of course",
            },
            createdBy: {
              type: "string",
              example: "64c3af23e897ad238cabc123",
              description: "Reference to course creator",
            },
            duration: {
              type: "object",
              properties: {
                years: {
                  type: "number",
                  example: 1,
                },
                months: {
                  type: "number",
                  example: 6,
                },
                days: {
                  type: "number",
                  example: 0,
                },
              },
              description: "Course duration",
            },
            fees: {
              type: "number",
              example: 5000,
              description: "Course fees",
            },
            level: {
              type: "string",
              enum: ["short-term", "beginner", "intermediate", "expert"],
              example: "intermediate",
              description: "Course difficulty level",
            },
            courseHead: {
              type: "string",
              example: "64c3af23e897ad238cabc125",
              description: "Reference to course head/trainer",
            },
            isDeleted: {
              type: "boolean",
              example: false,
              description: "Soft delete flag",
            },
            status: {
              type: "string",
              enum: ["active", "inactive"],
              example: "active",
              description: "Course status",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-08-01T07:10:47.403Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-08-01T07:10:47.403Z",
            },
          },
          required: ["title", "createdBy", "courseHead"],
        },
        
        // Error Response Schema
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Invalid credentials",
            },
            statusCode: {
              type: "number",
              example: 401,
            },
          },
        },
        
        // Success Response Schema
        SuccessResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: {
              type: "object",
              description: "Response data",
            },
            results: {
              type: "number",
              example: 10,
              description: "Number of results (for list operations)",
            },
          },
        },
        
        // Login Request Schema
        LoginRequest: {
          type: "object",
          required: ["email", "password", "role"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
              description: "User's email address",
            },
            password: {
              type: "string",
              example: "password123",
              description: "User's password",
              minLength: 6,
            },
            role: {
              type: "string",
              enum: ["student", "trainer", "admin", "parent", "hr"],
              example: "student",
              description: "User's role for authentication",
            },
          },
        },
        
        // Login Response Schema
        LoginResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              description: "JWT authentication token",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication and authorization endpoints",
      },
      {
        name: "Students",
        description: "Student management operations",
      },
      {
        name: "Trainers",
        description: "Trainer management operations",
      },
      {
        name: "Courses",
        description: "Course management operations",
      },
      {
        name: "Admin",
        description: "Administrative operations",
      },
    ],
  },
  apis: [
    "./routes/users/*.js",
    "./routes/course/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Maitexa LMS API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  }));
  
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Maitexa LMS API is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });
}

export default swaggerDocs;
