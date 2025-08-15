# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Git Branch Management

**ALWAYS CHECKOUT TO MAIN BRANCH FIRST** before starting any work:

```bash
git checkout main
```

**Why this is essential:**
- The user publishes from `gh-pages` branch on a separate terminal
- During conversations, the active branch may change automatically 
- Working on the wrong branch will cause file access errors and confusion
- **MUST verify you are on `main` branch** before reading files or making changes

**When to checkout to main:**
- At the start of every conversation
- If you encounter "File does not exist" errors
- Before reading CLAUDE.md or any project files
- If git commands suggest you're on a different branch

## Project Overview

PaintShop is a modern, responsive paint and photo editor built with **Preact** and **Vite**. It's a feature-rich single-page application that provides:

- **🎨 Paint Mode**: Comprehensive drawing tools (brush, pencil, eraser, fill, shapes, text)
- **🖼️ Photo Mode**: Non-destructive photo editing with filters, cropping, rotation, and transformations  
- **🌙 Dark Mode Support**: Complete theming system with Light/Dark/System options
- **📱 Cross-Platform**: Responsive design working on desktop, tablet, and mobile
- **⚡ Performance Optimized**: 60fps drawing, optimized canvas operations, efficient undo/redo

**Node Version**: `lts/jod`

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

### Core Technology Stack
- **Framework**: Preact 10.19+ (lightweight React alternative)
- **Build Tool**: Vite 5.0+ (fast development and building)
- **Styling**: CSS3 with CSS Variables for theming support
- **State Management**: Context API with React hooks pattern
- **Canvas Operations**: HTML5 Canvas API with performance optimizations

### Component Structure
- **App.jsx**: Main application component managing global state for both paint and photo modes
- **PaintCanvas.jsx**: Canvas-based painting component with drawing tools, text input, and undo/redo
- **PhotoEditor.jsx**: Photo editing component with filters, transforms, and cropping
- **ThemeToggle.jsx**: Theme switching component with Light/Dark/System options
- **Component Library**: Modular UI components in `/src/components/` including:
  - `CanvasSettings`, `ExportButton`, `HelpModal`, `ImageUpload`
  - `ModeToggle`, `PaintToolsSidebar`, `Toolbar`

### Context & State Management
- **ThemeContext.jsx**: Comprehensive theme management with system preference detection
- **Lifted State Pattern**: App component manages all state and passes down as props
- **localStorage Integration**: Theme preferences and settings persistence

### State Categories
- **Paint state**: tool selection, brush settings, colors, undo/redo stacks, text input handling
- **Photo state**: filter controls, crop settings, rotation/scale, separate undo/redo
- **UI state**: modals, loading states, error handling, zoom levels
- **Theme state**: current theme (light/dark/system), resolved theme, localStorage persistence

### Shared Utilities
- **`utils/performance.js`**: Throttling, debouncing, and optimized canvas creation for 60fps drawing
- **`utils/errorHandler.js`**: Centralized error handling with user-friendly messages and error codes

### Key Technical Features
- **Dual-mode editing**: Paint and photo modes with different tool sets and state management
- **Complete theming system**: Dark/Light/System theme support with CSS variables and smooth transitions
- **Advanced text tool**: Interactive text placement with real-time input overlay and size scaling
- **Performance optimizations**: Throttled drawing (60fps), debounced filters, optimized canvas operations
- **Memory management**: Efficient undo/redo stacks and image compression for large files
- **Error boundaries**: Comprehensive error handling for canvas operations, file uploads, and memory constraints
- **Responsive design**: Works across desktop, tablet, and mobile with touch support
- **Accessibility**: Proper contrast ratios, keyboard navigation, and screen reader support

### File Format Support
- **Input**: JPEG, PNG, GIF, WebP (max 10MB, max dimensions 4096x4096)
- **Export**: PNG, JPEG, WebP with quality control and format selection

### Browser Compatibility
- Chrome 88+, Firefox 84+, Safari 14+, Edge 88+

## Theming System Implementation

### CSS Variables Architecture
The project uses a comprehensive CSS variables system for theming:
- **Light mode variables**: `--bg-primary`, `--text-primary`, `--border-color`, etc.
- **Dark mode overrides**: `:root.dark` selectors with adapted color schemes
- **Smooth transitions**: All theme changes include 0.3s ease transitions

### Theme Context Features
- **System preference detection**: Automatically detects user's OS theme preference
- **LocalStorage persistence**: Remembers user's theme choice across sessions  
- **Real-time updates**: Theme changes apply immediately across all components
- **Media query listener**: Responds to system theme changes when in "system" mode

### Accessibility Considerations
- **High contrast ratios**: All text meets WCAG guidelines in both themes
- **Focus indicators**: Visible focus states with theme-appropriate colors
- **Canvas contrast**: Special handling for white canvas visibility in dark mode

## Development Notes

The application implements imperative handles using `useImperativeHandle` to expose methods from child components (PaintCanvas, PhotoEditor) to the parent App component. This pattern allows for centralized control while maintaining component encapsulation.

All CSS is component-scoped with dedicated `.css` files for each component. The project uses modern CSS features and does not require any CSS preprocessors.

### Text Tool Implementation
The text tool features a sophisticated implementation:
- **Click-to-place**: Users click on canvas to position text input
- **Overlay input**: Text input appears precisely at click location with proper scaling
- **Real-time preview**: Input size matches final rendered text size
- **Keyboard controls**: Enter to confirm, Escape to cancel, blur to auto-confirm
- **Dynamic sizing**: Font size scales with brush size setting (×4 multiplier)

### Canvas Architecture
- **Dual canvas system**: Main canvas for final output, temporary canvas for shape previews
- **Event handling**: Mouse/touch events with proper coordinate scaling for zoom levels
- **State management**: Separate undo/redo stacks for paint and photo modes
- **Performance**: Throttled drawing operations and optimized redraw cycles