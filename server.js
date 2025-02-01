const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Quiz API endpoint with error handling and caching
let cachedQuizData = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get('/api/quiz', async (req, res) => {
  try {
    // Check cache
    if (cachedQuizData && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      return res.json(cachedQuizData);
    }

    const response = await axios.get('https://api.jsonserve.com/Uw5CrX', {
      timeout: 5000, // 5 second timeout
    });

    // Validate response data
    if (!response.data || !Array.isArray(response.data.questions)) {
      throw new Error('Invalid quiz data format');
    }

    // Update cache
    cachedQuizData = response.data;
    lastFetchTime = Date.now();

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching quiz data:', error.message);
    res.status(500).json({
      error: 'Failed to fetch quiz data',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});