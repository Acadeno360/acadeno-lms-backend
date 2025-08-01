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
      description: "Comprehensive API docs for the Maitexa LMS backend",
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:5000",
        description: "Development Server",
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
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

export default swaggerDocs;
