require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true
  }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes

// ... previous imports ...

// Route files
const auth = require('./routes/auth');
const tasks = require('./routes/tasks');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/tasks', tasks);

// ... rest of the code ...

app.get('/', (req, res) => {
  res.send('MERN Task Manager API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));