const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact - Submit a contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Please provide name, email, and message.' });
        }

        const newContact = new Contact({
            name,
            email,
            phone,
            message
        });

        const savedContact = await newContact.save();
        res.status(201).json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;