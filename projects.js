// Project card encryption effect
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

document.querySelectorAll('.project-title').forEach(title => {
    const originalText = title.getAttribute('data-encrypt');
    let interval;

    title.closest('.project-card').addEventListener('mouseenter', () => {
        let iterations = 0;
        clearInterval(interval);
        
        interval = setInterval(() => {
            title.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) return originalText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
            
            iterations += 1/3;
            
            if (iterations >= originalText.length) {
                clearInterval(interval);
                title.textContent = originalText;
            }
        }, 30);
        
        title.classList.add('encrypting');
    });

    title.closest('.project-card').addEventListener('mouseleave', () => {
        clearInterval(interval);
        title.textContent = originalText;
        title.classList.remove('encrypting');
    });
});

// Filter functionality
// Filter functionality
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        projectCards.forEach(card => {
            const categories = card.getAttribute('data-category').split(' ');
            
            if (filter === 'all' || categories.includes(filter)) {
                card.classList.remove('hidden');
                card.style.display = 'block';
            } else {
                card.classList.add('hidden');
                setTimeout(() => {
                    if (card.classList.contains('hidden')) {
                        card.style.display = 'none';
                    }
                }, 400);
            }
        });
    });
});