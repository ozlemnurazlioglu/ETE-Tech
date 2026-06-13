import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ETE Technology API!' });
});

// Routes
app.use('/api', routes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
