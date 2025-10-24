// Space Soundboard App - Main JavaScript File

class SoundboardApp {
    constructor() {
        this.audioElements = new Map();
        this.playingSounds = new Set();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAudioElements();
        this.setupPWA();
    }

    setupEventListeners() {
        // Sound button clicks
        const buttons = document.querySelectorAll('.sound-button');
        console.log(`Found ${buttons.length} sound buttons`);
        
        buttons.forEach((button, index) => {
            console.log(`Setting up button ${index + 1}:`, button.getAttribute('data-sound'));
            button.addEventListener('click', (e) => this.playSound(e));
            button.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            button.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        });

        // Prevent default touch behaviors
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('sound-button')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    initializeAudioElements() {
        // Initialize audio elements for all 9 sounds
        for (let i = 1; i <= 9; i++) {
            const audioId = `sound${i}`;
            const audioElement = document.getElementById(audioId);
            
            console.log(`Looking for audio element: ${audioId}`, audioElement);
            
            if (audioElement) {
                this.audioElements.set(audioId, audioElement);
                console.log(`Audio element ${audioId} found and stored`);
                
                // Add event listeners for audio events
                audioElement.addEventListener('play', () => this.onSoundStart(audioId));
                audioElement.addEventListener('ended', () => this.onSoundEnd(audioId));
                audioElement.addEventListener('error', (e) => this.onSoundError(audioId, e));
                audioElement.addEventListener('canplaythrough', () => {
                    console.log(`Audio ${audioId} is ready to play`);
                });
                audioElement.addEventListener('loadstart', () => {
                    console.log(`Started loading audio ${audioId}`);
                });
                audioElement.addEventListener('loadeddata', () => {
                    console.log(`Audio ${audioId} data loaded`);
                });
                
                // Set audio properties for better compatibility
                audioElement.preload = 'auto';
                audioElement.volume = 1.0;
                
                // Try to load the audio
                try {
                    audioElement.load();
                } catch (error) {
                    console.error(`Error loading audio ${audioId}:`, error);
                }
            } else {
                console.error(`Audio element ${audioId} not found!`);
            }
        }
        
        console.log(`Total audio elements stored: ${this.audioElements.size}`);
    }


    setupPWA() {
        // Register service worker for PWA functionality
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    playSound(event) {
        console.log('playSound called!', event);
        event.preventDefault();
        event.stopPropagation();
        
        const button = event.currentTarget;
        const soundId = button.getAttribute('data-sound');
        
        console.log('Button clicked:', button);
        console.log('Sound ID:', soundId);
        
        if (!soundId) {
            console.error('No sound ID found on button');
            return;
        }

        // Try to get audio element from both Map and DOM
        let audioElement = this.audioElements.get(soundId);
        if (!audioElement) {
            audioElement = document.getElementById(soundId);
            if (audioElement) {
                this.audioElements.set(soundId, audioElement);
                console.log('Audio element retrieved from DOM and stored');
            }
        }
        
        console.log('Audio element retrieved:', audioElement);
        
        if (!audioElement) {
            console.warn(`Audio element not found for sound: ${soundId}`);
            console.log('Available audio elements:', Array.from(this.audioElements.keys()));
            return;
        }

        // Debug information
        console.log(`Attempting to play sound: ${soundId}`);
        console.log(`Audio element src: ${audioElement.src}`);
        console.log(`Audio element readyState: ${audioElement.readyState}`);
        console.log(`Audio element networkState: ${audioElement.networkState}`);

        // Stop any currently playing sound
        this.stopAllSounds();

        // Add visual feedback immediately
        button.classList.add('playing');

        // Play the sound
        try {
            audioElement.currentTime = 0;
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`Sound ${soundId} started playing successfully`);
                }).catch(error => {
                    console.error(`Error playing sound ${soundId}:`, error);
                    console.error('Error details:', {
                        name: error.name,
                        message: error.message,
                        code: error.code
                    });
                    this.showError(`Unable to play sound ${soundId}. Please check your audio settings.`);
                    button.classList.remove('playing');
                });
            }
        } catch (error) {
            console.error(`Error playing sound ${soundId}:`, error);
            button.classList.remove('playing');
        }
        
        // Add haptic feedback if available
        this.hapticFeedback();
    }

    onSoundStart(soundId) {
        this.playingSounds.add(soundId);
        const button = document.querySelector(`[data-sound="${soundId}"]`);
        if (button) {
            button.classList.add('playing');
        }
    }

    onSoundEnd(soundId) {
        this.playingSounds.delete(soundId);
        const button = document.querySelector(`[data-sound="${soundId}"]`);
        if (button) {
            button.classList.remove('playing');
        }
    }

    onSoundError(soundId, error) {
        console.error(`Error with sound ${soundId}:`, error);
        this.playingSounds.delete(soundId);
        const button = document.querySelector(`[data-sound="${soundId}"]`);
        if (button) {
            button.classList.remove('playing');
        }
        this.showError(`Error loading sound: ${soundId}`);
    }

    stopAllSounds() {
        this.playingSounds.forEach(soundId => {
            const audioElement = this.audioElements.get(soundId);
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        });
        this.playingSounds.clear();
        
        // Remove playing class from all buttons
        document.querySelectorAll('.sound-button.playing').forEach(button => {
            button.classList.remove('playing');
        });
    }

    handleTouchStart(event) {
        const button = event.currentTarget;
        button.style.transform = 'translateY(2px) scale(0.95)';
    }

    handleTouchEnd(event) {
        const button = event.currentTarget;
        button.style.transform = 'translateY(0) scale(1)';
    }


    hapticFeedback() {
        // Add haptic feedback if supported
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    showError(message) {
        // Simple error notification
        console.error(message);
        // You could implement a toast notification here
    }

    showSuccess(message) {
        // Simple success notification
        console.log(message);
        // You could implement a toast notification here
    }

    // Test function for debugging
    testAudio(soundId = 'sound1') {
        console.log(`Testing audio: ${soundId}`);
        const audioElement = document.getElementById(soundId);
        if (audioElement) {
            console.log('Audio element found:', audioElement);
            console.log('Audio src:', audioElement.src);
            console.log('Audio readyState:', audioElement.readyState);
            
            audioElement.currentTime = 0;
            audioElement.play().then(() => {
                console.log('Test audio played successfully');
            }).catch(error => {
                console.error('Test audio failed:', error);
            });
        } else {
            console.error('Audio element not found');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SoundboardApp...');
    window.soundboardApp = new SoundboardApp();
    console.log('SoundboardApp initialized:', window.soundboardApp);
    
    // Additional fallback initialization after a short delay
    setTimeout(() => {
        console.log('Fallback initialization...');
        if (window.soundboardApp) {
            // Re-initialize audio elements if needed
            window.soundboardApp.initializeAudioElements();
            
            // Test if buttons are working
            const buttons = document.querySelectorAll('.sound-button');
            console.log(`Found ${buttons.length} buttons after fallback`);
            
            // Add a simple test click handler
            buttons.forEach((button, index) => {
                if (!button.hasAttribute('data-listener-added')) {
                    button.setAttribute('data-listener-added', 'true');
                    console.log(`Added fallback listener to button ${index + 1}`);
                }
            });
        }
    }, 1000);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Stop all sounds when app goes to background
        const app = window.soundboardApp;
        if (app) {
            app.stopAllSounds();
        }
    }
});
