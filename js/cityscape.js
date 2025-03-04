/**
 * Cityscape for the Flight Simulator
 * Creates buildings, roads, and other urban elements
 */
class Cityscape {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.collisionObjects = [];
        
        // Create city components
        this.createBuildings();
        this.createRoads();
        this.createLandmarks();
    }
    
    createBuildings() {
        // Create a city grid of buildings
        const gridSize = 5; // 5x5 grid
        const spacing = 60;
        const startX = -400;
        const startZ = -400;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                // Skip some positions to create variation
                if (Math.random() < 0.2) continue;
                
                // Randomize building properties
                const width = 20 + Math.random() * 20;
                const depth = 20 + Math.random() * 20;
                const height = 20 + Math.random() * 100;
                
                // Create building
                const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
                
                // Create building texture
                const textureSize = 512;
                const canvas = document.createElement('canvas');
                canvas.width = textureSize;
                canvas.height = textureSize;
                const context = canvas.getContext('2d');
                
                // Base building color
                const colorVariation = Math.random();
                let buildingColor;
                
                if (colorVariation < 0.3) {
                    // Glass building (blue)
                    buildingColor = '#5A8AC6';
                } else if (colorVariation < 0.6) {
                    // Concrete building (gray)
                    buildingColor = '#A0A0A0';
                } else if (colorVariation < 0.9) {
                    // Brick building (brown)
                    buildingColor = '#8B4513';
                } else {
                    // Special building (random color)
                    const r = Math.floor(Math.random() * 255);
                    const g = Math.floor(Math.random() * 255);
                    const b = Math.floor(Math.random() * 255);
                    buildingColor = `rgb(${r}, ${g}, ${b})`;
                }
                
                context.fillStyle = buildingColor;
                context.fillRect(0, 0, textureSize, textureSize);
                
                // Add windows
                const windowRows = Math.floor(height / 5);
                const windowCols = Math.floor(width / 5);
                const windowWidth = textureSize / windowCols;
                const windowHeight = textureSize / windowRows;
                
                context.fillStyle = '#FFFF99';
                
                for (let row = 0; row < windowRows; row++) {
                    for (let col = 0; col < windowCols; col++) {
                        // Randomly light some windows
                        if (Math.random() < 0.7) {
                            const windowX = col * windowWidth + windowWidth * 0.2;
                            const windowY = row * windowHeight + windowHeight * 0.2;
                            const windowW = windowWidth * 0.6;
                            const windowH = windowHeight * 0.6;
                            
                            context.fillRect(windowX, windowY, windowW, windowH);
                        }
                    }
                }
                
                const buildingTexture = new THREE.CanvasTexture(canvas);
                
                // Create materials for each face of the building
                const materials = [
                    new THREE.MeshLambertMaterial({ map: buildingTexture }),
                    new THREE.MeshLambertMaterial({ map: buildingTexture }),
                    new THREE.MeshLambertMaterial({ color: 0x333333 }), // roof
                    new THREE.MeshLambertMaterial({ color: 0x333333 }), // bottom
                    new THREE.MeshLambertMaterial({ map: buildingTexture }),
                    new THREE.MeshLambertMaterial({ map: buildingTexture })
                ];
                
                const building = new THREE.Mesh(buildingGeometry, materials);
                
                // Position building
                const x = startX + i * spacing + (Math.random() - 0.5) * 20;
                const z = startZ + j * spacing + (Math.random() - 0.5) * 20;
                building.position.set(x, height / 2, z);
                
                building.castShadow = true;
                building.receiveShadow = true;
                
                this.scene.add(building);
                
                // Add to buildings array for collision detection
                building.userData.isBuilding = true;
                building.userData.name = "Building";
                this.buildings.push(building);
                this.collisionObjects.push(building);
            }
        }
    }
    
    createRoads() {
        // Create a grid of roads
        const gridSize = 6; // 6x6 grid (one more than buildings to surround them)
        const spacing = 60;
        const startX = -430;
        const startZ = -430;
        const roadWidth = 10;
        
        // Road texture
        const textureSize = 512;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const context = canvas.getContext('2d');
        
        // Asphalt color
        context.fillStyle = '#333333';
        context.fillRect(0, 0, textureSize, textureSize);
        
        // Road markings
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = textureSize / 30;
        context.setLineDash([textureSize / 15, textureSize / 15]);
        context.beginPath();
        context.moveTo(textureSize / 2, 0);
        context.lineTo(textureSize / 2, textureSize);
        context.stroke();
        
        const roadTexture = new THREE.CanvasTexture(canvas);
        roadTexture.wrapS = THREE.RepeatWrapping;
        roadTexture.wrapT = THREE.RepeatWrapping;
        roadTexture.repeat.set(1, 10);
        
        const roadMaterial = new THREE.MeshLambertMaterial({
            map: roadTexture,
            side: THREE.FrontSide
        });
        
        // Create horizontal roads
        for (let i = 0; i <= gridSize; i++) {
            const roadGeometry = new THREE.PlaneGeometry(gridSize * spacing, roadWidth);
            roadGeometry.rotateX(-Math.PI / 2);
            
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.position.set(startX + (gridSize * spacing) / 2, 0.05, startZ + i * spacing);
            road.receiveShadow = true;
            this.scene.add(road);
        }
        
        // Create vertical roads
        for (let i = 0; i <= gridSize; i++) {
            const roadGeometry = new THREE.PlaneGeometry(roadWidth, gridSize * spacing);
            roadGeometry.rotateX(-Math.PI / 2);
            
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.position.set(startX + i * spacing, 0.05, startZ + (gridSize * spacing) / 2);
            road.receiveShadow = true;
            this.scene.add(road);
        }
    }
    
    createLandmarks() {
        // Create a few special landmark buildings
        
        // Tall skyscraper
        const skyscraperGeometry = new THREE.BoxGeometry(30, 150, 30);
        
        // Create skyscraper texture
        const textureSize = 512;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const context = canvas.getContext('2d');
        
        // Glass texture
        context.fillStyle = '#3A75C4';
        context.fillRect(0, 0, textureSize, textureSize);
        
        // Add reflective pattern
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if ((i + j) % 2 === 0) {
                    context.fillStyle = '#5A8AC6';
                } else {
                    context.fillStyle = '#2A65B4';
                }
                
                const x = i * (textureSize / 20);
                const y = j * (textureSize / 20);
                const w = textureSize / 20;
                const h = textureSize / 20;
                
                context.fillRect(x, y, w, h);
            }
        }
        
        const skyscraperTexture = new THREE.CanvasTexture(canvas);
        
        const skyscraperMaterial = new THREE.MeshLambertMaterial({
            map: skyscraperTexture,
            side: THREE.FrontSide
        });
        
        const skyscraper = new THREE.Mesh(skyscraperGeometry, skyscraperMaterial);
        skyscraper.position.set(-250, 75, -250);
        skyscraper.castShadow = true;
        skyscraper.receiveShadow = true;
        this.scene.add(skyscraper);
        
        // Add to buildings array for collision detection
        skyscraper.userData.isBuilding = true;
        skyscraper.userData.name = "Skyscraper";
        this.buildings.push(skyscraper);
        this.collisionObjects.push(skyscraper);
        
        // Add a pyramid-shaped building
        const pyramidGeometry = new THREE.ConeGeometry(30, 80, 4);
        const pyramidMaterial = new THREE.MeshLambertMaterial({
            color: 0xC0C0C0,
            flatShading: true
        });
        
        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        pyramid.position.set(-280, 40, -100);
        pyramid.castShadow = true;
        pyramid.receiveShadow = true;
        this.scene.add(pyramid);
        
        // Add to buildings array for collision detection
        pyramid.userData.isBuilding = true;
        pyramid.userData.name = "Pyramid Building";
        this.buildings.push(pyramid);
        this.collisionObjects.push(pyramid);
        
        // Add a dome-shaped building
        const domeGeometry = new THREE.SphereGeometry(25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMaterial = new THREE.MeshLambertMaterial({
            color: 0xA0A0A0,
            flatShading: true
        });
        
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.set(-150, 0, -300);
        dome.castShadow = true;
        dome.receiveShadow = true;
        this.scene.add(dome);
        
        // Base for the dome
        const baseGeometry = new THREE.CylinderGeometry(25, 25, 30, 32);
        const baseMaterial = new THREE.MeshLambertMaterial({
            color: 0x808080,
            flatShading: true
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(-150, 15, -300);
        base.castShadow = true;
        base.receiveShadow = true;
        this.scene.add(base);
        
        // Add to buildings array for collision detection
        base.userData.isBuilding = true;
        base.userData.name = "Dome Building";
        this.buildings.push(base);
        this.collisionObjects.push(base);
    }
    
    // Get collision objects for crash detection
    getCollisionObjects() {
        return this.collisionObjects;
    }
    
    // Get buildings for information display
    getBuildings() {
        return this.buildings;
    }
}
