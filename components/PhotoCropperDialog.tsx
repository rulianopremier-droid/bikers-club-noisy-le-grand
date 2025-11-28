import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageCropper from '@/components/ImageCropper';

interface PhotoCropperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoConfirm: (croppedImage: string) => void;
  tempImageSrc: string;
}

export default function PhotoCropperDialog({
  isOpen,
  onClose,
  onPhotoConfirm,
  tempImageSrc,
}: PhotoCropperDialogProps) {
  const handleCropComplete = (croppedImage: string) => {
    if (croppedImage) {
      onPhotoConfirm(croppedImage);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="photo-cropper-dialog">
        <DialogHeader>
          <DialogTitle className="text-white">Recadrez et zoomez votre photo</DialogTitle>
        </DialogHeader>
        {tempImageSrc && (
          <ImageCropper 
            src={tempImageSrc}
            onCropComplete={handleCropComplete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
