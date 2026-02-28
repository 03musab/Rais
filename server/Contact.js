document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const messageContainer = document.getElementById('form-message');

    if (!contactForm) return;

    // Determine API URL based on environment
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_URL = isLocal ? 'http://localhost:5000/api/contact' : 'https://your-deployed-api.com/api/contact';

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        // Reset message container
        messageContainer.style.display = 'none';
        messageContainer.className = '';

        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Success: Show green success message
                messageContainer.textContent = 'Thank you! Your message has been sent successfully.';
                messageContainer.classList.add('success-message');
                messageContainer.style.display = 'block';
                contactForm.reset();
            } else {
                // Error: Show red error message
                throw new Error(result.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
            messageContainer.textContent = error.message || 'Something went wrong. Please try again.';
            messageContainer.classList.add('error-message');
            messageContainer.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
});