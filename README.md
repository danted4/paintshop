# 🎨 PaintShop

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-lts%2Fjod-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Preact](https://img.shields.io/badge/Preact-10.19+-673AB8.svg?logo=preact)](https://preactjs.com/)

A modern, fast, and intuitive **paint and photo editor** built with Preact and Vite. Create digital artwork or edit photos with a comprehensive set of tools, all running smoothly in your browser with **dark mode support**.

## ✨ Features

### 🎨 Paint Mode
- Draw with brush, pencil, eraser, fill, rectangle, ellipse, line, and text tools
- Adjustable brush size and color picker
- Undo/redo and clear canvas
- Zoom in/out and reset zoom
- Load images as backgrounds
- Export your artwork as PNG, JPEG, or WEBP

### 🖼️ Photo Mode
- Load and edit photos with non-destructive controls
- Adjust brightness, contrast, saturation, blur, and hue
- Crop images with precise selection overlay (works at all zoom levels)
- Rotate, flip (horizontal/vertical), and scale images
- Undo/redo for all photo edits
- Reset filters and transformations

### 🌟 General
- Modern, responsive UI with sidebar for quick access to tools
- **🌙 Dark Mode Support** - Light/Dark/System theme options
- Keyboard shortcuts for common actions (new canvas, open image, help, etc.)
- Helpful tooltips and help modal
- Error handling and loading indicators
- Cross-platform compatibility (desktop, tablet, mobile)

## 🛠️ Technology Stack

- **Frontend**: [Preact](https://preactjs.com/) - Fast 3kB alternative to React
- **Build Tool**: [Vite](https://vitejs.dev/) - Lightning fast build tool
- **Styling**: CSS3 with CSS Variables for theming
- **State Management**: Context API with hooks
- **Image Processing**: HTML5 Canvas API
- **Testing**: Puppeteer for UI evidence capture

## 🚀 Quick Start

### Prerequisites
- **Node.js** (LTS/jod version recommended)
- **Yarn** package manager

### Installation & Running

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd paintshop
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Start development server**:
   ```bash
   yarn dev
   ```

4. **Open your browser** to `http://localhost:5173`

### Available Scripts

```bash
# Development
yarn dev          # Start development server with hot reload
yarn build        # Build for production
yarn preview      # Build and preview production locally

# Utilities
yarn capture-evidence    # Capture UI screenshots for testing
yarn analyze-ui         # Full UI analysis workflow
```

## 🎯 Usage

1. **Upload an Image**: Drag and drop an image file or click the upload area
2. **Choose Mode**: Toggle between Paint mode (🎨) and Photo Edit mode (🖼️) 
3. **Edit**: Use the comprehensive tools and controls to edit your image
4. **Theme**: Switch between Light/Dark/System themes using the theme toggle
5. **Export**: Click the Export button to download your edited image in various formats

## 📁 File Support

- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Maximum File Size**: 10MB
- **Maximum Dimensions**: 4096x4096 pixels
- **Export Formats**: PNG, JPEG, WebP with quality control

## 🌐 Browser Compatibility

- Chrome 88+
- Firefox 84+
- Safari 14+
- Edge 88+

## ⚡ Performance

The application includes several performance optimizations:

- Throttled drawing operations (60fps)
- Debounced filter applications
- Optimized canvas operations
- Memory-efficient undo/redo stacks
- Image compression for large files

## Error Handling

Comprehensive error handling covers:

- Unsupported file formats
- File size limits
- Canvas operation failures
- Memory constraints
- Network errors

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow the existing code style and patterns
- Test your changes thoroughly
- Update documentation as needed
- Use meaningful commit messages

## 📸 Screenshots

The project includes automated UI evidence capture. Screenshots are generated in the `evidence/` folder showing the application across different screen sizes and modes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Preact](https://preactjs.com/) for fast, lightweight components
- Powered by [Vite](https://vitejs.dev/) for lightning-fast development experience
- Canvas API for powerful image manipulation capabilities
