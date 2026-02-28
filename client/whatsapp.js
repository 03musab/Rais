document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const phoneNumber = '1234567890'; // Replace with your actual business number
    const message = 'Hello! I would like to inquire about your embroidery services.';

    // Create button element
    const whatsappBtn = document.createElement('a');
    whatsappBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    whatsappBtn.className = 'whatsapp-float';
    whatsappBtn.target = '_blank';
    whatsappBtn.rel = 'noopener noreferrer';
    whatsappBtn.setAttribute('aria-label', 'Chat on WhatsApp');

    // Add icon (Using FontAwesome class as seen in reviews.js)
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';

    // Append to body
    document.body.appendChild(whatsappBtn);
});