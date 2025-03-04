/**
 * Mobile UI for the 3D Paper Plane Flight Simulator
 * Provides mobile-friendly controls and UI elements
 */
class MobileUI {
    constructor(game) {
        this.game = game;
        this.isMobile = this.detectMobile();
        this.isVisible = false;
        
        // UI elements
        this.container = null;
        this.fullscreenButton = null;
        this.helpButton = null;
        this.helpPanel = null;
        
        // Initialize if on mobile device
        if (this.isMobile) {
            this.init();
        }
    }
    
    // Detect if user is on a mobile device
    detectMobile() {
        return (
            navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)
        );
    }
    
    // Initialize mobile UI
    init() {
        // Create container for mobile UI elements
        this.container = document.createElement('div');
        this.container.id = 'mobile-ui-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '100';
        
        // Add to document
        document.body.appendChild(this.container);
        
        // Create UI elements
        this.createFullscreenButton();
        this.createHelpButton();
        this.createMobileHelpPanel();
        
        // Show mobile-specific welcome message
        this.showWelcomeMessage();
        
        // Set visible
        this.isVisible = true;
        
        // Add orientation change listener
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });
        
        // Check initial orientation
        this.handleOrientationChange();
    }
    
    // Create fullscreen button
    createFullscreenButton() {
        this.fullscreenButton = document.createElement('div');
        this.fullscreenButton.id = 'mobile-fullscreen-button';
        this.fullscreenButton.className = 'mobile-ui-button';
        this.fullscreenButton.innerHTML = '<span>⛶</span>';
        this.fullscreenButton.style.position = 'absolute';
        this.fullscreenButton.style.top = '10px';
        this.fullscreenButton.style.right = '10px';
        this.fullscreenButton.style.width = '50px';
        this.fullscreenButton.style.height = '50px';
        this.fullscreenButton.style.borderRadius = '25px';
        this.fullscreenButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.fullscreenButton.style.color = 'white';
        this.fullscreenButton.style.display = 'flex';
        this.fullscreenButton.style.justifyContent = 'center';
        this.fullscreenButton.style.alignItems = 'center';
        this.fullscreenButton.style.fontSize = '24px';
        this.fullscreenButton.style.pointerEvents = 'auto';
        this.fullscreenButton.style.cursor = 'pointer';
        
        // Add to container
        this.container.appendChild(this.fullscreenButton);
        
        // Add event listener
        this.fullscreenButton.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }
    
    // Create help button
    createHelpButton() {
        this.helpButton = document.createElement('div');
        this.helpButton.id = 'mobile-help-button';
        this.helpButton.className = 'mobile-ui-button';
        this.helpButton.innerHTML = '<span>?</span>';
        this.helpButton.style.position = 'absolute';
        this.helpButton.style.top = '10px';
        this.helpButton.style.left = '10px';
        this.helpButton.style.width = '50px';
        this.helpButton.style.height = '50px';
        this.helpButton.style.borderRadius = '25px';
        this.helpButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.helpButton.style.color = 'white';
        this.helpButton.style.display = 'flex';
        this.helpButton.style.justifyContent = 'center';
        this.helpButton.style.alignItems = 'center';
        this.helpButton.style.fontSize = '24px';
        this.helpButton.style.pointerEvents = 'auto';
        this.helpButton.style.cursor = 'pointer';
        
        // Add to container
        this.container.appendChild(this.helpButton);
        
        // Add event listener
        this.helpButton.addEventListener('click', () => {
            this.toggleHelpPanel();
        });
    }
    
    // Create mobile help panel
    createMobileHelpPanel() {
        this.helpPanel = document.createElement('div');
        this.helpPanel.id = 'mobile-help-panel';
        this.helpPanel.style.position = 'absolute';
        this.helpPanel.style.top = '50%';
        this.helpPanel.style.left = '50%';
        this.helpPanel.style.transform = 'translate(-50%, -50%)';
        this.helpPanel.style.width = '80%';
        this.helpPanel.style.maxWidth = '400px';
        this.helpPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.helpPanel.style.color = 'white';
        this.helpPanel.style.padding = '20px';
        this.helpPanel.style.borderRadius = '10px';
        this.helpPanel.style.fontFamily = 'Arial, sans-serif';
        this.helpPanel.style.zIndex = '1000';
        this.helpPanel.style.pointerEvents = 'auto';
        this.helpPanel.style.display = 'none';
        
        // Help content
        this.helpPanel.innerHTML = `
            <h2 style="text-align: center; margin-top: 0;">Mobile Controls</h2>
            <p><b>Virtual Joystick:</b> Touch and drag anywhere on the screen to control pitch and roll.</p>
            <p><b>Throttle:</b> Slide left/right in the bottom area of the screen to control speed.</p>
            <p><b>View Toggle:</b> Tap the "V" button to switch between views.</p>
            <p><b>Sound Toggle:</b> Tap the sound icon to mute/unmute.</p>
            <div style="text-align: center; margin-top: 20px;">
                <button id="mobile-help-close" style="background-color: #4CAF50; border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Got it!</button>
            </div>
        `;
        
        // Add to container
        this.container.appendChild(this.helpPanel);
        
        // Add event listener to close button
        setTimeout(() => {
            const closeButton = document.getElementById('mobile-help-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.toggleHelpPanel(false);
                });
            }
        }, 0);
    }
    
    // Show welcome message for mobile users
    showWelcomeMessage() {
        const message = document.createElement('div');
        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        message.style.color = 'white';
        message.style.padding = '20px';
        message.style.borderRadius = '10px';
        message.style.fontFamily = 'Arial, sans-serif';
        message.style.zIndex = '1000';
        message.style.maxWidth = '80%';
        message.style.textAlign = 'center';
        
        message.innerHTML = `
            <h2 style="margin-top: 0;">Welcome to Paper Plane Simulator!</h2>
            <p>Mobile controls have been enabled:</p>
            <p>• Use the virtual joystick to control the plane</p>
            <p>• Slide at the bottom of the screen to control throttle</p>
            <p>• Tap the ? button for help anytime</p>
            <div style="margin-top: 20px;">
                <button id="mobile-welcome-close" style="background-color: #4CAF50; border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Let's Fly!</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(message);
        
        // Add event listener to close button
        setTimeout(() => {
            const closeButton = document.getElementById('mobile-welcome-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(message);
                });
            }
        }, 0);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 10000);
    }
    
    // Toggle fullscreen mode
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    // Toggle help panel
    toggleHelpPanel(show) {
        if (show === undefined) {
            show = this.helpPanel.style.display === 'none';
        }
        
        this.helpPanel.style.display = show ? 'block' : 'none';
    }
    
    // Handle orientation change
    handleOrientationChange() {
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isPortrait) {
            this.showOrientationWarning(true);
        } else {
            this.showOrientationWarning(false);
        }
    }
    
    // Show/hide orientation warning
    showOrientationWarning(show) {
        let warning = document.getElementById('orientation-warning');
        
        if (show) {
            if (!warning) {
                warning = document.createElement('div');
                warning.id = 'orientation-warning';
                warning.style.position = 'absolute';
                warning.style.top = '0';
                warning.style.left = '0';
                warning.style.width = '100%';
                warning.style.height = '100%';
                warning.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                warning.style.color = 'white';
                warning.style.display = 'flex';
                warning.style.flexDirection = 'column';
                warning.style.justifyContent = 'center';
                warning.style.alignItems = 'center';
                warning.style.zIndex = '2000';
                warning.style.textAlign = 'center';
                warning.style.padding = '20px';
                
                warning.innerHTML = `
                    <div style="font-size: 40px; margin-bottom: 20px;">📱↔️</div>
                    <h2>Please Rotate Your Device</h2>
                    <p>This game works best in landscape mode.</p>
                `;
                
                document.body.appendChild(warning);
            }
        } else {
            if (warning) {
                document.body.removeChild(warning);
            }
        }
    }
    
    // Update method called from main game loop
    update(deltaTime) {
        // Only update if visible and on mobile
        if (!this.isVisible || !this.isMobile) return;
        
        // Any update logic for mobile UI can go here
    }
}
