/**
 * Sound Manager for the Flight Simulator
 */
class SoundManager {
    constructor() {
        // Sound elements
        this.engineSound = document.getElementById('engine-sound');
        this.windSound = document.getElementById('wind-sound');
        this.takeoffSound = document.getElementById('takeoff-sound');
        this.landingSound = document.getElementById('landing-sound');
        
        // Sound settings
        this.masterVolume = 0.7;
        this.engineVolume = 0.7;
        this.windVolume = 0.5;
        this.effectsVolume = 0.8;
        
        // Sound states
        this.isMuted = false;
        this.isEnginePlaying = false;
        this.isWindPlaying = false;
        this.lastSpeed = 0;
        this.lastAltitude = 0;
        this.hasTakenOff = false;
        this.hasLanded = true;
        
        // UI elements
        this.soundToggle = document.getElementById('sound-toggle');
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set initial volumes
        this.engineSound.volume = 0;
        this.windSound.volume = 0;
        this.takeoffSound.volume = this.effectsVolume * this.masterVolume;
        this.landingSound.volume = this.effectsVolume * this.masterVolume;
        
        // Set up sound toggle button
        this.soundToggle.addEventListener('click', () => {
            this.toggleMute();
        });
        
        // Preload sounds
        this.preloadSounds();
    }
    
    preloadSounds() {
        // Preload all sounds to ensure they're ready when needed
        this.engineSound.load();
        this.windSound.load();
        this.takeoffSound.load();
        this.landingSound.load();
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.soundToggle.querySelector('.sound-icon').textContent = '🔇';
            this.engineSound.volume = 0;
            this.windSound.volume = 0;
            this.takeoffSound.volume = 0;
            this.landingSound.volume = 0;
        } else {
            this.soundToggle.querySelector('.sound-icon').textContent = '🔊';
            // Restore volumes
            this.update(this.lastSpeed, this.lastAltitude, false);
        }
    }
    
    update(speed, altitude, isGrounded) {
        // Save values for reference
        this.lastSpeed = speed;
        this.lastAltitude = altitude;
        
        if (this.isMuted) return;
        
        // Engine sound
        this.updateEngineSound(speed);
        
        // Wind sound
        this.updateWindSound(speed, altitude);
        
        // Takeoff and landing sounds
        this.updateFlightStateSound(altitude, isGrounded);
    }
    
    updateEngineSound(speed) {
        // Start engine sound if not already playing
        if (!this.isEnginePlaying && speed > 0) {
            this.engineSound.play();
            this.isEnginePlaying = true;
        }
        
        // Adjust engine volume based on speed
        const normalizedSpeed = Math.min(speed / 100, 1);
        const engineVolume = normalizedSpeed * this.engineVolume * this.masterVolume;
        
        // Smoothly adjust volume
        this.engineSound.volume = engineVolume;
        
        // Adjust playback rate based on speed
        const playbackRate = 0.5 + normalizedSpeed * 1.5;
        this.engineSound.playbackRate = playbackRate;
    }
    
    updateWindSound(speed, altitude) {
        // Start wind sound if not already playing and plane is moving
        if (!this.isWindPlaying && speed > 20) {
            this.windSound.play();
            this.isWindPlaying = true;
        }
        
        // Adjust wind volume based on speed and altitude
        const speedFactor = Math.min(speed / 100, 1);
        const altitudeFactor = Math.min(altitude / 100, 1);
        const windVolume = (speedFactor * 0.7 + altitudeFactor * 0.3) * this.windVolume * this.masterVolume;
        
        // Smoothly adjust volume
        this.windSound.volume = windVolume;
        
        // Adjust playback rate based on speed
        const playbackRate = 0.8 + speedFactor * 0.4;
        this.windSound.playbackRate = playbackRate;
    }
    
    updateFlightStateSound(altitude, isGrounded) {
        // Takeoff sound
        if (!this.hasTakenOff && !isGrounded && altitude > 1) {
            this.takeoffSound.currentTime = 0;
            this.takeoffSound.play();
            this.hasTakenOff = true;
            this.hasLanded = false;
        }
        
        // Landing sound
        if (!this.hasLanded && isGrounded && this.hasTakenOff) {
            this.landingSound.currentTime = 0;
            this.landingSound.play();
            this.hasLanded = true;
            this.hasTakenOff = false;
        }
    }
    
    stopAll() {
        // Stop all sounds
        this.engineSound.pause();
        this.engineSound.currentTime = 0;
        this.isEnginePlaying = false;
        
        this.windSound.pause();
        this.windSound.currentTime = 0;
        this.isWindPlaying = false;
    }
}
