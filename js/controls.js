/**
 * Controls for the Flight Simulator
 */
class Controls {
    constructor(plane, camera, domElement) {
        this.plane = plane;
        this.camera = camera;
        this.domElement = domElement || document;
        
        // Camera settings
        this.cameraOffset = new THREE.Vector3(0, 2, 8); // Default third-person view
        this.cockpitOffset = new THREE.Vector3(0, 0.5, 0); // Cockpit view
        this.lookAtOffset = new THREE.Vector3(0, 0, -10); // Look ahead
        
        // View settings
        this.currentView = 'third-person'; // 'third-person', 'cockpit', 'orbit'
        this.orbitControls = null;
        
        // Mouse look
        this.mouseLook = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseSensitivity = 0.002;
        
        // Control states
        this.throttleUp = false;
        this.throttleDown = false;
        this.pitchUp = false;
        this.pitchDown = false;
        this.rollLeft = false;
        this.rollRight = false;
        
        // Control settings
        this.invertedControls = true; // Inverted controls (down arrow makes plane rise)
        
        // UI elements
        this.throttleUpBtn = document.getElementById('throttle-up');
        this.throttleDownBtn = document.getElementById('throttle-down');
        this.pitchUpBtn = document.getElementById('pitch-up');
        this.pitchDownBtn = document.getElementById('pitch-down');
        this.rollLeftBtn = document.getElementById('roll-left');
        this.rollRightBtn = document.getElementById('roll-right');
        this.viewToggleBtn = document.getElementById('view-toggle');
        this.cockpitElement = document.getElementById('cockpit');
        
        // Initialize controls
        this.setupKeyboardControls();
        this.setupMouseControls();
        this.setupTouchControls();
        this.setupUIControls();
    }
    
