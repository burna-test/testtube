/**
 * Sky and Weather for the Flight Simulator
 * Handles day/night cycle, stars, clouds, and weather effects
 */
class Sky {
    constructor(scene) {
        this.scene = scene;
        this.skyObjects = [];
        
        // Sky state
        this.timeOfDay = 0.25; // Start at morning (0 = midnight, 0.25 = sunrise, 0.5 = noon)
        this.daySpeed = 0.0001; // Slower day/night cycle (20 min = ~1200 seconds)
        this.isManualTime = false; // Whether time is manually set or cycles
        this.totalFlightTime = 0; // Track total flight time
        this.lastDayNightState = 'day'; // Track current day/night state
        
        // Lighting
        this.ambientLight = null;
        this.sunLight = null;
        this.moonLight = null;
        
        // Sky objects
        this.skyDome = null;
        this.sunSphere = null;
        this.moonSphere = null;
        this.stars = null;
        this.clouds = [];
        
        // Initialize
        this.setupLighting(); // Setup lighting first
        this.createSky();
        this.createSun();
        this.createMoon();
        this.createStars();
        this.createClouds();
        
        // Initial update to set correct lighting
        this.update(0);
    }
    
    createSky() {
        // Create sky dome
        const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
        
        // Create shader material for sky with day/night cycle
        const skyUniforms = {
            topColor: { value: new THREE.Color(0x0077FF) },
            bottomColor: { value: new THREE.Color(0x89CFF0) },
            offset: { value: 400 },
            exponent: { value: 0.6 },
            time: { value: this.timeOfDay }
        };
        
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: skyUniforms,
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                uniform float time;
                varying vec3 vWorldPosition;
                
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    float dayFactor = sin(time * 3.14159265359);
                    
                    // Day colors
                    vec3 dayTopColor = topColor;
                    vec3 dayBottomColor = bottomColor;
                    
                    // Night colors
                    vec3 nightTopColor = vec3(0.0, 0.0, 0.05);
                    vec3 nightBottomColor = vec3(0.05, 0.05, 0.1);
                    
                    // Blend between day and night colors
                    vec3 finalTopColor = mix(nightTopColor, dayTopColor, max(0.0, dayFactor));
                    vec3 finalBottomColor = mix(nightBottomColor, dayBottomColor, max(0.0, dayFactor));
                    
                    // Gradient based on height
                    vec3 skyColor = mix(finalBottomColor, finalTopColor, max(0.0, min(1.0, pow(h * 0.5 + 0.5, exponent))));
                    
                    // Add sunset/sunrise colors
                    float sunsetFactor = pow(1.0 - abs(dayFactor * 2.0 - 1.0), 5.0) * 0.8;
                    vec3 sunsetColor = vec3(0.8, 0.3, 0.1);
                    skyColor = mix(skyColor, sunsetColor, sunsetFactor * max(0.0, h));
                    
                    gl_FragColor = vec4(skyColor, 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        this.skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skyDome);
        this.skyObjects.push(this.skyDome);
    }
    
