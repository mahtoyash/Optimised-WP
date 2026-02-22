document.addEventListener('DOMContentLoaded', function() {
    const logoContainer = document.getElementById('animatedLogo');
    const logoGrid = document.getElementById('logoGrid');
    const gridSize = 4; // 4x4 grid
    const cells = [];
    let animationTimeout;
    let isAnimating = false;

    // Create grid cells
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'logo-grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            logoGrid.appendChild(cell);
            cells.push(cell);
        }
    }

    // Function to calculate distance from starting point (top-left corner)
    function getDistanceFromStart(row, col) {
        return row + col;
    }

    // Function to get cells in virus spread pattern from top-left
    function getVirusSpreadOrder() {
        const cellsWithDistance = [];
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const index = row * gridSize + col;
                const distance = getDistanceFromStart(row, col);
                cellsWithDistance.push({ index, distance, row, col });
            }
        }
        
        cellsWithDistance.sort((a, b) => {
            if (a.distance !== b.distance) {
                return a.distance - b.distance;
            }
            return Math.random() - 0.5;
        });
        
        return cellsWithDistance.map(cell => cell.index);
    }

    const virusSpreadOrder = getVirusSpreadOrder();

    // Animate cells filling (virus spread from top-left)
    function animateFill() {
        if (isAnimating) return;
        isAnimating = true;
        
        logoContainer.classList.add('vibrating');
        
        virusSpreadOrder.forEach((index, i) => {
            setTimeout(() => {
                cells[index].classList.add('active');
            }, i * 8);
        });
        
        setTimeout(() => {
            logoContainer.classList.remove('vibrating');
        }, virusSpreadOrder.length * 8 + 100);
    }

    // Animate cells emptying (REVERSE order - First In Last Out)
    function animateEmpty() {
        isAnimating = false;
        
        logoContainer.classList.add('vibrating');
        
        const reverseOrder = [...virusSpreadOrder].reverse();
        
        reverseOrder.forEach((index, i) => {
            setTimeout(() => {
                cells[index].classList.remove('active');
            }, i * 8);
        });
        
        setTimeout(() => {
            logoContainer.classList.remove('vibrating');
        }, reverseOrder.length * 8 + 100);
    }

    // Mouse enter event
    logoContainer.addEventListener('mouseenter', () => {
        clearTimeout(animationTimeout);
        animateFill();
    });

    // Mouse leave event
    logoContainer.addEventListener('mouseleave', () => {
        animationTimeout = setTimeout(() => {
            animateEmpty();
        }, 100);
    });

    // Magnetic effect
    const magneticDistance = 100;
    const maxPull = 30;

    document.addEventListener('mousemove', (e) => {
        const rect = logoContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const distanceX = mouseX - centerX;
        const distanceY = mouseY - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        if (distance < magneticDistance) {
            const pullStrength = 1 - (distance / magneticDistance);
            const moveX = (distanceX / distance) * maxPull * pullStrength;
            const moveY = (distanceY / distance) * maxPull * pullStrength;
            
            logoContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
            logoContainer.style.transform = 'translate(0, 0)';
        }
    });
});