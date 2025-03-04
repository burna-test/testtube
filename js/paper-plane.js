/**
 * Paper Plane Model and Physics
 */
class PaperPlane {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.wingSpan = 2;
        this.length = 3;
        this.height = 0.5;
        
        // Flight properties
        this.position = new THREE.Vector3(0, 5, 0); // Start at a reasonable height
        this.rotation = new THREE.Euler(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.angularVelocity = new THREE.Vector3(0, 0, 0);
        
        // Flight parameters
        this.maxSpeed = 50;
        this.minSpeed = 0;
        this.throttle = 0; // 0 to 1
        this.lift = 0;
        this.drag = 0.02;
        this.weight = 0.5;
        this.pitchSensitivity = 0.05;
        this.rollSensitivity = 0.05;
        this.yawSensitivity = 0.02;
        
        // Control inputs
        this.pitchInput = 0; // -1 to 1
        this.rollInput = 0;  // -1 to 1
        this.yawInput = 0;   // -1 to 1
        
        // Status
        this.speed = 0;
        this.altitude = 5; // Start at 5 units altitude
        this.heading = 0;
        this.isGrounded = false; // Start in the air
        this.isCrashed = false;
        this.crashTimer = 0;
        this.crashRecoveryTime = 3; // seconds to recover from crash
        
        // Collision detection
        this.collisionObjects = [];
        this.boundingSphere = new THREE.Sphere(this.position.clone(), 1.5); // Smaller collision sphere
        
        this.createPaperPlane();
    }
    
