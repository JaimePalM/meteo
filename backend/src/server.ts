import app from './app';
import pool from './models/database';

const PORT = process.env.API_PORT || 5000;

// Test database connection
pool.query('SELECT NOW()', (err: Error | null) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Database connected successfully');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
