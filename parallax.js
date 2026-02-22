// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Ultra-smooth parallax with velocity-based easing for maximum fluidity
    const columns = document.querySelectorAll('[data-speed]');
    
    // Debug: Check if columns are found
    console.log('Columns found:', columns.length);
    
    let targetPositions = [];
    let currentPositions = [];
    let velocities = [];

    // Initialize positions
    columns.forEach((column, index) => {
        targetPositions[index] = 0;
        currentPositions[index] = 0;
        velocities[index] = 0;
    });

    // Smooth lerp with velocity for buttery animation
    function smoothDamp(current, target, velocity, smoothTime) {
        const omega = 2 / smoothTime;
        const x = omega * 0.016; // Assuming 60fps
        const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        
        let change = current - target;
        const maxChange = 9999;
        change = Math.max(-maxChange, Math.min(change, maxChange));
        
        const temp = (velocity + omega * change) * 0.016;
        velocity = (velocity - omega * temp) * exp;
        let output = target + (change + temp) * exp;
        
        return { value: output, velocity: velocity };
    }

    // Update target positions on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        columns.forEach((column, index) => {
            const speed = parseFloat(column.dataset.speed);
            targetPositions[index] = -(scrolled * speed);
        });
    });

    // Silky smooth animation loop
    function animate() {
        columns.forEach((column, index) => {
            // Apply smooth damping for fluid jelly-like motion
            const result = smoothDamp(
                currentPositions[index], 
                targetPositions[index], 
                velocities[index], 
                0.15 + (index * 0.05) // Different smoothing per column
            );
            
            currentPositions[index] = result.value;
            velocities[index] = result.velocity;
            
            column.style.transform = `translateY(${currentPositions[index]}px)`;
        });
        
        requestAnimationFrame(animate);
    }

    // Only start animation if columns exist
    if (columns.length > 0) {
        animate();
    } else {
        console.warn('No elements with data-speed attribute found!');
    }
});