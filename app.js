import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'

dotenv.config()  // configure env variables

const app = express(); 
const port = process.env.PORT || 8000; 


app.use(express.json()); // Enable parsing of JSON request bodies

connectDB()

app.use(express.urlencoded({ extended: true })); // Enable parsing of URL-encoded request bodies
app.use(cors({
    origin: '*',
}));

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!'); // Basic GET route for the root path
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`); // Log a message when the server starts
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  server.close(() => {
    console.log('Express server closed.');
    process.exit(0);
  });
});