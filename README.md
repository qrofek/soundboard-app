# Space Soundboard App

A beautiful, space-themed Progressive Web App (PWA) for playing short sound effects on mobile devices, optimized for iPhone.

## Features

- **9 Colorful Sound Buttons** - Each with unique colors and smooth animations
- **Space Nebula Background** - Animated gradient background with floating effects
- **Purple Glow Effects** - Buttons glow with purple light when playing sounds
- **Smooth Navigation** - Slider-based page transitions between soundboard and add sound pages
- **Add Custom Sounds** - Upload and play your own audio files
- **Progressive Web App** - Installable on iPhone home screen
- **Touch Optimized** - Designed specifically for mobile touch interactions
- **Responsive Design** - Works on various screen sizes

## Technology Stack

- **HTML5** - Semantic markup and structure
- **CSS3** - Advanced styling with animations and gradients
- **Vanilla JavaScript** - No frameworks, pure performance
- **Web Audio API** - High-quality audio playback
- **Service Worker** - Offline functionality and caching
- **PWA Manifest** - App-like installation experience

## Installation

### For Development

1. Clone or download this repository
2. Place your sound files in the `sounds/` directory (see `sounds/README.md` for details)
3. Serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

4. Open `http://localhost:8000` in your browser

### For Production

1. Upload all files to your web server
2. Ensure HTTPS is enabled (required for PWA features)
3. Access the app through your domain

### Installing as PWA on iPhone

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear on your home screen like a native app

## File Structure

```
soundboard-app/
├── index.html          # Main HTML file
├── styles.css          # All styling and animations
├── script.js           # Main JavaScript functionality
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline support
├── sounds/            # Audio files directory
│   ├── README.md      # Sound files documentation
│   ├── sound1.mp3     # Default sound files (1-9)
│   ├── sound2.mp3
│   └── ...
├── icons/             # App icons for PWA
└── README.md          # This file
```

## Usage

### Playing Sounds

1. Tap any of the 9 colored buttons to play a sound
2. The button will glow purple while the sound is playing
3. Only one sound can play at a time

### Adding Custom Sounds

1. Navigate to the "Add" page using the slider at the bottom
2. Tap the large plus button
3. Select audio files from your device
4. The new sounds will appear as additional buttons on the main page

### Navigation

- Use the slider at the bottom to switch between pages
- Smooth animations provide visual feedback
- Touch-optimized for mobile devices

## Customization

### Adding Your Own Sounds

1. Place audio files in the `sounds/` directory
2. Name them `sound1.mp3`, `sound2.mp3`, etc.
3. Supported formats: MP3, WAV, OGG, M4A
4. Keep files under 1MB for optimal performance

### Changing Colors

Edit the CSS custom properties in `styles.css`:

```css
.sound-button {
    --button-color: #your-color-here;
}
```

### Modifying the Background

The nebula background is created using CSS gradients. Edit the `.background-nebula` class in `styles.css` to customize the space theme.

## Browser Support

- **iOS Safari** 12+ (Primary target)
- **Chrome** 70+
- **Firefox** 65+
- **Edge** 79+

## Performance Optimizations

- **Lazy Loading** - Audio files are loaded on demand
- **Memory Management** - Object URLs are cleaned up to prevent memory leaks
- **Efficient Animations** - CSS transforms and opacity for smooth 60fps animations
- **Touch Optimization** - Prevents default touch behaviors that could interfere with audio

## Troubleshooting

### Sounds Not Playing

1. Check that audio files are in the correct format
2. Ensure files are properly named (sound1.mp3, etc.)
3. Check browser console for error messages
4. Verify that audio is not muted in browser settings

### PWA Installation Issues

1. Ensure you're using HTTPS in production
2. Check that the manifest.json file is accessible
3. Verify service worker registration in browser dev tools

### Performance Issues

1. Reduce audio file sizes
2. Use MP3 format for better compression
3. Check available device memory

## Future Development Ideas

- **Sound Categories** - Organize sounds into different categories
- **Sound Effects** - Add reverb, echo, or other audio effects
- **Recording** - Allow users to record their own sounds
- **Sharing** - Share sound combinations with others
- **Themes** - Multiple background themes beyond space
- **Sound Library** - Browse and download sound packs
- **Sequencer** - Create sound sequences or loops
- **Volume Control** - Individual volume sliders for each sound

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or feature requests, please open an issue in the repository or contact the development team.
