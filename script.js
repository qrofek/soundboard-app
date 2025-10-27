// Space Soundboard App - Main JavaScript File

class SoundboardApp {
    constructor() {
        this.currentPage = 1;
        this.audioElements = new Map();
        this.playingSounds = new Set();
        
        // Swipe detection variables
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50; // Minimum distance for a swipe
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAudioElements();
        this.setupPWA();
    }

    setupEventListeners() {
        // Sound button clicks and touches
        const buttons = document.querySelectorAll('.sound-button');
        console.log(`Found ${buttons.length} sound buttons`);
        
        buttons.forEach((button, index) => {
            console.log(`Setting up button ${index + 1}:`, button.getAttribute('data-sound'));
            
            // Use touchend for better mobile responsiveness
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonTouchEnd(e);
                this.playSound(e);
            }, { passive: false });
            
            // Desktop fallback
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.playSound(e);
            });
            
            button.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                this.handleButtonTouchStart(e);
            }, { passive: true });
        });

        // Navigation dots
        const dots = document.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const page = parseInt(e.target.getAttribute('data-page'));
                this.navigateToPage(page);
            });
        });

        // Slider track clicks
        const sliderTracks = document.querySelectorAll('.slider-track');
        sliderTracks.forEach(track => {
            track.addEventListener('click', (e) => {
                const rect = track.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const page = clickX < width / 2 ? 1 : 2;
                this.navigateToPage(page);
            });
        });

        // Swipe gesture detection on the entire page
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.addEventListener('touchstart', (e) => this.handleSwipeStart(e), { passive: true });
            page.addEventListener('touchmove', (e) => this.handleSwipeMove(e), { passive: true });
            page.addEventListener('touchend', (e) => this.handleSwipeEnd(e), { passive: true });
        });
    }

    initializeAudioElements() {
        // Initialize audio elements for all 30 sounds
        for (let i = 1; i <= 30; i++) {
            const audioId = `sound${i}`;
            const audioElement = document.getElementById(audioId);
            
            if (audioElement) {
                this.audioElements.set(audioId, audioElement);
                console.log(`Audio element ${audioId} found and stored`);
                
                // Add event listeners for audio events
                audioElement.addEventListener('play', () => this.onSoundStart(audioId));
                audioElement.addEventListener('ended', () => this.onSoundEnd(audioId));
                audioElement.addEventListener('error', (e) => this.onSoundError(audioId, e));
                
                // Set audio properties for better compatibility
                audioElement.preload = 'auto';
                audioElement.volume = 1.0;
                
                // Try to load the audio
                try {
                    audioElement.load();
                } catch (error) {
                    console.error(`Error loading audio ${audioId}:`, error);
                }
            }
        }
        
        console.log(`Total audio elements stored: ${this.audioElements.size}`);
    }

    navigateToPage(pageNumber) {
        if (pageNumber === this.currentPage) return;
        
        console.log(`Navigating from page ${this.currentPage} to page ${pageNumber}`);
        
        // Stop all sounds when changing pages
        this.stopAllSounds();
        
        // Get page elements
        const currentPageElement = document.getElementById(`soundboard-page-${this.currentPage}`);
        const newPageElement = document.getElementById(`soundboard-page-${pageNumber}`);
        
        // Update page classes
        currentPageElement.classList.remove('active');
        currentPageElement.classList.add('prev');
        
        newPageElement.classList.remove('prev');
        newPageElement.classList.add('active');
        
        // Update dots
        document.querySelectorAll('.dot').forEach(dot => {
            const dotPage = parseInt(dot.getAttribute('data-page'));
            if (dotPage === pageNumber) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update slider thumbs
        document.querySelectorAll('.slider-track').forEach(track => {
            track.setAttribute('data-page', pageNumber);
        });
        
        // Reset prev class after transition
        setTimeout(() => {
            if (!currentPageElement.classList.contains('active')) {
                currentPageElement.classList.remove('prev');
            }
        }, 500);
        
        this.currentPage = pageNumber;
        
        // Haptic feedback
        this.hapticFeedback();
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
        const button = event.currentTarget;
        const soundId = button.getAttribute('data-sound');
        
        if (!soundId) {
            console.error('No sound ID found on button');
            return;
        }

        // Get audio element
        let audioElement = this.audioElements.get(soundId);
        if (!audioElement) {
            audioElement = document.getElementById(soundId);
            if (audioElement) {
                this.audioElements.set(soundId, audioElement);
            }
        }
        
        if (!audioElement) {
            console.warn(`Audio element not found for sound: ${soundId}`);
            return;
        }

        // Stop any currently playing sound
        this.stopAllSounds();

        // Add visual feedback immediately
        button.classList.add('playing');

        // Play the sound immediately
        try {
            // Reset to start
            audioElement.currentTime = 0;
            
            // Force load if needed
            if (audioElement.readyState < 2) {
                audioElement.load();
            }
            
            // Play with promise handling
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`Sound ${soundId} playing`);
                }).catch(error => {
                    console.error(`Error playing sound ${soundId}:`, error);
                    button.classList.remove('playing');
                    
                    // Retry once
                    setTimeout(() => {
                        audioElement.play().catch(e => console.error('Retry failed:', e));
                    }, 100);
                });
            }
        } catch (error) {
            console.error(`Error playing sound ${soundId}:`, error);
            button.classList.remove('playing');
        }
        
        // Add haptic feedback
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

    // Swipe gesture handlers
    handleSwipeStart(event) {
        // Don't handle swipe if touching a button
        if (event.target.classList.contains('sound-button') || 
            event.target.closest('.sound-button') ||
            event.target.classList.contains('dot') ||
            event.target.closest('.slider-track')) {
            return;
        }
        
        this.touchStartX = event.changedTouches[0].screenX;
        this.touchStartY = event.changedTouches[0].screenY;
    }

    handleSwipeMove(event) {
        // Track the current position
        this.touchEndX = event.changedTouches[0].screenX;
        this.touchEndY = event.changedTouches[0].screenY;
    }

    handleSwipeEnd(event) {
        // Don't handle swipe if touching a button
        if (event.target.classList.contains('sound-button') || 
            event.target.closest('.sound-button') ||
            event.target.classList.contains('dot') ||
            event.target.closest('.slider-track')) {
            return;
        }
        
        this.handleSwipeGesture();
    }

    handleSwipeGesture() {
        const diffX = this.touchStartX - this.touchEndX;
        const diffY = this.touchStartY - this.touchEndY;
        
        // Check if horizontal swipe is more significant than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Check if swipe distance is significant enough
            if (Math.abs(diffX) > this.minSwipeDistance) {
                if (diffX > 0) {
                    // Swiped left - go to next page
                    if (this.currentPage === 1) {
                        this.navigateToPage(2);
                    }
                } else {
                    // Swiped right - go to previous page
                    if (this.currentPage === 2) {
                        this.navigateToPage(1);
                    }
                }
            }
        }
        
        // Reset touch positions
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
    }

    // Button touch handlers (for visual feedback)
    handleButtonTouchStart(event) {
        const button = event.currentTarget;
        button.style.transform = 'translateY(2px) scale(0.95)';
    }

    handleButtonTouchEnd(event) {
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
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SoundboardApp...');
    window.soundboardApp = new SoundboardApp();
    console.log('SoundboardApp initialized:', window.soundboardApp);
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
