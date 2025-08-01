import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import logger from './utils/logger.js'
import errorHandler from './middlewares/errorHandler.js'
import userRouter from './routes/users/userRoutes.js'
import courseRouter from './routes/course/courseRoutes.js'
import swaggerDocs from './swagger.js'

dotenv.config()  // configure env variables

const app = express(); 
const port = process.env.PORT || 8000; 


app.use(express.json()); // Enable parsing of JSON request bodies

connectDB()
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => logger.error('❌ MongoDB connection error: ' + err));

app.use(express.urlencoded({ extended: true })); // Enable parsing of URL-encoded request bodies
app.use(cors({
    origin: '*',
}));

app.get('/', (req, res)=> {
  res.send('Hello world')
})

swaggerDocs(app);

app.use('/api/v1/user', userRouter)

app.use('/api/v1/course', courseRouter)

// 404 handler
// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// // Global error handler middleware (last)
app.use(errorHandler);


app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).send('Something went wrong');
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