# PaintShop - Paint & Photo Editor
# PaintShop

PaintShop is a modern paint and photo editor built with Preact and Vite. It offers a fast, intuitive, and feature-rich experience for both drawing and photo editing.

## ✨ Features

### Paint Mode
- Draw with brush, pencil, eraser, fill, rectangle, ellipse, line, and text tools
- Adjustable brush size and color picker
- Undo/redo and clear canvas
- Zoom in/out and reset zoom
- Load images as backgrounds
- Export your artwork as an image

### Photo Mode
- Load and edit photos with non-destructive controls
- Adjust brightness, contrast, saturation, blur, and hue
- Crop images with precise selection overlay (works at all zoom levels)
- Rotate, flip (horizontal/vertical), and scale images
- Undo/redo for all photo edits
- Reset filters and transformations

### General
- Modern, responsive UI with sidebar for quick access to tools
- Keyboard shortcuts for common actions (new canvas, open image, help, etc.)
- Helpful tooltips and help modal
- Error handling and loading indicators

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser to the local address shown in the terminal (usually http://localhost:5173)

## 🛠️ Build

To create a production build:

```bash
npm run build
```

## 📄 License

MIT
## Getting Started

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Start development server**:
   ```bash
   yarn dev
   ```

3. **Build for production**:
   ```bash
   yarn build
   ```

4. **Preview production build**:
   ```bash
   yarn preview
   ```

## Usage

1. **Upload an Image**: Drag and drop an image file or click the upload area
2. **Choose Mode**: Toggle between Paint mode (🎨) and Photo Edit mode (🖼️)
3. **Edit**: Use the tools and controls to edit your image
4. **Export**: Click the Export button to download your edited image

## File Support

- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Maximum File Size**: 10MB
- **Maximum Dimensions**: 4096x4096 pixels

## Browser Compatibility

- Chrome 88+
- Firefox 84+
- Safari 14+
- Edge 88+

## Performance

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

## License

This project is open source and available under the [MIT License](LICENSE).