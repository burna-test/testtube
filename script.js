document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const planeContainer = document.getElementById('plane-container');
    const plane = document.getElementById('plane');
    const speedValue = document.getElementById('speed-value');
    const altitudeValue = document.getElementById('altitude-value');
    const engineSound = document.getElementById('engine-sound');
    const world = document.getElementById('world');
    const clouds = document.querySelectorAll('.cloud');
    const trees = document.querySelectorAll('.tree');
    const runway = document.getElementById('runway');
    const runwayLines = document.querySelectorAll('.runway-line');
    
    // Game state
    let gameStarted = false;
    let speed = 0;
    let altitude = 0;
    let planeX = 50; // Percentage across screen
    let planeY = 32; // Percentage from bottom
    let planeRotationX = 0;
    let planeRotationY = 0;
    let planeRotationZ = 0;
    let isAccelerating = false;
    let isDecelerating = false;
    let isPitchingUp = false;
    let isPitchingDown = false;
    let isRollingLeft = false;
    let isRollingRight = false;
    
    // Constants
    const MAX_SPEED = 500;
    const MIN_SPEED = 0;
    const ACCELERATION = 2;
    const DECELERATION = 1;
    const ROTATION_SPEED = 2;
    const GRAVITY = 0.5;
    const LIFT_FACTOR = 0.1;
    
    // Sound settings
    engineSound.volume = 0;
    
    // Initialize game
    function init() {
        // Position plane at start of runway
        planeContainer.style.left = '10%';
        planeContainer.style.bottom = '32%';
        
        // Set up event listeners
        setupControls();
        
        // Start game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Set up keyboard controls
    function setupControls() {
        document.addEventListener('keydown', function(e) {
            switch(e.key.toLowerCase()) {
                case 'w':
                    isAccelerating = true;
                    break;
                case 's':
                    isDecelerating = true;
                    break;
                case 'arrowup':
                    isPitchingUp = true;
                    break;
                case 'arrowdown':
                    isPitchingDown = true;
                    break;
                case 'arrowleft':
                    isRollingLeft = true;
                    break;
                case 'arrowright':
                    isRollingRight = true;
                    break;
            }
        });
        
        document.addEventListener('keyup', function(e) {
            switch(e.key.toLowerCase()) {
                case 'w':
                    isAccelerating = false;
                    break;
                case 's':
                    isDecelerating = false;
                    break;
                case 'arrowup':
                    isPitchingUp = false;
                    break;
                case 'arrowdown':
                    isPitchingDown = false;
                    break;
                case 'arrowleft':
                    isRollingLeft = false;
                    break;
                case 'arrowright':
                    isRollingRight = false;
                    break;
            }
        });
    }
    
    // Main game loop
    function gameLoop() {
        updatePlanePosition();
        updatePlaneRotation();
        updateWorldElements();
        updateUI();
        updateSound();
        
        requestAnimationFrame(gameLoop);
    }
    
    // Update plane position based on controls and physics
    function updatePlanePosition() {
        // Update speed
        if (isAccelerating) {
            speed = Math.min(speed + ACCELERATION, MAX_SPEED);
        }
        
        if (isDecelerating) {
            speed = Math.max(speed - DECELERATION, MIN_SPEED);
        }
        
        // Calculate lift based on speed and pitch
        const lift = speed * LIFT_FACTOR * (1 + planeRotationX / 45);
        
        // Apply gravity if in air
        if (altitude > 0 || lift > GRAVITY) {
            // If lift exceeds gravity, plane rises
            altitude += lift - GRAVITY;
        } else {
            altitude = Math.max(0, altitude);
        }
        
        // Move plane forward based on speed
        if (altitude === 0) {
            // On ground, move along runway
            planeX += speed * 0.01;
        } else {
            // In air, move based on speed and direction
            planeX += speed * 0.01 * Math.cos(planeRotationY * Math.PI / 180);
        }
        
        // Update plane container position
        planeContainer.style.left = `${planeX}%`;
        planeContainer.style.bottom = `${planeY + altitude * 0.1}%`;
        
        // Start the game when plane moves
        if (speed > 0 && !gameStarted) {
            gameStarted = true;
            engineSound.play();
        }
    }
    
    // Update plane rotation based on controls
    function updatePlaneRotation() {
        // Pitch (rotation around X axis)
        if (isPitchingUp) {
            planeRotationX = Math.min(planeRotationX + ROTATION_SPEED, 45);
        } else if (isPitchingDown) {
            planeRotationX = Math.max(planeRotationX - ROTATION_SPEED, -45);
        } else {
            // Return to level flight gradually
            if (planeRotationX > 0) {
                planeRotationX = Math.max(0, planeRotationX - ROTATION_SPEED * 0.5);
            } else if (planeRotationX < 0) {
                planeRotationX = Math.min(0, planeRotationX + ROTATION_SPEED * 0.5);
            }
        }
        
        // Roll (rotation around Z axis)
        if (isRollingLeft) {
            planeRotationZ = Math.min(planeRotationZ + ROTATION_SPEED, 45);
            // Turning effect when rolling
            planeRotationY = Math.max(planeRotationY - ROTATION_SPEED * 0.2, -45);
        } else if (isRollingRight) {
            planeRotationZ = Math.max(planeRotationZ - ROTATION_SPEED, -45);
            // Turning effect when rolling
            planeRotationY = Math.min(planeRotationY + ROTATION_SPEED * 0.2, 45);
        } else {
            // Return to level flight gradually
            if (planeRotationZ > 0) {
                planeRotationZ = Math.max(0, planeRotationZ - ROTATION_SPEED * 0.5);
            } else if (planeRotationZ < 0) {
                planeRotationZ = Math.min(0, planeRotationZ + ROTATION_SPEED * 0.5);
            }
        }
        
        // Apply rotations to plane element
        plane.style.transform = `rotateX(${planeRotationX}deg) rotateY(${planeRotationY}deg) rotateZ(${planeRotationZ}deg)`;
    }
    
    // Update world elements (clouds, trees, etc.)
    function updateWorldElements() {
        // Move clouds based on speed
        clouds.forEach((cloud, index) => {
            let cloudLeft = parseFloat(getComputedStyle(cloud).left);
            cloudLeft -= speed * 0.05;
            
            // Reset cloud position when it goes off screen
            if (cloudLeft < -150) {
                cloudLeft = window.innerWidth + Math.random() * 200;
            }
            
            cloud.style.left = `${cloudLeft}px`;
        });
        
        // Move trees and other ground elements if plane is moving
        if (speed > 0) {
            trees.forEach((tree, index) => {
                let treeLeft = parseFloat(getComputedStyle(tree).left);
                treeLeft -= speed * 0.1;
                
                // Reset tree position when it goes off screen
                if (treeLeft < -100) {
                    treeLeft = window.innerWidth + Math.random() * 200;
                }
                
                tree.style.left = `${treeLeft}px`;
            });
            
            // Move runway lines
            runwayLines.forEach((line, index) => {
                let lineLeft = parseFloat(getComputedStyle(line).left);
                lineLeft -= speed * 0.1;
                
                // Reset line position when it goes off screen
                if (lineLeft < -20) {
                    lineLeft = 100;
                }
                
                line.style.left = `${lineLeft}%`;
            });
        }
    }
    
    // Update UI elements
    function updateUI() {
        speedValue.textContent = Math.round(speed);
        altitudeValue.textContent = Math.round(altitude);
    }
    
    // Update sound based on speed
    function updateSound() {
        // Adjust volume based on speed
        engineSound.volume = Math.min(speed / MAX_SPEED, 0.7);
        
        // Adjust playback rate based on speed
        engineSound.playbackRate = 0.5 + (speed / MAX_SPEED) * 1.5;
    }
    
    // Initialize the game
    init();
});
