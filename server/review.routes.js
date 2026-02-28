const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// GET /api/reviews - Get all reviews
router.get('/', async (req, res) => {
    try {
        // Fetch reviews sorted by newest first
        const reviews = await Review.find().sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/reviews - Add a new review
router.post('/', async (req, res) => {
    try {
        const { name, rating, comment } = req.body;

        // Validation
        if (!name || !rating || !comment) {
            return res.status(400).json({ error: 'Please provide name, rating, and comment.' });
        }

        const newReview = new Review({
            name,
            rating,
            comment
        });

        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;