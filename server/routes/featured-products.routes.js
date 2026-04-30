const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET /api/featured-products
// Returns products marked as featured from Supabase.
// Expected Supabase columns: id, title, category, image_url, featured, created_at
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('id, title, category, image_url, featured')
            .eq('featured', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const items = (data || []).map(p => ({
            id: p.id,
            title: p.title || 'Untitled',
            category: p.category || 'embroidery',
            imageUrl: p.image_url || '',
            featured: p.featured || false
        }));

        res.json(items);
    } catch (err) {
        console.error('Featured products fetch error:', err.message);
        res.status(500).json({ error: 'Failed to load featured products.' });
    }
});

module.exports = router;
