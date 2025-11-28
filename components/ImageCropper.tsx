import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImage: string) => void;
}

// Carré format: ratio 1:1 (width:height)
const PREVIEW_WIDTH = 200;
const PREVIEW_HEIGHT = 200;

export default function ImageCropper({ src, onCropComplete }: ImageCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Update canvas preview whenever any value changes
  useEffect(() => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

    // Sauvegarder le contexte
    ctx.save();

    // Aller au centre
    ctx.translate(PREVIEW_WIDTH / 2, PREVIEW_HEIGHT / 2);
    
    // Appliquer zoom et pan
    ctx.scale(zoom, zoom);
    ctx.translate(panX, panY);
    
    // Dessiner l'image centrée
    const imgWidth = imageRef.current.width;
    const imgHeight = imageRef.current.height;
    ctx.drawImage(imageRef.current, -imgWidth / 2, -imgHeight / 2);
    
    // Restaurer le contexte
    ctx.restore();
  }, [zoom, panX, panY]);

  // Global drag handlers for pan
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = (e.clientX - dragStart.x) / 5;
      const deltaY = (e.clientY - dragStart.y) / 5;
      
      setPanX(prev => prev + deltaX);
      setPanY(prev => prev + deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Gestion du drag pour le pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Seulement left click
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  // Gestion du scroll wheel pour zoom (seulement quand la souris est sur le canvas)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const scrollDelta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev + scrollDelta)));
  };

  // Gestion du touch pinch pour zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setDragStart({ x: distance, y: 0 });
      e.preventDefault();
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / dragStart.x;
      setZoom(prev => Math.max(0.1, Math.min(3, prev * scale)));
      setDragStart({ x: distance, y: 0 });
      e.preventDefault();
    } else if (e.touches.length === 1 && isDragging) {
      // Single touch drag
      const deltaX = (e.touches[0].clientX - dragStart.x) / 5;
      const deltaY = (e.touches[0].clientY - dragStart.y) / 5;
      
      setPanX(prev => prev + deltaX);
      setPanY(prev => prev + deltaY);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (!canvasRef.current) return;

    // Convertir le canvas actuel en JPEG
    const croppedImage = canvasRef.current.toDataURL('image/jpeg', 0.95);
    onCropComplete(croppedImage);
  };

  const handleCancel = () => {
    onCropComplete('');
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Preview avec les contrôles */}
      <div className="space-y-2">
        <Label className="text-white">Aperçu du recadrage (Glissez pour déplacer, Scroll pour zoomer)</Label>
        <div 
          ref={previewRef}
          className="relative bg-white rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ 
            width: `${PREVIEW_WIDTH}px`,
            height: `${PREVIEW_HEIGHT}px`,
            margin: '0 auto',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Image invisible pour charger */}
          <img
            ref={imageRef}
            src={src}
            alt="Crop source"
            className="hidden"
            onLoad={() => {
              // Forcer un redraw du canvas après chargement de l'image
              if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.fillRect(0, 0, 1, 1);
              }
            }}
          />

          {/* Canvas pour l'aperçu */}
          <canvas 
            ref={canvasRef}
            width={PREVIEW_WIDTH}
            height={PREVIEW_HEIGHT}
            className="w-full h-full pointer-events-auto"
            style={{ pointerEvents: 'auto', userSelect: 'none' }}
          />
          
          {/* Bordure de recadrage */}
          <div className="absolute inset-0 border-4 border-yellow-400 rounded-md shadow-lg pointer-events-none" />
        </div>
      </div>

      {/* Zoom info */}
      <div className="space-y-2">
        <Label className="text-white text-center block">Zoom: {(zoom * 100).toFixed(0)}%</Label>
        <p className="text-xs text-muted-foreground text-center">
          💡 Glissez pour déplacer • Roulez pour zoomer • Pincez pour zoomer (mobile)
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button 
          type="button"
          variant="secondary"
          onClick={handleCancel}
        >
          Annuler
        </Button>
        <Button 
          type="button"
          onClick={handleCrop}
        >
          Valider le recadrage
        </Button>
      </div>
    </div>
  );
}
