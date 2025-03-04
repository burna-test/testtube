/**
 * Sky system with static lighting
 */
class Sky {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        
        // Initialize
        this.createLights();
        this.createSkybox();
        this.createSun();
        this.createClouds();
    }
    
    createLights() {
        // Create bright ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        
        // Create sun directional light
        const sunLight = new THREE.DirectionalLight(0xffffcc, 1.2);
        sunLight.position.set(100, 200, 100);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        this.scene.add(sunLight);
        
        // Create hemisphere light (sky/ground)
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.8);
        this.scene.add(hemisphereLight);
    }
    
    createSkybox() {
        // Create a large sphere for the sky
        const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
        
        // Create a simple material for the sky
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB, // Sky blue
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        this.objects.push(sky);
    }
    
    createSun() {
        // Create a sun sphere
        const sunGeometry = new THREE.SphereGeometry(50, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff99,
            transparent: true,
            opacity: 0.8
        });
        
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(500, 500, -500);
        this.scene.add(sun);
        this.objects.push(sun);
    }
    
    createClouds() {
        // Create clouds
        const clouds = new THREE.Group();
        
        const cloudGeometry = new THREE.SphereGeometry(5, 8, 8);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            flatShading: true
        });
        
        // Create several cloud clusters
        for (let i = 0; i < 20; i++) {
            const cloudCluster = new THREE.Group();
            
            const numClouds = Math.floor(Math.random() * 5) + 3;
            for (let j = 0; j < numClouds; j++) {
                const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
                
                cloud.position.x = Math.random() * 10 - 5;
                cloud.position.y = Math.random() * 3;
                cloud.position.z = Math.random() * 10 - 5;
                
                cloud.rotation.x = Math.random() * Math.PI;
                cloud.rotation.y = Math.random() * Math.PI;
                cloud.rotation.z = Math.random() * Math.PI;
                
                cloud.scale.x = Math.random() * 0.5 + 0.5;
                cloud.scale.y = Math.random() * 0.5 + 0.5;
                cloud.scale.z = Math.random() * 0.5 + 0.5;
                
                cloudCluster.add(cloud);
            }
            
            // Position the cloud cluster
            cloudCluster.position.x = Math.random() * 800 - 400;
            cloudCluster.position.y = Math.random() * 50 + 100;
            cloudCluster.position.z = Math.random() * 800 - 400;
            
            clouds.add(cloudCluster);
        }
        
        this.scene.add(clouds);
        this.objects.push(clouds);
    }
    
    update(deltaTime) {
        // Move clouds slowly
        if (this.objects[3]) {
            this.objects[3].rotation.y += deltaTime * 0.01;
        }
    }
}
