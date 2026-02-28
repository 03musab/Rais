document.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.querySelector('.reviews-grid');
    const reviewForm = document.querySelector('.review-form-section form');
    
    // If running locally, use localhost. If deployed, use your production server URL.
    // TODO: Replace 'https://your-deployed-api.com' with your actual backend URL after hosting.
    const API_URL = '/api/reviews';

    // 1. Load reviews on page load
    fetchReviews();

    // 2. Handle form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }

    async function fetchReviews() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            
            const reviews = await response.json();
            renderReviews(reviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
            reviewsContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1; color:#666;">Unable to load reviews at this time.</p>';
        }
    }

    function renderReviews(reviews) {
        // Clear static HTML content
        reviewsContainer.innerHTML = '';

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1; color:#666;">No reviews yet. Be the first to share your experience!</p>';
            return;
        }

        // Backend already sorts by newest first
        const sortedReviews = reviews;

        sortedReviews.forEach((review, index) => {
            const card = document.createElement('div');
            card.className = 'review-card';
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;

            // Generate stars (filled vs empty)
            const starsHtml = Array.from({ length: 5 }, (_, i) => {
                const isFilled = i < review.rating;
                // Use inline style for empty stars to override CSS color if needed
                const colorStyle = isFilled ? '' : 'style="color: #e0e0e0;"';
                return `<i class="fas fa-star" ${colorStyle}></i>`;
            }).join(' ');

            // Generate initials from name
            const initials = review.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

            card.innerHTML = `
                <div class="stars">${starsHtml}</div>
                <p class="review-text">"${escapeHtml(review.comment)}"</p>
                <div class="customer-info">
                    <div class="avatar">${initials}</div>
                    <div class="customer-name">${escapeHtml(review.name)}</div>
                </div>
            `;

            reviewsContainer.appendChild(card);
        });
    }

    async function handleReviewSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;

        // Map form fields to API fields
        const formData = new FormData(form);
        const reviewData = {
            name: formData.get('name'),
            rating: formData.get('rating'),
            comment: formData.get('message') // HTML name="message", API expects "comment"
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                alert('Review submitted successfully!');
                form.reset();
                fetchReviews(); // Refresh the list
            } else {
                const result = await response.json();
                alert(result.error || 'Error submitting review.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }

    // Helper to prevent XSS injection
    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }
});