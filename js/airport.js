/**
 * Airport and Buildings for the Flight Simulator
 * Works alongside environment.js to create a more realistic world
 */
class Airport {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.collisionObjects = [];
        
        // Create airport components
        this.createRunway();
        this.createTerminal();
        this.createControlTower();
        this.createHangars();
        this.createTaxiways();
        this.createRunwayLights();
    }
    
    createRunway() {
        // Create a longer runway (300 units instead of 200)
        const runwayGeometry = new THREE.PlaneGeometry(30, 300);
        runwayGeometry.rotateX(-Math.PI / 2);
        
        // Create runway texture
        const textureSize = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const context = canvas.getContext('2d');
        
        // Fill with asphalt color
        context.fillStyle = '#333333';
        context.fillRect(0, 0, textureSize, textureSize);
        
        // Add center line
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = textureSize / 20;
        context.setLineDash([]);
        context.beginPath();
        context.moveTo(textureSize / 2, 0);
        context.lineTo(textureSize / 2, textureSize);
        context.stroke();
        
        // Add dashed lines
        context.setLineDash([textureSize / 20, textureSize / 20]);
        context.beginPath();
        context.moveTo(textureSize / 4, 0);
        context.lineTo(textureSize / 4, textureSize);
        context.moveTo(3 * textureSize / 4, 0);
        context.lineTo(3 * textureSize / 4, textureSize);
        context.stroke();
        
        // Add runway numbers
        context.font = 'bold ' + textureSize / 5 + 'px Arial';
        context.fillStyle = '#FFFFFF';
        context.textAlign = 'center';
        context.setLineDash([]);
        
        // Runway number at one end (09)
        context.save();
        context.translate(textureSize / 2, textureSize / 10);
        context.fillText('09', 0, 0);
        context.restore();
        
        // Runway number at other end (27)
        context.save();
        context.translate(textureSize / 2, textureSize - textureSize / 10);
        context.rotate(Math.PI);
        context.fillText('27', 0, 0);
        context.restore();
        
        const runwayTexture = new THREE.CanvasTexture(canvas);
        runwayTexture.wrapS = THREE.RepeatWrapping;
        runwayTexture.wrapT = THREE.RepeatWrapping;
        runwayTexture.repeat.set(1, 15);
        
        const runwayMaterial = new THREE.MeshLambertMaterial({
            map: runwayTexture,
            side: THREE.FrontSide
        });
        
        const runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
        runway.position.set(0, 0.01, 0); // Slightly above ground to prevent z-fighting
        runway.receiveShadow = true;
        this.scene.add(runway);
        
        // Add runway collision object for crash detection
        runway.userData.isRunway = true;
        this.collisionObjects.push(runway);
    }
    
    createTerminal() {
        // Main terminal building
        const terminalGroup = new THREE.Group();
        
        // Terminal base
        const baseGeometry = new THREE.BoxGeometry(60, 15, 30);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xE0E0E0,
            flatShading: true
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, 7.5, -80);
        base.castShadow = true;
        base.receiveShadow = true;
        terminalGroup.add(base);
        
        // Terminal roof
        const roofGeometry = new THREE.BoxGeometry(65, 3, 35);
        const roofMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x505050,
            flatShading: true
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 16.5, -80);
        roof.castShadow = true;
        roof.receiveShadow = true;
        terminalGroup.add(roof);
        
        // Terminal windows
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7,
            flatShading: true
        });
        
        // Front windows (facing runway)
        const frontWindowGeometry = new THREE.PlaneGeometry(55, 10);
        const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
        frontWindow.position.set(0, 7.5, -64.6);
        terminalGroup.add(frontWindow);
        
        // Back windows
        const backWindow = frontWindow.clone();
        backWindow.position.z = -95.4;
        backWindow.rotation.y = Math.PI;
        terminalGroup.add(backWindow);
        
        // Terminal entrance
        const entranceGeometry = new THREE.BoxGeometry(20, 10, 2);
        const entranceMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            flatShading: true
        });
        const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
        entrance.position.set(0, 5, -95.5);
        terminalGroup.add(entrance);
        
        this.scene.add(terminalGroup);
        
        // Add to buildings array for collision detection
        base.userData.isBuilding = true;
        base.userData.name = "Terminal";
        this.buildings.push(base);
        this.collisionObjects.push(base);
    }
    
    createControlTower() {
        const towerGroup = new THREE.Group();
        
        // Tower base
        const baseGeometry = new THREE.CylinderGeometry(5, 6, 25, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0xCCCCCC,
            flatShading: true
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(40, 12.5, -70);
        base.castShadow = true;
        base.receiveShadow = true;
        towerGroup.add(base);
        
        // Tower control room
        const roomGeometry = new THREE.CylinderGeometry(8, 8, 6, 8);
        const roomMaterial = new THREE.MeshPhongMaterial({
            color: 0xA0A0A0,
            flatShading: true
        });
        const room = new THREE.Mesh(roomGeometry, roomMaterial);
        room.position.set(40, 28, -70);
        room.castShadow = true;
        room.receiveShadow = true;
        towerGroup.add(room);
        
        // Tower windows (control room)
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7,
            flatShading: true
        });
        
        // Create windows around the control room
        const windowGeometry = new THREE.PlaneGeometry(6, 4);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(
                40 + Math.sin(angle) * 8,
                28,
                -70 + Math.cos(angle) * 8
            );
            windowMesh.rotation.y = angle + Math.PI / 2;
            towerGroup.add(windowMesh);
        }
        
        // Tower roof
        const roofGeometry = new THREE.ConeGeometry(8, 4, 8);
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: 0x505050,
            flatShading: true
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(40, 33, -70);
        roof.castShadow = true;
        roof.receiveShadow = true;
        towerGroup.add(roof);
        
        // Tower antenna
        const antennaGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 8);
        const antennaMaterial = new THREE.MeshPhongMaterial({
            color: 0x505050,
            flatShading: true
        });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(40, 37.5, -70);
        antenna.castShadow = true;
        towerGroup.add(antenna);
        
        this.scene.add(towerGroup);
        
        // Add to buildings array for collision detection
        base.userData.isBuilding = true;
        base.userData.name = "Control Tower";
        this.buildings.push(base);
        this.collisionObjects.push(base);
        
        room.userData.isBuilding = true;
        room.userData.name = "Control Tower Room";
        this.buildings.push(room);
        this.collisionObjects.push(room);
    }
    
    createHangars() {
        // Create multiple hangars on one side of the runway
        for (let i = 0; i < 3; i++) {
            const hangarGroup = new THREE.Group();
            
            // Hangar base
            const baseGeometry = new THREE.BoxGeometry(25, 12, 30);
            const baseMaterial = new THREE.MeshPhongMaterial({
                color: 0x808080,
                flatShading: true
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(-50, 6, -40 + i * 40);
            base.castShadow = true;
            base.receiveShadow = true;
            hangarGroup.add(base);
            
            // Hangar roof (curved)
            const segments = 8;
            const roofShape = new THREE.Shape();
            roofShape.moveTo(-12.5, 0);
            
            // Create a curved roof
            for (let j = 0; j <= segments; j++) {
                const x = -12.5 + j * 25 / segments;
                const y = 5 * Math.sin((j / segments) * Math.PI);
                roofShape.lineTo(x, y);
            }
            
            const extrudeSettings = {
                steps: 1,
                depth: 30,
                bevelEnabled: false
            };
            
            const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
            const roofMaterial = new THREE.MeshPhongMaterial({
                color: 0x606060,
                flatShading: true
            });
            
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(-50, 12, -55 + i * 40);
            roof.castShadow = true;
            roof.receiveShadow = true;
            hangarGroup.add(roof);
            
            // Hangar door
            const doorGeometry = new THREE.PlaneGeometry(20, 10);
            const doorMaterial = new THREE.MeshPhongMaterial({
                color: 0x505050,
                flatShading: true
            });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(-50, 5, -25 + i * 40);
            door.rotation.y = Math.PI / 2;
            hangarGroup.add(door);
            
            this.scene.add(hangarGroup);
            
            // Add to buildings array for collision detection
            base.userData.isBuilding = true;
            base.userData.name = "Hangar " + (i + 1);
            this.buildings.push(base);
            this.collisionObjects.push(base);
        }
    }
    
    createTaxiways() {
        // Create taxiways connecting runway to hangars and terminal
        const taxiwayGeometry = new THREE.PlaneGeometry(15, 100);
        taxiwayGeometry.rotateX(-Math.PI / 2);
        
        // Create taxiway texture
        const textureSize = 512;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const context = canvas.getContext('2d');
        
        // Fill with asphalt color
        context.fillStyle = '#444444';
        context.fillRect(0, 0, textureSize, textureSize);
        
        // Add yellow center line
        context.strokeStyle = '#FFCC00';
        context.lineWidth = textureSize / 30;
        context.setLineDash([textureSize / 15, textureSize / 15]);
        context.beginPath();
        context.moveTo(textureSize / 2, 0);
        context.lineTo(textureSize / 2, textureSize);
        context.stroke();
        
        const taxiwayTexture = new THREE.CanvasTexture(canvas);
        taxiwayTexture.wrapS = THREE.RepeatWrapping;
        taxiwayTexture.wrapT = THREE.RepeatWrapping;
        taxiwayTexture.repeat.set(1, 5);
        
        const taxiwayMaterial = new THREE.MeshLambertMaterial({
            map: taxiwayTexture,
            side: THREE.FrontSide
        });
        
        // Taxiway to terminal
        const terminalTaxiway = new THREE.Mesh(taxiwayGeometry, taxiwayMaterial);
        terminalTaxiway.position.set(-15, 0.02, -30);
        terminalTaxiway.rotation.y = Math.PI / 2;
        terminalTaxiway.receiveShadow = true;
        this.scene.add(terminalTaxiway);
        
        // Taxiway to hangars
        const hangarTaxiway = new THREE.Mesh(taxiwayGeometry, taxiwayMaterial);
        hangarTaxiway.position.set(-25, 0.02, 0);
        hangarTaxiway.rotation.y = Math.PI / 2;
        hangarTaxiway.receiveShadow = true;
        this.scene.add(hangarTaxiway);
    }
    
    createRunwayLights() {
        // Create runway edge lights
        const lightGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
        const whiteLightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const redLightMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const greenLightMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        
        // Runway length and width
        const runwayLength = 300;
        const runwayWidth = 30;
        const halfLength = runwayLength / 2;
        const halfWidth = runwayWidth / 2;
        
        // Create lights along both sides of the runway
        for (let z = -halfLength; z <= halfLength; z += 15) {
            // White lights along the runway edges
            const leftLight = new THREE.Mesh(lightGeometry, whiteLightMaterial);
            leftLight.position.set(-halfWidth - 1, 0.25, z);
            this.scene.add(leftLight);
            
            const rightLight = new THREE.Mesh(lightGeometry, whiteLightMaterial);
            rightLight.position.set(halfWidth + 1, 0.25, z);
            this.scene.add(rightLight);
            
            // Add point lights at intervals to illuminate the runway at night
            if (z % 60 === 0) {
                const leftPointLight = new THREE.PointLight(0xFFFFFF, 0.5, 20);
                leftPointLight.position.set(-halfWidth - 1, 1, z);
                this.scene.add(leftPointLight);
                
                const rightPointLight = new THREE.PointLight(0xFFFFFF, 0.5, 20);
                rightPointLight.position.set(halfWidth + 1, 1, z);
                this.scene.add(rightPointLight);
            }
        }
        
        // Add threshold lights (green at one end, red at the other)
        for (let x = -halfWidth; x <= halfWidth; x += 3) {
            // Green threshold lights at one end
            const greenLight = new THREE.Mesh(lightGeometry, greenLightMaterial);
            greenLight.position.set(x, 0.25, -halfLength - 3);
            this.scene.add(greenLight);
            
            // Red threshold lights at the other end
            const redLight = new THREE.Mesh(lightGeometry, redLightMaterial);
            redLight.position.set(x, 0.25, halfLength + 3);
            this.scene.add(redLight);
        }
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
