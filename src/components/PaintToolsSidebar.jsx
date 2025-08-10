import { Toolbar } from './Toolbar'

export function PaintToolsSidebar({ 
  tool, 
  onToolChange, 
  brushSize, 
  onBrushSizeChange, 
  color, 
  onColorChange, 
  onUndo, 
  onRedo, 
  onClear, 
  canUndo, 
  canRedo, 
  tools 
}) {
  return (
    <Toolbar
      tool={tool}
      onToolChange={onToolChange}
      brushSize={brushSize}
      onBrushSizeChange={onBrushSizeChange}
      color={color}
      onColorChange={onColorChange}
      onUndo={onUndo}
      onRedo={onRedo}
      onClear={onClear}
      canUndo={canUndo}
      canRedo={canRedo}
      tools={tools}
    />
  )
}