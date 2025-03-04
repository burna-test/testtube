/**
 * Sound Manager for the 3D Paper Plane Flight Simulator
 * Handles all audio effects and background music
 */
class SoundManager {
    constructor() {
        // Audio context
        this.audioContext = null;
        
        // Sound sources
        this.engineSound = null;
        this.windSound = null;
        this.crashSound = null;
        this.ambientMusic = null;
        
        // Gain nodes for volume control
        this.engineGain = null;
        this.windGain = null;
        this.musicGain = null;
        
        // Oscillator for engine sound
        this.engineOscillator = null;
        
        // Current state
        this.isPlaying = false;
        this.currentSpeed = 0;
        this.currentAltitude = 0;
        this.isMusicEnabled = true;
        this.isSoundEnabled = true;
        
        // Initialize audio
        this.initAudio();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // Initialize audio context and sounds
    initAudio() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create gain nodes
            this.engineGain = this.audioContext.createGain();
            this.engineGain.gain.value = 0;
            this.engineGain.connect(this.audioContext.destination);
            
            this.windGain = this.audioContext.createGain();
            this.windGain.gain.value = 0;
            this.windGain.connect(this.audioContext.destination);
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = 0.3; // Lower volume for background music
            this.musicGain.connect(this.audioContext.destination);
            
            // Create oscillator for engine sound
            this.engineOscillator = this.audioContext.createOscillator();
            this.engineOscillator.type = 'sawtooth';
            this.engineOscillator.frequency.value = 100;
            this.engineOscillator.connect(this.engineGain);
            this.engineOscillator.start();
            
            // Create wind sound (white noise)
            this.createWindSound();
            
            // Load crash sound
            this.loadCrashSound();
            
            // Create ambient background music
            this.createAmbientMusic();
            
            console.log('Audio initialized successfully');
        } catch (e) {
            console.error('Audio initialization failed:', e);
        }
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Sound toggle button
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                this.toggleSound();
            });
        }
        
        // Plane crash event
        document.addEventListener('planeCrash', () => {
            this.playCrashSound();
        });
        
        // Plane reset event
        document.addEventListener('planeReset', () => {
            // Fade out engine and wind sounds
            if (this.engineGain) {
                this.engineGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
            }
            
            if (this.windGain) {
                this.windGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
            }
        });
        
        // Day/night transition event
        document.addEventListener('dayNightTransition', (e) => {
            const isNight = e.detail.isNight;
            // Adjust ambient music for night/day
            if (isNight) {
                this.transitionToNightAmbience();
            } else {
                this.transitionToDayAmbience();
            }
        });
    }
    
    // Create wind sound using white noise
    createWindSound() {
        // Create noise buffer
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(
            1, bufferSize, this.audioContext.sampleRate
        );
        
        // Fill buffer with white noise
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        // Create noise source
        this.windSound = this.audioContext.createBufferSource();
        this.windSound.buffer = noiseBuffer;
        this.windSound.loop = true;
        this.windSound.connect(this.windGain);
        this.windSound.start();
    }
    
    // Create ambient background music
    createAmbientMusic() {
        try {
            // Create ambient oscillators
            const numOscillators = 5;
            const baseFrequencies = [220, 277.18, 329.63, 440, 554.37]; // A, C#, E, A, C# (A major chord)
            
            for (let i = 0; i < numOscillators; i++) {
                // Create oscillator
                const osc = this.audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = baseFrequencies[i % baseFrequencies.length];
                
                // Add slight detuning for richness
                osc.detune.value = Math.random() * 10 - 5;
                
                // Create individual gain for this oscillator
                const gain = this.audioContext.createGain();
                gain.gain.value = 0.05; // Very quiet
                
                // Connect oscillator to its gain node, then to the main music gain
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                // Start the oscillator
                osc.start();
                
                // Slowly modulate the volume for a breathing effect
                this.modulateGain(gain, 0.03, 0.07, 5 + i * 2);
            }
            
            console.log('Ambient music created');
        } catch (e) {
            console.error('Error creating ambient music:', e);
        }
    }
    
    // Modulate a gain node's value over time for ambient effects
    modulateGain(gainNode, minValue, maxValue, period) {
        const startTime = this.audioContext.currentTime;
        
        // Function to update gain
        const updateGain = () => {
            const now = this.audioContext.currentTime;
            const elapsed = now - startTime;
            const phase = (elapsed % period) / period;
            const value = minValue + (maxValue - minValue) * (0.5 + 0.5 * Math.sin(2 * Math.PI * phase));
            
            gainNode.gain.setValueAtTime(value, now);
            
            // Schedule next update
            requestAnimationFrame(updateGain);
        };
        
        // Start modulation
        updateGain();
    }
    
    // Transition to night ambience
    transitionToNightAmbience() {
        if (!this.audioContext || !this.musicGain) return;
        
        // Create night-specific sounds (e.g., crickets, owl hoots)
        try {
            // Create cricket-like sound using filtered noise
            const bufferSize = this.audioContext.sampleRate * 2;
            const noiseBuffer = this.audioContext.createBuffer(
                1, bufferSize, this.audioContext.sampleRate
            );
            
            // Fill with noise
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                // Create patterns that sound like crickets
                const period = this.audioContext.sampleRate / 8;
                const phase = i % period;
                
                if (phase < period * 0.1) {
                    data[i] = Math.random() * 0.5;
                } else {
                    data[i] = 0;
                }
            }
            
            // Create source
            const cricketSource = this.audioContext.createBufferSource();
            cricketSource.buffer = noiseBuffer;
            cricketSource.loop = true;
            
            // Create filter
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 4000;
            filter.Q.value = 10;
            
            // Create gain
            const cricketGain = this.audioContext.createGain();
            cricketGain.gain.value = 0;
            
            // Connect
            cricketSource.connect(filter);
            filter.connect(cricketGain);
            cricketGain.connect(this.audioContext.destination);
            
            // Start and fade in
            cricketSource.start();
            cricketGain.gain.setTargetAtTime(0.05, this.audioContext.currentTime, 5);
            
            // Store for later
            this.cricketSound = {
                source: cricketSource,
                gain: cricketGain
            };
        } catch (e) {
            console.error('Error creating night ambience:', e);
        }
    }
    
    // Transition to day ambience
    transitionToDayAmbience() {
        if (!this.audioContext) return;
        
        // Fade out cricket sounds if they exist
        if (this.cricketSound && this.cricketSound.gain) {
            this.cricketSound.gain.gain.setTargetAtTime(0, this.audioContext.currentTime, 5);
            
            // Stop cricket sound after fade out
            setTimeout(() => {
                if (this.cricketSound && this.cricketSound.source) {
                    try {
                        this.cricketSound.source.stop();
                    } catch (e) {
                        // Ignore errors if already stopped
                    }
                }
            }, 10000);
        }
    }
    
    // Load crash sound
    loadCrashSound() {
        // Create crash sound using oscillators for now
        // In a real application, you would load an audio file
        this.crashSound = {
            play: () => {
                try {
                    // Create crash oscillator
                    const crashOsc = this.audioContext.createOscillator();
                    crashOsc.type = 'sawtooth';
                    crashOsc.frequency.value = 150;
                    
                    // Create noise for crash
                    const noiseBuffer = this.audioContext.createBuffer(
                        1, this.audioContext.sampleRate * 1.5, this.audioContext.sampleRate
                    );
                    const noiseData = noiseBuffer.getChannelData(0);
                    for (let i = 0; i < noiseBuffer.length; i++) {
                        noiseData[i] = Math.random() * 2 - 1;
                    }
                    
                    const noiseSource = this.audioContext.createBufferSource();
                    noiseSource.buffer = noiseBuffer;
                    
                    // Create gain nodes
                    const crashGain = this.audioContext.createGain();
                    crashGain.gain.value = 0.3;
                    
                    const noiseGain = this.audioContext.createGain();
                    noiseGain.gain.value = 0.2;
                    
                    // Create filter for noise
                    const filter = this.audioContext.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.value = 1000;
                    
                    // Connect
                    crashOsc.connect(crashGain);
                    noiseSource.connect(filter);
                    filter.connect(noiseGain);
                    
                    crashGain.connect(this.audioContext.destination);
                    noiseGain.connect(this.audioContext.destination);
                    
                    // Start sounds
                    crashOsc.start();
                    noiseSource.start();
                    
                    // Frequency drop for oscillator
                    crashOsc.frequency.exponentialRampToValueAtTime(
                        40, 
                        this.audioContext.currentTime + 0.5
                    );
                    
                    // Volume fade out
                    crashGain.gain.exponentialRampToValueAtTime(
                        0.001, 
                        this.audioContext.currentTime + 1.0
                    );
                    
                    noiseGain.gain.exponentialRampToValueAtTime(
                        0.001, 
                        this.audioContext.currentTime + 1.5
                    );
                    
                    // Stop after fade out
                    setTimeout(() => {
                        crashOsc.stop();
                        noiseSource.stop();
                    }, 1500);
                } catch (e) {
                    console.error('Error playing crash sound:', e);
                }
            }
        };
    }
    
    // Update sounds based on flight data
    update(speed, altitude, isGrounded) {
        // If sound is disabled, don't update
        if (!this.isSoundEnabled) return;
        
        // Resume audio context if it's suspended (needed for Chrome's autoplay policy)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Update current state
        this.currentSpeed = speed;
        this.currentAltitude = altitude;
        
        // Update engine sound
        if (this.engineOscillator && this.engineGain) {
            // Adjust frequency based on speed
            const baseFreq = 100;
            const maxFreq = 400;
            const speedFactor = Math.min(speed / 50, 1); // Normalize to 0-1
            
            const targetFreq = baseFreq + (maxFreq - baseFreq) * speedFactor;
            this.engineOscillator.frequency.setTargetAtTime(
                targetFreq, 
                this.audioContext.currentTime, 
                0.1
            );
            
            // Adjust volume based on speed
            const targetVolume = isGrounded ? 
                Math.min(0.3 * speedFactor, 0.3) : 
                Math.min(0.2 * speedFactor, 0.2);
                
            this.engineGain.gain.setTargetAtTime(
                targetVolume, 
                this.audioContext.currentTime, 
                0.1
            );
        }
        
        // Update wind sound
        if (this.windGain) {
            // Wind volume increases with speed and altitude
            const speedFactor = Math.min(speed / 50, 1);
            const altitudeFactor = Math.min(altitude / 100, 1);
            const windVolume = isGrounded ? 
                0 : 
                Math.min(0.05 + (0.2 * speedFactor * altitudeFactor), 0.3);
                
            this.windGain.gain.setTargetAtTime(
                windVolume, 
                this.audioContext.currentTime, 
                0.2
            );
        }
    }
    
    // Toggle sound on/off
    toggleSound() {
        this.isSoundEnabled = !this.isSoundEnabled;
        
        // Update UI
        const soundIcon = document.querySelector('.sound-icon');
        if (soundIcon) {
            soundIcon.textContent = this.isSoundEnabled ? '🔊' : '🔇';
        }
        
        // Mute/unmute all sounds
        if (this.engineGain) {
            this.engineGain.gain.value = this.isSoundEnabled ? (this.currentSpeed / 50) * 0.2 : 0;
        }
        
        if (this.windGain) {
            this.windGain.gain.value = this.isSoundEnabled ? (this.currentSpeed / 50) * 0.2 : 0;
        }
        
        if (this.musicGain) {
            this.musicGain.gain.value = this.isSoundEnabled ? 0.3 : 0;
        }
    }
    
    // Play crash sound
    playCrashSound() {
        if (this.crashSound && this.isSoundEnabled) {
            this.crashSound.play();
        }
    }
    
    // Clean up resources
    dispose() {
        if (this.engineOscillator) {
            this.engineOscillator.stop();
        }
        
        if (this.windSound) {
            this.windSound.stop();
        }
        
        if (this.cricketSound && this.cricketSound.source) {
            try {
                this.cricketSound.source.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
