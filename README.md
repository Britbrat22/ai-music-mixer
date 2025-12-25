# AI Music Mixer & Mastering Tool

A professional web-based AI music mixing and mastering application that cleans vocals, generates beats, and produces radio-ready audio directly in your browser.

## Features

- 🎤 **AI Vocal Cleaning**: Remove noise and enhance vocal clarity
- 🥁 **AI Beat Replacement**: Generate new beats in various styles
- 🎚️ **Auto Mastering**: Professional mastering for radio-ready sound
- 📱 **Cross-Platform**: Works on any device with a web browser
- 🔒 **Privacy-First**: All processing happens locally in your browser
- 📁 **Multiple Formats**: Support for MP3 and WAV input/output

## Quick Start

1. **Visit the live app**: [GitHub Pages URL]
2. **Upload your track**: Drag & drop or click to select audio file
3. **Choose processing options**: Select vocal cleaning, beat replacement, and mastering
4. **Process**: Click "Process Audio" and wait for AI to work
5. **Download**: Preview and download your processed track

## Technologies Used

- **Web Audio API**: Real-time audio processing
- **TensorFlow.js**: Client-side AI inference
- **WebAssembly**: High-performance audio processing
- **Modern JavaScript**: ES6+ with async/await
- **CSS3**: Responsive design with modern features

## Installation

### Option 1: Use GitHub Pages (Recommended)

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Visit your deployed app at `https://[username].github.io/[repository-name]`

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/[username]/ai-music-mixer.git
cd ai-music-mixer

# Serve the files (any static file server works)
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js with http-server
npx http-server

# Option 3: VS Code Live Server extension
# Just right-click on index.html and select "Open with Live Server"
