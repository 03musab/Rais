const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET /api/reviews
router.get('/', async (req, res) => {
    try {
        // Fetch reviews sorted by newest first
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/reviews
router.post('/', async (req, res) => {
    try {
        const { name, rating, comment } = req.body;

        // Validation
        if (!name || !rating || !comment) {
            return res.status(400).json({ error: 'Please provide name, rating, and comment.' });
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert([{ name, rating: parseInt(rating), comment }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;