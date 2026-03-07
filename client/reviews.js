document.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.querySelector('.reviews-grid');
    const reviewForm = document.querySelector('.review-form-section form');
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

    // Pagination State
    let allReviews = [];
    let currentPage = 1;
    const REVIEWS_PER_PAGE = 3;

    function renderReviews(reviews) {
        allReviews = reviews; // store globally for pagination
        updatePaginationDisplay();
    }

    function updatePaginationDisplay() {
        reviewsContainer.innerHTML = '';

        if (allReviews.length === 0) {
            reviewsContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1; color:#666;">No reviews yet. Be the first to share your experience!</p>';
            document.getElementById('reviews-pagination').innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        const startIdx = (currentPage - 1) * REVIEWS_PER_PAGE;
        const endIdx = startIdx + REVIEWS_PER_PAGE;
        const pageReviews = allReviews.slice(startIdx, endIdx);

        pageReviews.forEach((review, index) => {
            const card = document.createElement('div');
            card.className = 'review-card';
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;

            // Generate stars (filled vs empty)
            const starsHtml = Array.from({ length: 5 }, (_, i) => {
                const isFilled = i < review.rating;
                const colorStyle = isFilled ? '' : 'style="color: #e0e0e0;"';
                return `<i class="fas fa-star" ${colorStyle}></i>`;
            }).join(' ');

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

        renderPaginationControls(totalPages);
    }

    function renderPaginationControls(totalPages) {
        const paginationContainer = document.getElementById('reviews-pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        const createBtn = (html, disabled, onClick, isActive = false) => {
            const btn = document.createElement('button');
            btn.className = 'page-btn' + (isActive ? ' active' : '');
            btn.innerHTML = html;
            btn.disabled = disabled;
            if (!disabled) btn.onclick = onClick;
            return btn;
        };

        const scrollToReviews = () => {
            const headerOffset = 100;
            const elementPosition = reviewsContainer.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        };

        // Prev
        paginationContainer.appendChild(
            createBtn('<i class="fas fa-chevron-left"></i>', currentPage === 1, () => {
                currentPage--; updatePaginationDisplay(); scrollToReviews();
            })
        );

        // Page Numbers
        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 5) {
                if (i !== 1 && i !== totalPages && Math.abs(i - currentPage) > 1) {
                    if (i === 2 && currentPage > 3) {
                        const dots = document.createElement('span');
                        dots.className = 'page-dots';
                        dots.innerText = '...';
                        paginationContainer.appendChild(dots);
                    }
                    if (i === totalPages - 1 && currentPage < totalPages - 2) {
                        const dots = document.createElement('span');
                        dots.className = 'page-dots';
                        dots.innerText = '...';
                        paginationContainer.appendChild(dots);
                    }
                    continue;
                }
            }
            paginationContainer.appendChild(
                createBtn(i, false, () => { currentPage = i; updatePaginationDisplay(); scrollToReviews(); }, i === currentPage)
            );
        }

        // Next
        paginationContainer.appendChild(
            createBtn('<i class="fas fa-chevron-right"></i>', currentPage === totalPages, () => {
                currentPage++; updatePaginationDisplay(); scrollToReviews();
            })
        );
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
        return text.replace(/[&<>"']/g, function (m) {
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