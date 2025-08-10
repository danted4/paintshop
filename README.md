# PaintShop - Paint & Photo Editor

A fully frontend web application that combines Microsoft Paint-like drawing features with Photoshop-style photo editing in a beautiful, seamless hybrid interface.

## Features

### 🎨 Paint Mode
- **Drawing Tools**: Pencil, brush, eraser with adjustable sizes and colors
- **Shapes**: Rectangle, ellipse, and line drawing tools
- **Fill Tool**: Bucket fill with flood fill algorithm
- **Color Picker**: Custom color selection plus 15 predefined colors
- **Undo/Redo**: Full undo/redo support with 20-step history

### 🖼️ Photo Edit Mode
- **Filters**: Brightness, contrast, saturation, blur, and hue adjustments
- **Transformations**: Rotate 90°/-90°, flip horizontal/vertical, scale
- **Cropping**: Interactive crop selection with visual overlay
- **Undo/Redo**: Separate undo/redo stack for photo edits

### 🚀 Core Features
- **Image Upload**: Drag & drop or click to upload (JPEG, PNG, GIF, WebP)
- **Mode Toggle**: Seamless switching between Paint and Photo Edit modes
- **Export**: Download as PNG, JPEG, or WebP with quality options
- **Responsive Design**: Optimized for desktop and tablet devices
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance**: Optimized canvas operations with throttling and debouncing

## Technical Stack

- **Frontend Framework**: Preact 10.19.3
- **Build Tool**: Vite 5.4.19
- **Styling**: CSS with modern features (backdrop-filter, CSS Grid/Flexbox)
- **Canvas API**: HTML5 Canvas for all drawing and editing operations

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