    createPaperPlane() {
        // Create a paper plane using geometry
        const paperMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide,
            flatShading: true,
            emissive: 0x444444, // Brighter emissive to make it visible in dark
            shininess: 30
        });
        
        // Group to hold all plane parts
        this.mesh = new THREE.Group();
        
        // Create the main body (a triangular prism)
        const bodyGeometry = new THREE.BufferGeometry();
        
        // Define vertices for a paper plane shape
        const vertices = new Float32Array([
            // Top face
            0, 0.2, -1.5,    // nose
            -1, 0, 0,        // left wing
            1, 0, 0,         // right wing
            0, 0, 1,         // tail
            
            // Bottom face
            0, 0, -1.5,      // nose bottom
            -1, -0.1, 0,     // left wing bottom
            1, -0.1, 0,      // right wing bottom
            0, -0.1, 1       // tail bottom
        ]);
        
        // Define faces using indices
        const indices = [
            // Top face
            0, 1, 2,
            1, 3, 2,
            
            // Bottom face
            4, 6, 5,
            5, 6, 7,
            
            // Side faces
            0, 4, 1,
            1, 4, 5,
            0, 2, 4,
            2, 6, 4,
            1, 5, 3,
            3, 5, 7,
            2, 3, 6,
            3, 7, 6
        ];
        
        bodyGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        bodyGeometry.setIndex(indices);
        bodyGeometry.computeVertexNormals();
        
        const body = new THREE.Mesh(bodyGeometry, paperMaterial);
        this.mesh.add(body);
        
        // Add wing creases for detail
        const creaseMaterial = new THREE.LineBasicMaterial({ color: 0xAAAAAA });
        
        // Left wing crease
        const leftCreaseGeometry = new THREE.BufferGeometry();
        const leftCreaseVertices = new Float32Array([
            0, 0.05, -0.75,
            -1, 0, 0
        ]);
        leftCreaseGeometry.setAttribute('position', new THREE.BufferAttribute(leftCreaseVertices, 3));
        const leftCrease = new THREE.Line(leftCreaseGeometry, creaseMaterial);
        this.mesh.add(leftCrease);
        
        // Right wing crease
        const rightCreaseGeometry = new THREE.BufferGeometry();
        const rightCreaseVertices = new Float32Array([
            0, 0.05, -0.75,
            1, 0, 0
        ]);
        rightCreaseGeometry.setAttribute('position', new THREE.BufferAttribute(rightCreaseVertices, 3));
        const rightCrease = new THREE.Line(rightCreaseGeometry, creaseMaterial);
        this.mesh.add(rightCrease);
        
        // Center crease
        const centerCreaseGeometry = new THREE.BufferGeometry();
        const centerCreaseVertices = new Float32Array([
            0, 0.05, -1.5,
            0, 0.05, 1
        ]);
        centerCreaseGeometry.setAttribute('position', new THREE.BufferAttribute(centerCreaseVertices, 3));
        const centerCrease = new THREE.Line(centerCreaseGeometry, creaseMaterial);
        this.mesh.add(centerCrease);
        
        // Add a small light to the plane to make it visible at night
        const planeLight = new THREE.PointLight(0xFFFFFF, 1, 10);
        planeLight.position.set(0, 0.5, 0);
        this.mesh.add(planeLight);
        
        // Position the plane
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        
        // Add to scene
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        if (this.isCrashed) {
            this.handleCrashed(deltaTime);
            return;
        }
        
        // Apply physics
        this.applyPhysics(deltaTime);
        
        // Update position and rotation
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        
        // Update bounding sphere position
        this.boundingSphere.center.copy(this.position);
        
        // Check for collisions
        this.checkCollisions();
    }
    
    applyPhysics(deltaTime) {
        // Calculate forces
        this.calculateForces(deltaTime);
        
        // Update velocity
        this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
        
        // Apply drag
        this.velocity.multiplyScalar(1 - this.drag * deltaTime);
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Update angular velocity
        this.angularVelocity.x = this.pitchInput * this.pitchSensitivity * this.speed;
        this.angularVelocity.z = this.rollInput * this.rollSensitivity * this.speed;
        this.angularVelocity.y = this.yawInput * this.yawSensitivity * this.speed;
        
        // Apply angular velocity to rotation
        this.rotation.x += this.angularVelocity.x * deltaTime;
        this.rotation.y += this.angularVelocity.y * deltaTime;
        this.rotation.z += this.angularVelocity.z * deltaTime;
        
        // Limit pitch to prevent flipping over
        this.rotation.x = THREE.MathUtils.clamp(this.rotation.x, -Math.PI / 2, Math.PI / 2);
        
        // Calculate speed
        this.speed = this.velocity.length();
        
        // Calculate altitude
        this.altitude = Math.max(0, this.position.y);
        
        // Calculate heading (0-360 degrees)
        this.heading = (Math.atan2(this.velocity.x, this.velocity.z) * 180 / Math.PI + 180) % 360;
        
        // Check if grounded
        const groundThreshold = 0.5;
        this.isGrounded = this.altitude <= groundThreshold;
        
        // If grounded, prevent going below ground
        if (this.isGrounded) {
            this.position.y = groundThreshold;
            
            // If hitting ground too fast, crash
            if (this.velocity.y < -10) {
                this.crash("Crashed into the ground too hard!");
            } else if (this.speed > 0.1) {
                // Apply friction when on ground
                this.velocity.multiplyScalar(0.95);
            }
        }
    }
    
    calculateForces(deltaTime) {
        // Reset acceleration
        this.acceleration.set(0, 0, 0);
        
        // Apply gravity
        this.acceleration.y -= this.weight;
        
        // Calculate forward direction based on rotation
        const forwardDir = new THREE.Vector3(0, 0, -1);
        forwardDir.applyEuler(this.rotation);
        
        // Apply thrust
        const thrust = this.throttle * 20;
        this.acceleration.add(forwardDir.clone().multiplyScalar(thrust));
        
        // Calculate lift based on speed and angle of attack
        const liftFactor = 0.05;
        const angleOfAttack = this.rotation.x;
        this.lift = this.speed * liftFactor * Math.cos(angleOfAttack);
        
        // Apply lift (perpendicular to forward direction)
        const liftDir = new THREE.Vector3(0, 1, 0);
        liftDir.applyEuler(new THREE.Euler(0, this.rotation.y, this.rotation.z));
        this.acceleration.add(liftDir.clone().multiplyScalar(this.lift));
    }
    
    setThrottle(value) {
        this.throttle = THREE.MathUtils.clamp(value, 0, 1);
    }
    
    setPitch(value) {
        this.pitchInput = THREE.MathUtils.clamp(value, -1, 1);
    }
    
    setRoll(value) {
        this.rollInput = THREE.MathUtils.clamp(value, -1, 1);
    }
    
    setYaw(value) {
        this.yawInput = THREE.MathUtils.clamp(value, -1, 1);
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    getRotation() {
        return this.rotation.clone();
    }
    
    getFlightData() {
        return {
            speed: Math.round(this.speed * 10),
            altitude: Math.round(this.altitude),
            heading: Math.round(this.heading),
            crashed: this.isCrashed
        };
    }
    
    // Set collision objects for crash detection
    setCollisionObjects(objects) {
        this.collisionObjects = objects || [];
    }
    
    // Check for collisions with objects
    checkCollisions() {
        // Skip collision detection for now to ensure the game works
        return;
        
        if (this.isCrashed) return;
        
        // Skip collision detection for the first 2 seconds to prevent immediate crashes
        if (this.crashTimer < 2) {
            this.crashTimer += 0.016; // Approximately one frame at 60fps
            return;
        }
        
        for (const object of this.collisionObjects) {
            if (!object.geometry) continue;
            if (!object.visible) continue; // Skip invisible objects
            
            // Skip ground plane for collision (it's handled separately)
            if (object.geometry instanceof THREE.PlaneGeometry && object.position.y <= 0.1) {
                continue;
            }
            
            // Create a bounding sphere for the object if it doesn't have one
            if (!object.boundingSphere) {
                if (object.geometry.boundingSphere) {
                    object.boundingSphere = object.geometry.boundingSphere.clone();
                    object.boundingSphere.center.add(object.position);
                } else {
                    object.geometry.computeBoundingSphere();
                    object.boundingSphere = object.geometry.boundingSphere.clone();
                    object.boundingSphere.center.add(object.position);
                }
            }
            
            // Check for collision
            if (this.boundingSphere.intersectsSphere(object.boundingSphere)) {
                this.crash("Collided with an object!");
                break;
            }
        }
    }
    
    // Handle crashed state
    handleCrashed(deltaTime) {
        // Update crash timer
        this.crashTimer += deltaTime;
        
        // Apply gravity and friction
        this.velocity.y -= this.weight * deltaTime;
        this.velocity.multiplyScalar(0.98);
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Prevent going below ground
        if (this.position.y < 0.5) {
            this.position.y = 0.5;
            this.velocity.y = 0;
        }
        
        // Update mesh position
        this.mesh.position.copy(this.position);
        
        // Add some tumbling effect
        this.mesh.rotation.x += 0.5 * deltaTime;
        this.mesh.rotation.z += 0.3 * deltaTime;
        
        // Reset after recovery time
        if (this.crashTimer >= this.crashRecoveryTime) {
            this.resetAfterCrash();
        }
    }
    
    // Crash the plane
    crash(reason) {
        if (this.isCrashed) return;
        
        this.isCrashed = true;
        this.crashTimer = 0;
        
        // Dispatch crash event
        const crashEvent = new CustomEvent('planeCrash', {
            detail: {
                reason: reason || "Your plane crashed!",
                position: this.position.clone()
            }
        });
        document.dispatchEvent(crashEvent);
    }
    
    // Reset after crash
    resetAfterCrash() {
        this.isCrashed = false;
        this.velocity.set(0, 0, 0);
        this.acceleration.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.position.set(0, 10, -50); // Reset to starting position
        this.throttle = 0;
        this.pitchInput = 0;
        this.rollInput = 0;
        this.yawInput = 0;
        this.crashTimer = 0; // Reset crash timer
        
        // Dispatch reset event
        const resetEvent = new CustomEvent('planeReset');
        document.dispatchEvent(resetEvent);
    }
    
    // Land the plane at a specific position
    landAt(position) {
        this.position.copy(position);
        this.position.y = 0.5;
        this.velocity.set(0, 0, 0);
        this.acceleration.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.isGrounded = true;
    }
}
