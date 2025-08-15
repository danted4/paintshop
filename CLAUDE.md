# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PaintShop is a modern paint and photo editor built with **Preact** and **Vite**. It's a single-page application that provides two primary modes:
- **Paint Mode**: Drawing tools with brush, pencil, shapes, and text
- **Photo Mode**: Non-destructive photo editing with filters, cropping, rotation, and transformations

Node Version: `lts/jod`

## Development Commands

### Essential Commands
```bash
# Install dependencies
yarn install

# Start development server (with hot reload)
yarn dev

# Build for production
yarn build

# Preview production build locally
yarn preview

# Build and preview in one command
yarn preview
```

### Utility Commands
```bash
# Capture UI evidence/screenshots for testing
yarn capture-evidence

# Auto-commit and push changes (used by automation)
yarn git:autopush

# Full UI analysis workflow (dev server + screenshots)
yarn analyze-ui
```

## Architecture Overview

### Component Structure
- **App.jsx**: Main application component managing global state for both paint and photo modes
- **PaintCanvas.jsx**: Canvas-based painting component with drawing tools and undo/redo
- **PhotoEditor.jsx**: Photo editing component with filters, transforms, and cropping
- **Component Library**: Modular UI components in `/src/components/` (CanvasSettings, ExportButton, HelpModal, ImageUpload, ModeToggle, PaintToolsSidebar, Toolbar)

### State Management Architecture
The app uses a **lifted state pattern** where the main App component manages all state and passes it down as props. Key state categories:
- **Paint state**: tool selection, brush settings, colors, undo/redo stacks
- **Photo state**: filter controls, crop settings, rotation/scale, separate undo/redo
- **UI state**: modals, loading states, error handling, zoom levels

### Shared Utilities
- **`utils/performance.js`**: Throttling, debouncing, and optimized canvas creation for 60fps drawing
- **`utils/errorHandler.js`**: Centralized error handling with user-friendly messages and error codes

### Key Technical Features
- **Dual-mode editing**: Paint and photo modes with different tool sets and state management
- **Performance optimizations**: Throttled drawing (60fps), debounced filters, optimized canvas operations
- **Memory management**: Efficient undo/redo stacks and image compression for large files
- **Error boundaries**: Comprehensive error handling for canvas operations, file uploads, and memory constraints
- **Responsive design**: Works across desktop, tablet, and mobile with touch support

### File Format Support
- **Input**: JPEG, PNG, GIF, WebP (max 10MB, max dimensions 4096x4096)
- **Export**: Canvas-based image export functionality

### Browser Compatibility
- Chrome 88+, Firefox 84+, Safari 14+, Edge 88+

## Development Notes

The application implements imperative handles using `useImperativeHandle` to expose methods from child components (PaintCanvas, PhotoEditor) to the parent App component. This pattern allows for centralized control while maintaining component encapsulation.

All CSS is component-scoped with dedicated `.css` files for each component. The project uses modern CSS features and does not require any CSS preprocessors.