    createSun() {
        // Create sun
        const sunGeometry = new THREE.SphereGeometry(50, 16, 16);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            fog: false
        });
        
        this.sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sunSphere.position.set(0, 0, -800);
        this.scene.add(this.sunSphere);
        this.skyObjects.push(this.sunSphere);
        
        // Add sun glow
        const sunGlowGeometry = new THREE.SphereGeometry(60, 16, 16);
        const sunGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFDD00,
            transparent: true,
            opacity: 0.4,
            fog: false
        });
        
        const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
        this.sunSphere.add(sunGlow);
    }
    
    createMoon() {
        // Create moon
        const moonGeometry = new THREE.SphereGeometry(30, 16, 16);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: 0xDDDDDD,
            transparent: true,
            fog: false
        });
        
        this.moonSphere = new THREE.Mesh(moonGeometry, moonMaterial);
        this.moonSphere.position.set(0, 0, 800);
        this.scene.add(this.moonSphere);
        this.skyObjects.push(this.moonSphere);
        
        // Add moon glow
        const moonGlowGeometry = new THREE.SphereGeometry(35, 16, 16);
        const moonGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xBBBBFF,
            transparent: true,
            opacity: 0.3,
            fog: false
        });
        
        const moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
        this.moonSphere.add(moonGlow);
    }
    
    createStars() {
        // Create stars
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1,
            transparent: true,
            opacity: 0,
            fog: false,
            sizeAttenuation: false
        });
        
        // Generate random stars
        const starsCount = 2000;
        const starsPositions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount; i++) {
            const i3 = i * 3;
            // Generate points on a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 900 + Math.random() * 50;
            
            starsPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            starsPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starsPositions[i3 + 2] = radius * Math.cos(phi);
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
        this.skyObjects.push(this.stars);
    }
    
    createClouds() {
        // Create clouds
        const cloudCount = 30;
        
        for (let i = 0; i < cloudCount; i++) {
            const cloudGroup = new THREE.Group();
            
            // Random position within a certain range
            const x = (Math.random() - 0.5) * 1000;
            const y = 100 + Math.random() * 100;
            const z = (Math.random() - 0.5) * 1000;
            
            cloudGroup.position.set(x, y, z);
            
            // Create multiple cloud puffs
            const puffCount = 3 + Math.floor(Math.random() * 5);
            
            for (let j = 0; j < puffCount; j++) {
                const puffGeometry = new THREE.SphereGeometry(
                    20 + Math.random() * 30,
                    8,
                    8
                );
                
                const puffMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.8,
                    flatShading: true
                });
                
                const puff = new THREE.Mesh(puffGeometry, puffMaterial);
                
                // Position puffs relative to cloud group
                const puffX = (Math.random() - 0.5) * 40;
                const puffY = (Math.random() - 0.5) * 20;
                const puffZ = (Math.random() - 0.5) * 40;
                
                puff.position.set(puffX, puffY, puffZ);
                
                // Scale puff randomly
                const scale = 0.8 + Math.random() * 0.4;
                puff.scale.set(scale, scale, scale);
                
                cloudGroup.add(puff);
            }
            
            // Random rotation
            cloudGroup.rotation.y = Math.random() * Math.PI * 2;
            
            // Random movement speed
            cloudGroup.userData = {
                speed: 0.5 + Math.random() * 1.5,
                direction: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    0,
                    (Math.random() - 0.5) * 0.2
                ).normalize()
            };
            
            this.scene.add(cloudGroup);
            this.clouds.push(cloudGroup);
            this.skyObjects.push(cloudGroup);
        }
    }
    
    setupLighting() {
        // Ambient light (always present, brighter)
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(this.ambientLight);
        
        // Directional light for sun (brighter)
        this.sunLight = new THREE.DirectionalLight(0xFFFFCC, 1.0);
        this.sunLight.position.set(0, 500, -500);
        this.sunLight.castShadow = true;
        
        // Configure shadow properties
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 1500;
        this.sunLight.shadow.camera.left = -500;
        this.sunLight.shadow.camera.right = 500;
        this.sunLight.shadow.camera.top = 500;
        this.sunLight.shadow.camera.bottom = -500;
        this.sunLight.shadow.bias = -0.0005;
        
        this.scene.add(this.sunLight);
        
        // Directional light for moon (dimmer)
        this.moonLight = new THREE.DirectionalLight(0xCCDDFF, 0.3);
        this.moonLight.position.set(0, 500, 500);
        this.moonLight.castShadow = true;
        
        // Configure shadow properties (same as sun)
        this.moonLight.shadow.mapSize.width = 2048;
        this.moonLight.shadow.mapSize.height = 2048;
        this.moonLight.shadow.camera.near = 0.5;
        this.moonLight.shadow.camera.far = 1500;
        this.moonLight.shadow.camera.left = -500;
        this.moonLight.shadow.camera.right = 500;
        this.moonLight.shadow.camera.top = 500;
        this.moonLight.shadow.camera.bottom = -500;
        this.moonLight.shadow.bias = -0.0005;
        
        this.scene.add(this.moonLight);
        
        // Add a hemisphere light for better ambient lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x38761D, 0.6);
        this.scene.add(hemisphereLight);
    }
    
    update(deltaTime) {
        // Update total flight time
        this.totalFlightTime += deltaTime;
        
        // Update time of day
        if (!this.isManualTime) {
            // After 20 minutes (1200 seconds) of flight, start transitioning to night
            if (this.totalFlightTime > 1200 && this.timeOfDay > 0.3) {
                this.timeOfDay -= this.daySpeed * 5 * deltaTime; // Faster transition to night
            } else {
                this.timeOfDay += this.daySpeed * deltaTime;
            }
            
            // Keep time of day between 0 and 1
            if (this.timeOfDay > 1) this.timeOfDay = 0;
            if (this.timeOfDay < 0) this.timeOfDay = 0;
        }
        
        // Update sky dome shader
        if (this.skyDome && this.skyDome.material && this.skyDome.material.uniforms) {
            this.skyDome.material.uniforms.time.value = this.timeOfDay;
        }
        
        // Position sun and moon based on time of day
        const sunAngle = this.timeOfDay * Math.PI * 2;
        const moonAngle = (this.timeOfDay + 0.5) * Math.PI * 2;
        
        // Sun position (moves in a circle)
        this.sunSphere.position.x = Math.cos(sunAngle) * 800;
        this.sunSphere.position.y = Math.sin(sunAngle) * 800;
        
        // Moon position (opposite to sun)
        this.moonSphere.position.x = Math.cos(moonAngle) * 800;
        this.moonSphere.position.y = Math.sin(moonAngle) * 800;
        
        // Sun light position follows the sun
        this.sunLight.position.copy(this.sunSphere.position.clone().normalize().multiplyScalar(500));
        
        // Moon light position follows the moon
        this.moonLight.position.copy(this.moonSphere.position.clone().normalize().multiplyScalar(500));
        
        // Update light intensities based on time of day
        const dayFactor = Math.sin(this.timeOfDay * Math.PI);
        const nightFactor = 1 - dayFactor;
        
        // Check for day/night transition
        this.checkDayNightTransition(dayFactor);
        
        // Ambient light changes with time of day - brighter at night than before
        this.ambientLight.intensity = 0.2 + dayFactor * 0.3;
        
        // Sun is bright during day, off at night
        this.sunLight.intensity = Math.max(0, dayFactor) * 0.8;
        
        // Moon is visible at night, off during day
        this.moonLight.intensity = Math.max(0, nightFactor) * 0.4; // Increased moon brightness
        
        // Stars are visible at night, fade during day
        if (this.stars && this.stars.material) {
            this.stars.material.opacity = Math.max(0, nightFactor - 0.2) * 0.9; // Increased star brightness
        }
        
        // Update sun material based on time of day
        if (this.sunSphere && this.sunSphere.material) {
            // Make sun less visible at night
            this.sunSphere.material.opacity = Math.max(0, dayFactor);
        }
        
        // Update moon material based on time of day
        if (this.moonSphere && this.moonSphere.material) {
            // Make moon less visible during day
            this.moonSphere.material.opacity = Math.max(0, nightFactor);
        }
        
        // Update clouds
        this.updateClouds(deltaTime);
    }
    
    // Check for day/night transition and dispatch event
    checkDayNightTransition(dayFactor) {
        const currentState = dayFactor < 0.3 ? 'night' : 'day';
        
        // If state changed, dispatch event
        if (currentState !== this.lastDayNightState) {
            this.lastDayNightState = currentState;
            
            // Create and dispatch custom event
            const transitionEvent = new CustomEvent('dayNightTransition', {
                detail: {
                    isNight: currentState === 'night',
                    timeOfDay: this.timeOfDay,
                    dayFactor: dayFactor
                }
            });
            
            document.dispatchEvent(transitionEvent);
            
            // Show transition message
            if (currentState === 'night') {
                this.showTransitionMessage("Night has fallen. Stars are now visible.");
            } else {
                this.showTransitionMessage("A new day has dawned.");
            }
        }
    }
    
    // Show a message for day/night transition
    showTransitionMessage(message) {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.style.position = 'absolute';
        messageElement.style.top = '30%';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translate(-50%, -50%)';
        messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messageElement.style.color = 'white';
        messageElement.style.padding = '20px';
        messageElement.style.borderRadius = '10px';
        messageElement.style.fontFamily = 'Arial, sans-serif';
        messageElement.style.fontSize = '24px';
        messageElement.style.textAlign = 'center';
        messageElement.style.zIndex = '1000';
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 2s';
        messageElement.textContent = message;
        
        // Add to document
        document.body.appendChild(messageElement);
        
        // Fade in
        setTimeout(() => {
            messageElement.style.opacity = '1';
        }, 100);
        
        // Fade out and remove after 5 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 2000);
        }, 5000);
    }
    
    updateClouds(deltaTime) {
        // Move clouds
        for (const cloud of this.clouds) {
            const speed = cloud.userData.speed;
            const direction = cloud.userData.direction;
            
            // Move cloud
            cloud.position.x += direction.x * speed * deltaTime;
            cloud.position.z += direction.z * speed * deltaTime;
            
            // Wrap around if cloud goes too far
            const limit = 800;
            if (cloud.position.x > limit) cloud.position.x = -limit;
            if (cloud.position.x < -limit) cloud.position.x = limit;
            if (cloud.position.z > limit) cloud.position.z = -limit;
            if (cloud.position.z < -limit) cloud.position.z = limit;
            
            // Slowly rotate cloud
            cloud.rotation.y += 0.01 * deltaTime;
        }
    }
    
    setTimeOfDay(time) {
        // Set time of day manually (0 to 1)
        this.timeOfDay = Math.max(0, Math.min(1, time));
        this.isManualTime = true;
    }
    
    setDayNightCycle(enabled, speed = 0.0001) {
        // Enable or disable automatic day/night cycle
        this.isManualTime = !enabled;
        this.daySpeed = speed;
    }
    
    // Get the current time of day (0 to 1)
    getTimeOfDay() {
        return this.timeOfDay;
    }
    
    // Get whether it's currently day or night
    isDay() {
        return this.timeOfDay > 0.25 && this.timeOfDay < 0.75;
    }
}
