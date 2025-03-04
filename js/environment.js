/**
 * Environment for the Flight Simulator
 */
class Environment {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        
        this.createGround();
        this.createRunway();
        this.createLighting();
        this.createTrees();
        this.createMountains();
    }
    
    createGround() {
        // Create a large ground plane
        const groundSize = 2000;
        const groundSegments = 128;
        
        // Create ground geometry
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, groundSegments, groundSegments);
        
        // Create ground material with texture
        const textureLoader = new THREE.TextureLoader();
        
        // Generate ground texture procedurally
        const groundCanvas = document.createElement('canvas');
        groundCanvas.width = 1024;
        groundCanvas.height = 1024;
        const groundCtx = groundCanvas.getContext('2d');
        
        // Base color (grass)
        groundCtx.fillStyle = '#4CAF50';
        groundCtx.fillRect(0, 0, groundCanvas.width, groundCanvas.height);
        
        // Add noise for texture variation
        for (let i = 0; i < 50000; i++) {
            const x = Math.random() * groundCanvas.width;
            const y = Math.random() * groundCanvas.height;
            const size = 1 + Math.random() * 2;
            const brightness = 0.8 + Math.random() * 0.4;
            
            groundCtx.fillStyle = `rgba(0, 0, 0, ${0.1 * brightness})`;
            groundCtx.fillRect(x, y, size, size);
        }
        
        // Add some lighter patches
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * groundCanvas.width;
            const y = Math.random() * groundCanvas.height;
            const size = 10 + Math.random() * 30;
            const brightness = 0.1 + Math.random() * 0.2;
            
            groundCtx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            groundCtx.beginPath();
            groundCtx.arc(x, y, size, 0, Math.PI * 2);
            groundCtx.fill();
        }
        
        // Create texture from canvas
        const groundTexture = new THREE.CanvasTexture(groundCanvas);
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(20, 20);
        
        // Create ground material
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.FrontSide,
            emissive: 0x112211, // Add slight emissive to be visible at night
            emissiveIntensity: 0.1
        });
        
        // Create ground mesh
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.position.y = 0;
        ground.receiveShadow = true;
        
        this.scene.add(ground);
        this.objects.push(ground);
        
        // Add a grid helper for reference
        const gridHelper = new THREE.GridHelper(groundSize, 100, 0x000000, 0x444444);
        gridHelper.position.y = 0.1;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.2;
        this.scene.add(gridHelper);
    }
    
    createRunway() {
        // Create a runway
        const runwayLength = 200;
        const runwayWidth = 20;
        
        // Create runway geometry
        const runwayGeometry = new THREE.PlaneGeometry(runwayWidth, runwayLength);
        
        // Create runway material with texture
        const runwayCanvas = document.createElement('canvas');
        runwayCanvas.width = 512;
        runwayCanvas.height = 2048;
        const runwayCtx = runwayCanvas.getContext('2d');
        
        // Base color (dark gray)
        runwayCtx.fillStyle = '#333333';
        runwayCtx.fillRect(0, 0, runwayCanvas.width, runwayCanvas.height);
        
        // Add center line
        runwayCtx.strokeStyle = '#FFFFFF';
        runwayCtx.lineWidth = 10;
        runwayCtx.setLineDash([100, 50]);
        runwayCtx.beginPath();
        runwayCtx.moveTo(runwayCanvas.width / 2, 0);
        runwayCtx.lineTo(runwayCanvas.width / 2, runwayCanvas.height);
        runwayCtx.stroke();
        
        // Add edge lines
        runwayCtx.strokeStyle = '#FFFFFF';
        runwayCtx.lineWidth = 15;
        runwayCtx.setLineDash([]);
        runwayCtx.beginPath();
        runwayCtx.moveTo(5, 0);
        runwayCtx.lineTo(5, runwayCanvas.height);
        runwayCtx.moveTo(runwayCanvas.width - 5, 0);
        runwayCtx.lineTo(runwayCanvas.width - 5, runwayCanvas.height);
        runwayCtx.stroke();
        
        // Add runway markings
        runwayCtx.fillStyle = '#FFFFFF';
        
        // Start markings
        for (let i = 0; i < 10; i++) {
            const y = 100 + i * 30;
            const width = 20 + i * 10;
            runwayCtx.fillRect((runwayCanvas.width - width) / 2, y, width, 15);
        }
        
        // End markings
        for (let i = 0; i < 10; i++) {
            const y = runwayCanvas.height - 100 - i * 30 - 15;
            const width = 20 + i * 10;
            runwayCtx.fillRect((runwayCanvas.width - width) / 2, y, width, 15);
        }
        
        // Create texture from canvas
        const runwayTexture = new THREE.CanvasTexture(runwayCanvas);
        
        // Create runway material
        const runwayMaterial = new THREE.MeshStandardMaterial({
            map: runwayTexture,
            roughness: 0.7,
            metalness: 0.1,
            emissive: 0x111111, // Add emissive to be visible at night
            emissiveIntensity: 0.2
        });
        
        // Create runway mesh
        const runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
        runway.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        runway.rotation.z = Math.PI / 2; // Align with z-axis
        runway.position.y = 0.1; // Slightly above ground
        runway.receiveShadow = true;
        
        this.scene.add(runway);
        
        // Add runway lights
        this.createRunwayLights(runwayLength, runwayWidth);
    }
    
    createRunwayLights(runwayLength, runwayWidth) {
        // Create runway edge lights
        const edgeLightCount = 20;
        const edgeLightSpacing = runwayLength / edgeLightCount;
        
        for (let i = 0; i < edgeLightCount; i++) {
            // Left edge lights
            const leftLight = new THREE.PointLight(0xFFFFFF, 0.2, 20);
            leftLight.position.set(-runwayWidth / 2, 0.5, -runwayLength / 2 + i * edgeLightSpacing);
            this.scene.add(leftLight);
            
            // Create a small sphere to represent the light
            const leftLightSphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
            );
            leftLightSphere.position.copy(leftLight.position);
            this.scene.add(leftLightSphere);
            
            // Right edge lights
            const rightLight = new THREE.PointLight(0xFFFFFF, 0.2, 20);
            rightLight.position.set(runwayWidth / 2, 0.5, -runwayLength / 2 + i * edgeLightSpacing);
            this.scene.add(rightLight);
            
            // Create a small sphere to represent the light
            const rightLightSphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
            );
            rightLightSphere.position.copy(rightLight.position);
            this.scene.add(rightLightSphere);
        }
        
        // Create approach lights
        const approachLightCount = 10;
        const approachLightSpacing = 10;
        
        for (let i = 1; i <= approachLightCount; i++) {
            // Approach lights (at the start of runway)
            const approachLight = new THREE.PointLight(0xFFFF00, 0.3, 30);
            approachLight.position.set(0, 0.5, -runwayLength / 2 - i * approachLightSpacing);
            this.scene.add(approachLight);
            
            // Create a small sphere to represent the light
            const approachLightSphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.4, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
            );
            approachLightSphere.position.copy(approachLight.position);
            this.scene.add(approachLightSphere);
        }
    }
    
    createLighting() {
        // Add ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Add hemisphere light for better outdoor lighting
        const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0x404040, 0.6);
        this.scene.add(hemisphereLight);
    }
    
    createTrees() {
        // Create trees around the environment
        const treeCount = 200;
        const treeSpread = 800;
        const minDistanceFromRunway = 50;
        
        for (let i = 0; i < treeCount; i++) {
            // Random position
            let x, z;
            do {
                x = (Math.random() - 0.5) * treeSpread;
                z = (Math.random() - 0.5) * treeSpread;
            } while (Math.abs(x) < minDistanceFromRunway && Math.abs(z) < minDistanceFromRunway);
            
            // Create tree
            const tree = this.createTree();
            tree.position.set(x, 0, z);
            
            // Random scale
            const scale = 0.8 + Math.random() * 0.4;
            tree.scale.set(scale, scale, scale);
            
            // Random rotation
            tree.rotation.y = Math.random() * Math.PI * 2;
            
            this.scene.add(tree);
            this.objects.push(tree);
            
            // Add tree to collision objects
            tree.userData = { isTree: true };
        }
    }
    
    createTree() {
        // Create a simple tree with trunk and foliage
        const treeGroup = new THREE.Group();
        
        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x221100, // Slight emissive for night visibility
            emissiveIntensity: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        
        // Create foliage (cone shape)
        const foliageGeometry = new THREE.ConeGeometry(3, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2E8B57,
            roughness: 0.8,
            metalness: 0.1,
            emissive: 0x112211, // Slight emissive for night visibility
            emissiveIntensity: 0.1
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 8;
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        treeGroup.add(foliage);
        
        return treeGroup;
    }
    
    createMountains() {
        // Create mountains in the distance
        const mountainCount = 8;
        const mountainRadius = 1000;
        
        for (let i = 0; i < mountainCount; i++) {
            // Position in a circle around the scene
            const angle = (i / mountainCount) * Math.PI * 2;
            const x = Math.cos(angle) * mountainRadius;
            const z = Math.sin(angle) * mountainRadius;
            
            // Create mountain
            const mountain = this.createMountain();
            mountain.position.set(x, 0, z);
            
            // Random scale
            const scale = 1 + Math.random() * 0.5;
            mountain.scale.set(scale, scale, scale);
            
            this.scene.add(mountain);
            
            // Add mountain to collision objects
            mountain.userData = { isMountain: true };
            this.objects.push(mountain);
        }
    }
    
    createMountain() {
        // Create a simple mountain using a cone
        const mountainHeight = 200 + Math.random() * 300;
        const mountainRadius = 100 + Math.random() * 200;
        const mountainGeometry = new THREE.ConeGeometry(mountainRadius, mountainHeight, 16);
        
        // Create mountain material
        const mountainMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x111111, // Slight emissive for night visibility
            emissiveIntensity: 0.1
        });
        
        // Create mountain mesh
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.y = 0;
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        
        // Add snow cap
        const snowCapGeometry = new THREE.ConeGeometry(mountainRadius * 0.4, mountainHeight * 0.2, 16);
        const snowMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.8,
            metalness: 0.1,
            emissive: 0x333333, // More emissive for snow to be visible at night
            emissiveIntensity: 0.2
        });
        const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial);
        snowCap.position.y = mountainHeight * 0.4;
        mountain.add(snowCap);
        
        return mountain;
    }
    
    update(deltaTime) {
        // Update any animated elements in the environment
    }
}
