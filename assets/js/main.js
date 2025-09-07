// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Simple blinking cursor animation
setInterval(() => {
    const cursor = document.querySelector('.blink');
    if (cursor) {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }
}, 500);