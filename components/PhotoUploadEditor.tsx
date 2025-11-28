import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import ImageCropper from '@/components/ImageCropper';
import { X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PhotoUploadEditorProps {
  onPhotoSelected: (photo: string) => void;
  currentPhoto?: string | null;
  onPhotoCleared?: () => void;
}

export default function PhotoUploadEditor({ 
  onPhotoSelected, 
  currentPhoto,
  onPhotoCleared 
}: PhotoUploadEditorProps) {
  const [tempPhotoSrc, setTempPhotoSrc] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const img = new Image();
        
        img.onload = () => {
          try {
            // Crée un canvas pour redimensionner
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            // Réduit la taille si > 2000px (pour éviter les crashes)
            if (width > 2000 || height > 2000) {
              const ratio = Math.min(2000 / width, 2000 / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context');
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Conversion en base64 avec compression
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            setTempPhotoSrc(compressed);
            setIsEditing(true);
          } catch (err) {
            console.error('Erreur canvas:', err);
          }
        };

        img.onerror = () => {
          console.error('Erreur chargement image');
        };

        img.src = event.target?.result as string;
      } catch (err) {
        console.error('Erreur fichier:', err);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    if (croppedImage) {
      onPhotoSelected(croppedImage);
    }
    setTempPhotoSrc(null);
    setIsEditing(false);
  };

  if (isEditing && tempPhotoSrc) {
    return (
      <Card className="p-6 space-y-4 border-2 border-primary" data-testid="photo-editor-card">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-white">Recadrer et zoomer votre photo</h4>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setTempPhotoSrc(null);
            }}
            data-testid="button-close-editor"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <ImageCropper 
          src={tempPhotoSrc}
          onCropComplete={handleCropComplete}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-white font-medium">Photo</Label>
      <div className="flex gap-2 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          data-testid="input-photo"
          className="flex-1 px-3 py-2 bg-secondary text-white rounded border border-secondary-foreground/20"
        />
        {currentPhoto && (
          <Button
            size="icon"
            variant="destructive"
            onClick={() => {
              onPhotoCleared?.();
              setTempPhotoSrc(null);
            }}
            data-testid="button-clear-photo"
            title="Supprimer la photo"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {currentPhoto && (
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={currentPhoto} alt="Photo sélectionnée" />
            <AvatarFallback>OK</AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">Photo enregistrée</p>
        </div>
      )}
    </div>
  );
}
