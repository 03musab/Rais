const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET /api/portfolio
// Returns all products from Supabase, normalized for the portfolio gallery.
// Expected Supabase columns: id, title, category, image_url (or imageUrl), created_at
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('id, title, category, image_url, imageUrl')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Normalize: support both snake_case (image_url) and camelCase (imageUrl)
        const items = (data || []).map(p => ({
            id: p.id,
            title: p.title || 'Untitled',
            category: p.category || 'embroidery',
            imageUrl: p.image_url || p.imageUrl || ''
        }));

        res.json(items);
    } catch (err) {
        console.error('Portfolio fetch error:', err.message);
        res.status(500).json({ error: 'Failed to load portfolio items.' });
    }
});

module.exports = router;
