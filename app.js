import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()  // configure env variables

const app = express(); 
const port = process.env.PORT || 8000; 


app.use(express.json()); // Enable parsing of JSON request bodies
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