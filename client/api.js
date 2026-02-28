const express = require('express');
const router = express.Router();

// Mock data for reviews (Temporary storage)
const reviews = [
  { id: 1, name: 'Happy Customer', rating: 5, comment: 'Excellent embroidery work!', date: new Date().toISOString() },
  { id: 2, name: 'Local Business', rating: 4, comment: 'Great service and timing.', date: new Date().toISOString() }
];

// POST /api/contact
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email, and message.' });
  }

  // TODO: Implement email sending service (e.g., Nodemailer)
  console.log('Contact Form Submission:', { name, email, message });

  res.status(200).json({ message: 'Message received successfully!' });
});

// GET /api/reviews
router.get('/reviews', (req, res) => {
  res.json(reviews);
});

// POST /api/reviews
router.post('/reviews', (req, res) => {
  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ error: 'Please provide name, rating, and comment.' });
  }

  const newReview = {
    id: reviews.length + 1,
    name,
    rating: Number(rating),
    comment,
    date: new Date().toISOString()
  };

  reviews.push(newReview);
  res.status(201).json({ message: 'Review added successfully', review: newReview });
});

module.exports = router;