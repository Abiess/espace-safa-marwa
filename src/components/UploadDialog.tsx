import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useCreateReceipt } from '@/hooks/use-receipts';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const createReceipt = useCreateReceipt();
  const navigate = useNavigate();

  const mockParse = useCallback((imageUrl: string) => {
    return {
      vendor: 'Sample Vendor',
      dateTime: new Date().toISOString(),
      receiptNo: `R${Date.now()}`,
      currency: 'MAD' as const,
      total: 125.5,
      paid: 130.0,
      change: 4.5,
      status: 'draft' as const,
      confidenceOverall: 0.85,
      imageUrl,
      lines: [
        {
          index: 0,
          descriptionRaw: 'Sample Item 1',
          qty: 2,
          unitPrice: 25.0,
          lineTotal: 50.0,
          unit: 'pcs',
          confidences: { qty: 0.9, unitPrice: 0.85, lineTotal: 0.88, description: 0.82 },
        },
        {
          index: 1,
          descriptionRaw: 'Sample Item 2',
          qty: 1,
          unitPrice: 75.5,
          lineTotal: 75.5,
          unit: 'pcs',
          confidences: { qty: 0.95, unitPrice: 0.80, lineTotal: 0.85, description: 0.78 },
        },
      ],
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);

      const mockData = mockParse(imageUrl);
      const id = await createReceipt.mutateAsync(mockData);
      onOpenChange(false);
      navigate(`/r/${id}`);
    },
    [mockParse, createReceipt, navigate, onOpenChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((f) => f.type.startsWith('image/'));

      if (imageFile) {
        handleFile(imageFile);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Failed to access camera. Please upload an image instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        stopCamera();
        await handleFile(file);
      }
    });
  }, [stopCamera, handleFile]);

  const handleClose = useCallback(() => {
    stopCamera();
    setPreview(null);
    onOpenChange(false);
  }, [stopCamera, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload or Scan Receipt</DialogTitle>
        </DialogHeader>

        {showCamera ? (
          <div className="space-y-4">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
            <div className="flex gap-2 justify-center">
              <Button onClick={capturePhoto} className="gap-2">
                <Camera size={16} />
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
                  <Button onClick={() => setPreview(null)} variant="outline" className="gap-2">
                    <X size={16} />
                    Clear
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload size={48} className="mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Drop your receipt image here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                      <Upload size={16} />
                      Choose File
                    </Button>
                    <Button onClick={startCamera} variant="outline" className="gap-2">
                      <Camera size={16} />
                      Use Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