    setupKeyboardControls() {
        // Keyboard event listeners
        this.domElement.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        this.domElement.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }
    
    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'w':
                this.throttleUp = true;
                this.throttleUpBtn.classList.add('active');
                break;
            case 's':
                this.throttleDown = true;
                this.throttleDownBtn.classList.add('active');
                break;
            case 'arrowup':
                // With inverted controls, arrow up makes the plane go down
                if (this.invertedControls) {
                    this.pitchDown = true;
                    this.pitchDownBtn.classList.add('active');
                } else {
                    this.pitchUp = true;
                    this.pitchUpBtn.classList.add('active');
                }
                break;
            case 'arrowdown':
                // With inverted controls, arrow down makes the plane go up
                if (this.invertedControls) {
                    this.pitchUp = true;
                    this.pitchUpBtn.classList.add('active');
                } else {
                    this.pitchDown = true;
                    this.pitchDownBtn.classList.add('active');
                }
                break;
            case 'arrowleft':
                this.rollLeft = true;
                this.rollLeftBtn.classList.add('active');
                break;
            case 'arrowright':
                this.rollRight = true;
                this.rollRightBtn.classList.add('active');
                break;
            case 'v':
                this.toggleView();
                break;
            case 'm':
                this.toggleMouseLook();
                break;
            case 'i':
                this.toggleInvertedControls();
                break;
        }
    }
    
    handleKeyUp(e) {
        switch (e.key.toLowerCase()) {
            case 'w':
                this.throttleUp = false;
                this.throttleUpBtn.classList.remove('active');
                break;
            case 's':
                this.throttleDown = false;
                this.throttleDownBtn.classList.remove('active');
                break;
            case 'arrowup':
                // With inverted controls, arrow up makes the plane go down
                if (this.invertedControls) {
                    this.pitchDown = false;
                    this.pitchDownBtn.classList.remove('active');
                } else {
                    this.pitchUp = false;
                    this.pitchUpBtn.classList.remove('active');
                }
                break;
            case 'arrowdown':
                // With inverted controls, arrow down makes the plane go up
                if (this.invertedControls) {
                    this.pitchUp = false;
                    this.pitchUpBtn.classList.remove('active');
                } else {
                    this.pitchDown = false;
                    this.pitchDownBtn.classList.remove('active');
                }
                break;
            case 'arrowleft':
                this.rollLeft = false;
                this.rollLeftBtn.classList.remove('active');
                break;
            case 'arrowright':
                this.rollRight = false;
                this.rollRightBtn.classList.remove('active');
                break;
        }
    }
    
    setupMouseControls() {
        // Mouse movement for looking around
        this.domElement.addEventListener('mousemove', (e) => {
            if (this.mouseLook) {
                this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            }
        });
        
        // Mouse click to toggle mouse look
        this.domElement.addEventListener('click', () => {
            if (this.currentView === 'cockpit') {
                this.toggleMouseLook();
            }
        });
    }
    
    setupTouchControls() {
        // Touch events for mobile devices
        this.touchActive = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchCurrentX = 0;
        this.touchCurrentY = 0;
        this.touchThrottleZone = false;
        
        // Create touch joystick elements
        this.createTouchJoystick();
        
        // Touch start event
        this.domElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            // Get the first touch
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.touchCurrentX = touch.clientX;
            this.touchCurrentY = touch.clientY;
            this.touchActive = true;
            
            // Check if touch is in throttle zone (bottom 20% of screen)
            if (touch.clientY > window.innerHeight * 0.8) {
                this.touchThrottleZone = true;
            } else {
                this.touchThrottleZone = false;
                // Show the joystick
                this.showJoystick(touch.clientX, touch.clientY);
            }
        });
        
        // Touch move event
        this.domElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (!this.touchActive) return;
            
            // Get the first touch
            const touch = e.touches[0];
            this.touchCurrentX = touch.clientX;
            this.touchCurrentY = touch.clientY;
            
            if (this.touchThrottleZone) {
                // Handle throttle control
                const deltaX = this.touchCurrentX - this.touchStartX;
                // Map horizontal movement to throttle (right = increase, left = decrease)
                const throttleChange = deltaX / (window.innerWidth * 0.5);
                this.throttleUp = throttleChange > 0.1;
                this.throttleDown = throttleChange < -0.1;
            } else {
                // Handle flight controls with joystick
                this.updateJoystickPosition(touch.clientX, touch.clientY);
                
                // Calculate joystick displacement
                const deltaX = this.touchCurrentX - this.touchStartX;
                const deltaY = this.touchCurrentY - this.touchStartY;
                
                // Normalize to -1 to 1 range
                const maxDistance = 100; // Maximum joystick distance in pixels
                const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
                const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));
                
                // Apply to flight controls
                this.rollLeft = normalizedX < -0.2;
                this.rollRight = normalizedX > 0.2;
                
                if (this.invertedControls) {
                    this.pitchUp = normalizedY > 0.2;
                    this.pitchDown = normalizedY < -0.2;
                } else {
                    this.pitchUp = normalizedY < -0.2;
                    this.pitchDown = normalizedY > 0.2;
                }
            }
        });
        
        // Touch end event
        this.domElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            // Reset touch state
            this.touchActive = false;
            this.touchThrottleZone = false;
            this.throttleUp = false;
            this.throttleDown = false;
            this.pitchUp = false;
            this.pitchDown = false;
            this.rollLeft = false;
            this.rollRight = false;
            
            // Hide the joystick
            this.hideJoystick();
        });
    }
    
    createTouchJoystick() {
        // Create joystick container
        this.joystickContainer = document.createElement('div');
        this.joystickContainer.id = 'touch-joystick-container';
        this.joystickContainer.style.position = 'absolute';
        this.joystickContainer.style.width = '120px';
        this.joystickContainer.style.height = '120px';
        this.joystickContainer.style.borderRadius = '60px';
        this.joystickContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.joystickContainer.style.border = '2px solid rgba(255, 255, 255, 0.4)';
        this.joystickContainer.style.display = 'none';
        this.joystickContainer.style.zIndex = '100';
        
        // Create joystick handle
        this.joystickHandle = document.createElement('div');
        this.joystickHandle.id = 'touch-joystick-handle';
        this.joystickHandle.style.position = 'absolute';
        this.joystickHandle.style.width = '50px';
        this.joystickHandle.style.height = '50px';
        this.joystickHandle.style.borderRadius = '25px';
        this.joystickHandle.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        this.joystickHandle.style.border = '2px solid rgba(255, 255, 255, 0.8)';
        this.joystickHandle.style.top = '35px';
        this.joystickHandle.style.left = '35px';
        
        // Add joystick handle to container
        this.joystickContainer.appendChild(this.joystickHandle);
        
        // Add joystick container to document
        document.body.appendChild(this.joystickContainer);
        
        // Create throttle indicator
        this.throttleIndicator = document.createElement('div');
        this.throttleIndicator.id = 'touch-throttle-indicator';
        this.throttleIndicator.style.position = 'absolute';
        this.throttleIndicator.style.bottom = '10px';
        this.throttleIndicator.style.left = '50%';
        this.throttleIndicator.style.transform = 'translateX(-50%)';
        this.throttleIndicator.style.width = '80%';
        this.throttleIndicator.style.height = '40px';
        this.throttleIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.throttleIndicator.style.borderRadius = '20px';
        this.throttleIndicator.style.display = 'none';
        this.throttleIndicator.style.zIndex = '100';
        
        // Create throttle text
        this.throttleText = document.createElement('div');
        this.throttleText.style.position = 'absolute';
        this.throttleText.style.top = '50%';
        this.throttleText.style.left = '50%';
        this.throttleText.style.transform = 'translate(-50%, -50%)';
        this.throttleText.style.color = 'white';
        this.throttleText.style.fontFamily = 'Arial, sans-serif';
        this.throttleText.style.fontSize = '16px';
        this.throttleText.textContent = 'THROTTLE: Slide left/right';
        
        // Add throttle text to indicator
        this.throttleIndicator.appendChild(this.throttleText);
        
        // Add throttle indicator to document
        document.body.appendChild(this.throttleIndicator);
    }
    
    showJoystick(x, y) {
        // Position joystick at touch location
        this.joystickContainer.style.display = 'block';
        this.joystickContainer.style.left = (x - 60) + 'px';
        this.joystickContainer.style.top = (y - 60) + 'px';
        
        // Reset handle position
        this.joystickHandle.style.top = '35px';
        this.joystickHandle.style.left = '35px';
    }
    
    hideJoystick() {
        this.joystickContainer.style.display = 'none';
    }
    
    updateJoystickPosition(x, y) {
        // Calculate joystick handle position
        const containerRect = this.joystickContainer.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.top + containerRect.height / 2;
        
        // Calculate displacement from center
        let deltaX = x - centerX;
        let deltaY = y - centerY;
        
        // Limit to circular bounds
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = containerRect.width / 2 - 25; // Radius minus handle radius
        
        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * maxDistance;
            deltaY = Math.sin(angle) * maxDistance;
        }
        
        // Update handle position
        this.joystickHandle.style.left = (60 + deltaX) + 'px';
        this.joystickHandle.style.top = (60 + deltaY) + 'px';
    }
    
    setupUIControls() {
        // UI button click handlers
        this.throttleUpBtn.addEventListener('mousedown', () => { this.throttleUp = true; });
        this.throttleUpBtn.addEventListener('mouseup', () => { this.throttleUp = false; });
        this.throttleUpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.throttleUp = true; });
        this.throttleUpBtn.addEventListener('touchend', () => { this.throttleUp = false; });
        
        this.throttleDownBtn.addEventListener('mousedown', () => { this.throttleDown = true; });
        this.throttleDownBtn.addEventListener('mouseup', () => { this.throttleDown = false; });
        this.throttleDownBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.throttleDown = true; });
        this.throttleDownBtn.addEventListener('touchend', () => { this.throttleDown = false; });
        
        this.pitchUpBtn.addEventListener('mousedown', () => { 
            if (this.invertedControls) {
                this.pitchDown = true;
            } else {
                this.pitchUp = true;
            }
        });
        this.pitchUpBtn.addEventListener('mouseup', () => { 
            if (this.invertedControls) {
                this.pitchDown = false;
            } else {
                this.pitchUp = false;
            }
        });
        this.pitchUpBtn.addEventListener('touchstart', (e) => { 
            e.preventDefault(); 
            if (this.invertedControls) {
                this.pitchDown = true;
            } else {
                this.pitchUp = true;
            }
        });
        this.pitchUpBtn.addEventListener('touchend', () => { 
            if (this.invertedControls) {
                this.pitchDown = false;
            } else {
                this.pitchUp = false;
            }
        });
        
        this.pitchDownBtn.addEventListener('mousedown', () => { 
            if (this.invertedControls) {
                this.pitchUp = true;
            } else {
                this.pitchDown = true;
            }
        });
        this.pitchDownBtn.addEventListener('mouseup', () => { 
            if (this.invertedControls) {
                this.pitchUp = false;
            } else {
                this.pitchDown = false;
            }
        });
        this.pitchDownBtn.addEventListener('touchstart', (e) => { 
            e.preventDefault(); 
            if (this.invertedControls) {
                this.pitchUp = true;
            } else {
                this.pitchDown = true;
            }
        });
        this.pitchDownBtn.addEventListener('touchend', () => { 
            if (this.invertedControls) {
                this.pitchUp = false;
            } else {
                this.pitchDown = false;
            }
        });
        
        this.rollLeftBtn.addEventListener('mousedown', () => { this.rollLeft = true; });
        this.rollLeftBtn.addEventListener('mouseup', () => { this.rollLeft = false; });
        this.rollLeftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.rollLeft = true; });
        this.rollLeftBtn.addEventListener('touchend', () => { this.rollLeft = false; });
        
        this.rollRightBtn.addEventListener('mousedown', () => { this.rollRight = true; });
        this.rollRightBtn.addEventListener('mouseup', () => { this.rollRight = false; });
        this.rollRightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.rollRight = true; });
        this.rollRightBtn.addEventListener('touchend', () => { this.rollRight = false; });
        
        this.viewToggleBtn.addEventListener('click', () => { this.toggleView(); });
    }
    
    toggleView() {
        switch (this.currentView) {
            case 'third-person':
                this.currentView = 'cockpit';
                this.cockpitElement.style.display = 'block';
                break;
            case 'cockpit':
                this.currentView = 'orbit';
                this.cockpitElement.style.display = 'none';
                this.setupOrbitControls();
                break;
            case 'orbit':
                this.currentView = 'third-person';
                this.cockpitElement.style.display = 'none';
                this.disableOrbitControls();
                break;
        }
    }
    
    toggleMouseLook() {
        this.mouseLook = !this.mouseLook;
        
        if (this.mouseLook) {
            this.domElement.style.cursor = 'none';
        } else {
            this.domElement.style.cursor = 'auto';
            this.mouseX = 0;
            this.mouseY = 0;
        }
    }
    
    toggleInvertedControls() {
        this.invertedControls = !this.invertedControls;
        
        // Show a message about control inversion
        const message = document.createElement('div');
        message.style.position = 'absolute';
        message.style.top = '20px';
        message.style.left = '50%';
        message.style.transform = 'translateX(-50%)';
        message.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        message.style.color = 'white';
        message.style.padding = '10px';
        message.style.borderRadius = '5px';
        message.style.fontFamily = 'Arial, sans-serif';
        message.style.zIndex = '1000';
        message.textContent = this.invertedControls ? 
            'Inverted Controls: ON (Down arrow makes plane rise)' : 
            'Inverted Controls: OFF (Up arrow makes plane rise)';
        
        document.body.appendChild(message);
        
        // Remove the message after a few seconds
        setTimeout(() => {
            document.body.removeChild(message);
        }, 3000);
    }
    
    setupOrbitControls() {
        if (!this.orbitControls) {
            this.orbitControls = new THREE.OrbitControls(this.camera, this.domElement);
            this.orbitControls.enableDamping = true;
            this.orbitControls.dampingFactor = 0.05;
        }
        
        this.orbitControls.enabled = true;
    }
    
    disableOrbitControls() {
        if (this.orbitControls) {
            this.orbitControls.enabled = false;
        }
    }
    
    update(deltaTime) {
        // Update plane controls based on input
        this.updatePlaneControls(deltaTime);
        
        // Update camera position based on view mode
        this.updateCamera(deltaTime);
        
        // Show/hide throttle indicator based on touch state
        if (this.touchThrottleZone && this.touchActive) {
            this.throttleIndicator.style.display = 'block';
        } else {
            this.throttleIndicator.style.display = 'none';
        }
    }
    
    updatePlaneControls(deltaTime) {
        // Throttle control
        let throttle = this.plane.throttle;
        
        if (this.throttleUp) {
            throttle += 0.5 * deltaTime;
        }
        
        if (this.throttleDown) {
            throttle -= 0.5 * deltaTime;
        }
        
        this.plane.setThrottle(throttle);
        
        // Pitch control
        let pitchInput = 0;
        
        if (this.pitchUp) {
            pitchInput = 1;
        } else if (this.pitchDown) {
            pitchInput = -1;
        }
        
        this.plane.setPitch(pitchInput);
        
        // Roll control
        let rollInput = 0;
        
        if (this.rollLeft) {
            rollInput = 1;
        } else if (this.rollRight) {
            rollInput = -1;
        }
        
        this.plane.setRoll(rollInput);
    }
    
    updateCamera(deltaTime) {
        const planePosition = this.plane.getPosition();
        const planeRotation = this.plane.getRotation();
        
        if (this.currentView === 'third-person') {
            // Third-person view - camera follows behind the plane
            const offset = this.cameraOffset.clone();
            
            // Rotate offset based on plane rotation
            offset.applyEuler(new THREE.Euler(0, planeRotation.y, 0));
            
            // Position camera
            this.camera.position.copy(planePosition).add(offset);
            
            // Look at point ahead of the plane
            const lookAtOffset = this.lookAtOffset.clone().applyEuler(new THREE.Euler(0, planeRotation.y, 0));
            this.camera.lookAt(planePosition.clone().add(lookAtOffset));
            
        } else if (this.currentView === 'cockpit') {
            // Cockpit view - camera is inside the plane
            const offset = this.cockpitOffset.clone();
            
            // Apply plane rotation to offset
            offset.applyEuler(planeRotation);
            
            // Position camera
            this.camera.position.copy(planePosition).add(offset);
            
            // Look direction
            const lookDirection = new THREE.Vector3(0, 0, -1);
            
            // Apply mouse look if enabled
            if (this.mouseLook) {
                lookDirection.x += this.mouseX * 0.5;
                lookDirection.y += this.mouseY * 0.5;
            }
            
            // Apply plane rotation to look direction
            lookDirection.applyEuler(planeRotation);
            
            // Set camera look at
            this.camera.lookAt(planePosition.clone().add(lookDirection));
            
        } else if (this.currentView === 'orbit' && this.orbitControls) {
            // Orbit view - controlled by OrbitControls
            // Just update the target to follow the plane
            this.orbitControls.target.copy(planePosition);
            this.orbitControls.update();
        }
    }
}
