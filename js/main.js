/**
 * Main entry point for the 3D Paper Plane Flight Simulator
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const gameCanvas = document.getElementById('game-canvas');
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.querySelector('.progress');
    const loadingText = document.querySelector('.loading-text');
    
    // UI elements
    const speedValue = document.getElementById('speed-value');
    const altitudeValue = document.getElementById('altitude-value');
    const headingValue = document.getElementById('heading-value');
    const messageBox = document.getElementById('message-box') || createMessageBox();
    
    // Game state
    let isLoading = true;
    let loadProgress = 0;
    let lastTime = 0;
    
    // Initialize Three.js
    const renderer = new THREE.WebGLRenderer({
        canvas: gameCanvas,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Set sky color
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        2000 // Far clipping plane
    );
    
    // Create game objects
    let plane, environment, controls, soundManager, mobileUI;
    let airport, cityscape, sky;
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Create message box for crash notifications
    function createMessageBox() {
        const box = document.createElement('div');
        box.id = 'message-box';
        box.style.position = 'absolute';
        box.style.top = '50%';
        box.style.left = '50%';
        box.style.transform = 'translate(-50%, -50%)';
        box.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        box.style.color = 'white';
        box.style.padding = '20px';
        box.style.borderRadius = '10px';
        box.style.textAlign = 'center';
        box.style.fontFamily = 'Arial, sans-serif';
        box.style.zIndex = '1000';
        box.style.display = 'none';
        document.body.appendChild(box);
        return box;
    }
    
    // Show message in the message box
    function showMessage(message, duration = 3000) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, duration);
    }
    
    // Simulate loading progress
    function simulateLoading() {
        const loadingInterval = setInterval(function() {
            loadProgress += Math.random() * 10;
            
            if (loadProgress >= 100) {
                loadProgress = 100;
                clearInterval(loadingInterval);
                
                // Finish loading
                setTimeout(function() {
                    isLoading = false;
                    loadingScreen.style.display = 'none';
                    startGame();
                }, 500);
            }
            
            // Update loading UI
            progressBar.style.width = loadProgress + '%';
            loadingText.textContent = 'Loading... ' + Math.round(loadProgress) + '%';
        }, 200);
    }
    
    // Initialize game
    function init() {
        // Show welcome message
        showMessage("Welcome to Paper Plane Simulator! Use W/S for throttle and arrow keys for direction. Press V to change view.", 5000);
        
        // Start loading simulation
        simulateLoading();
    }
    
    // Create a cockpit frame image
    function createCockpitImage() {
        // Create a canvas to generate the cockpit frame image
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');
        
        // Draw cockpit frame
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw cockpit frame border
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.stroke();
        
        // Draw cockpit window frame
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 30;
        
        // Center window
        const windowWidth = canvas.width * 0.8;
        const windowHeight = canvas.height * 0.7;
        const windowX = (canvas.width - windowWidth) / 2;
        const windowY = (canvas.height - windowHeight) / 3;
        
        // Draw rounded window
        ctx.beginPath();
        ctx.moveTo(windowX, windowY + windowHeight);
        ctx.lineTo(windowX, windowY + windowHeight * 0.3);
        ctx.quadraticCurveTo(windowX, windowY, windowX + windowWidth * 0.3, windowY);
        ctx.lineTo(windowX + windowWidth * 0.7, windowY);
        ctx.quadraticCurveTo(windowX + windowWidth, windowY, windowX + windowWidth, windowY + windowHeight * 0.3);
        ctx.lineTo(windowX + windowWidth, windowY + windowHeight);
        ctx.stroke();
        
        // Draw window dividers
        ctx.beginPath();
        ctx.moveTo(windowX + windowWidth * 0.5, windowY);
        ctx.lineTo(windowX + windowWidth * 0.5, windowY + windowHeight);
        ctx.stroke();
        
        // Draw control panel
        ctx.fillStyle = '#222';
        ctx.fillRect(0, windowY + windowHeight, canvas.width, canvas.height - (windowY + windowHeight));
        
        // Save the image
        const imgData = canvas.toDataURL('image/png');
        
        // Set the image as background for cockpit frame
        const cockpitFrame = document.getElementById('cockpit-frame');
        if (cockpitFrame) {
            cockpitFrame.style.backgroundImage = `url(${imgData})`;
        }
    }
    
    // Start the game
    function startGame() {
        // Add basic lighting to ensure visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 100, 0);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Create environment first
        environment = new Environment(scene);
        
        // Create paper plane
        plane = new PaperPlane(scene);
        
        // Set plane to a good starting position
        plane.position.set(0, 5, 0);
        plane.mesh.position.copy(plane.position);
        
        // Create controls
        controls = new Controls(plane, camera, document);
        
        // Create sound manager
        soundManager = new SoundManager();
        
        // Try to create enhanced environment components
        try {
            // Create airport
            airport = new Airport(scene);
            
            // Create cityscape
            cityscape = new Cityscape(scene);
            
            // Create sky with day/night cycle
            sky = new Sky(scene);
        } catch (e) {
            console.warn("Enhanced environment components not available:", e);
        }
        
        // Set up collision objects - do this after all objects are created
        setupCollisionObjects();
        
        // Set up event listeners
        setupEventListeners();
        
        // Position camera behind the plane for initial view
        camera.position.set(0, 10, 20);
        camera.lookAt(0, 0, 0);
        
        // Start game loop
        lastTime = performance.now();
        gameLoop();
    }
    
    // Set up collision objects for the plane
    function setupCollisionObjects() {
        // Disable collision detection for now to prevent immediate crashes
        if (plane) {
            plane.setCollisionObjects([]);
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Listen for plane crash events
        document.addEventListener('planeCrash', function(event) {
            const reason = event.detail.reason;
            showMessage(reason, 5000);
            
            // Play crash sound
            if (soundManager) {
                soundManager.playCrashSound();
            }
        });
        
        // Listen for plane reset events
        document.addEventListener('planeReset', function() {
            showMessage("Plane has been reset", 2000);
        });
    }
    
    // Main game loop
    function gameLoop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
        lastTime = currentTime;
        
        // Update game objects
        if (!isLoading) {
            // Update plane
            if (plane) plane.update(deltaTime);
            
            // Update environment
            if (environment) environment.update(deltaTime);
            
            // Update enhanced environment components
            if (airport) airport.update(deltaTime);
            if (cityscape) cityscape.update(deltaTime);
            if (sky) sky.update(deltaTime);
            
            // Update controls and camera
            if (controls) controls.update(deltaTime);
            
            // Update sounds
            if (plane && soundManager) {
                const flightData = plane.getFlightData();
                soundManager.update(flightData.speed, flightData.altitude, plane.isGrounded);
            }
            
            // Update UI
            if (plane) {
                const flightData = plane.getFlightData();
                updateUI(flightData);
            }
        }
        
        // Render scene
        renderer.render(scene, camera);
        
        // Request next frame
        requestAnimationFrame(gameLoop);
    }
    
    // Update UI elements
    function updateUI(flightData) {
        if (speedValue) speedValue.textContent = flightData.speed;
        if (altitudeValue) altitudeValue.textContent = flightData.altitude;
        if (headingValue) headingValue.textContent = flightData.heading;
        
        // Update crash status if needed
        if (flightData.crashed) {
            if (speedValue) speedValue.style.color = 'red';
            if (altitudeValue) altitudeValue.style.color = 'red';
            if (headingValue) headingValue.style.color = 'red';
        } else {
            if (speedValue) speedValue.style.color = '';
            if (altitudeValue) altitudeValue.style.color = '';
            if (headingValue) headingValue.style.color = '';
        }
    }
    
    // Update control button visual states
    function updateControlButtonStates() {
        // Update control button states based on current inputs
        // This can be implemented if we add visual control buttons
    }
    
    // Start the game
    init();
    
    // Create cockpit image after a short delay
    setTimeout(createCockpitImage, 100);
});
