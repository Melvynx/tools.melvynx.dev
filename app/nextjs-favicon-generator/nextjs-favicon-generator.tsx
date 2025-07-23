"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, X, ArrowLeft, Image as ImageIcon, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface NextjsIcon {
  name: string;
  size: number;
  format: 'png' | 'ico';
  fileName: string;
}

const NEXTJS_ICON_SIZES: NextjsIcon[] = [
  { name: "icon", size: 512, format: 'png', fileName: "icon.png" },
  { name: "favicon", size: 48, format: 'ico', fileName: "favicon.ico" },
  { name: "apple-icon", size: 180, format: 'png', fileName: "apple-icon.png" },
];

export function NextjsFaviconGenerator() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>("");
  const [generatedIcons, setGeneratedIcons] = useState<{ [key: string]: string }>({});
  const [selectedIcons, setSelectedIcons] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    processImage(file);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    try {
      const sourceUrl = URL.createObjectURL(file);
      setSourceImage(sourceUrl);
      setSourceFileName(file.name);

      const icons = await generateAllIconSizes(file);
      setGeneratedIcons(icons);

      // Select all icons by default
      const allSelected: { [key: string]: boolean } = {};
      NEXTJS_ICON_SIZES.forEach(icon => {
        allSelected[icon.name] = true;
      });
      setSelectedIcons(allSelected);

      toast.success("Next.js favicons generated successfully!");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAllIconSizes = async (file: File): Promise<{ [key: string]: string }> => {
    const icons: { [key: string]: string } = {};
    
    // Load source image
    const img = await loadImage(file);
    
    // Generate each size
    for (const iconConfig of NEXTJS_ICON_SIZES) {
      const canvas = await resizeImage(img, iconConfig.size, iconConfig.size);
      const blob = await canvasToBlob(canvas);
      icons[iconConfig.name] = URL.createObjectURL(blob);
    }
    
    return icons;
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const resizeImage = (img: HTMLImageElement, width: number, height: number): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      
      canvas.width = width;
      canvas.height = height;
      
      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      
      // Draw the resized image
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas);
    });
  };

  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // Always generate PNG format (ICO will be handled by filename during download)
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      }, "image/png", 1.0);
    });
  };

  const downloadSelectedIcons = async () => {
    const selectedIconNames = Object.keys(selectedIcons).filter(name => selectedIcons[name]);
    
    if (selectedIconNames.length === 0) {
      toast.error("Please select at least one icon to download");
      return;
    }

    try {
      const zip = new JSZip();
      
      // Convert blob URLs back to blobs and add to zip for selected icons only
      for (const name of selectedIconNames) {
        const url = generatedIcons[name];
        const iconConfig = NEXTJS_ICON_SIZES.find(icon => icon.name === name);
        
        if (url && iconConfig) {
          const response = await fetch(url);
          const blob = await response.blob();
          zip.file(iconConfig.fileName, blob);
        }
      }
      
      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const fileName = selectedIconNames.length === NEXTJS_ICON_SIZES.length 
        ? "nextjs-favicons.zip" 
        : `nextjs-favicons-selected-${selectedIconNames.length}.zip`;
      saveAs(zipBlob, fileName);
      
      toast.success(`${selectedIconNames.length} favicon(s) downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading icons:", error);
      toast.error("Failed to download icons");
    }
  };

  const toggleIconSelection = (iconName: string) => {
    setSelectedIcons(prev => ({
      ...prev,
      [iconName]: !prev[iconName]
    }));
  };

  const selectAllIcons = () => {
    const allSelected: { [key: string]: boolean } = {};
    NEXTJS_ICON_SIZES.forEach(icon => {
      allSelected[icon.name] = true;
    });
    setSelectedIcons(allSelected);
  };

  const deselectAllIcons = () => {
    const allDeselected: { [key: string]: boolean } = {};
    NEXTJS_ICON_SIZES.forEach(icon => {
      allDeselected[icon.name] = false;
    });
    setSelectedIcons(allDeselected);
  };

  const getSelectedCount = () => {
    return Object.values(selectedIcons).filter(Boolean).length;
  };

  const reset = () => {
    setSourceImage(null);
    setSourceFileName("");
    setGeneratedIcons({});
    setSelectedIcons({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
        </Link>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? "border-primary bg-accent scale-[1.02]" 
            : sourceImage 
              ? "border-primary bg-accent" 
              : "border-border hover:border-muted-foreground hover:bg-accent"
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p className="text-lg font-medium">Processing image...</p>
            <p className="text-sm text-muted-foreground mt-1">Generating Next.js favicon formats</p>
          </div>
        ) : sourceImage ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-primary mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              {sourceFileName} uploaded successfully!
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {NEXTJS_ICON_SIZES.length} Next.js favicon formats generated
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>Click to upload a different image</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-accent p-6 mb-6">
              <Upload className="h-12 w-12 text-primary" />
            </div>
            <p className="text-xl font-semibold mb-2">
              {isDragActive ? "Drop your image here" : "Upload your image for Next.js favicons"}
            </p>
            <p className="text-muted-foreground mb-2">
              Drag & drop any image here, or click to browse
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Supports PNG, JPG, GIF, WebP (max 10MB)</p>
              <p>• Any size accepted - will be automatically resized</p>
              <p>• Generates all 3 required Next.js favicon formats</p>
            </div>
          </div>
        )}
      </div>

      {/* Selection and Download Controls */}
      {Object.keys(generatedIcons).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Generated Next.js Favicons</h3>
              <p className="text-sm text-muted-foreground">
                Select the favicons you want to download ({getSelectedCount()}/{NEXTJS_ICON_SIZES.length} selected)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAllIcons}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllIcons}>
                Deselect All
              </Button>
              <Button 
                onClick={downloadSelectedIcons} 
                disabled={getSelectedCount() === 0}
                className="min-w-[120px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download ({getSelectedCount()})
              </Button>
            </div>
          </div>

          {/* Icon Grid with Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NEXTJS_ICON_SIZES.map((iconConfig) => {
              const url = generatedIcons[iconConfig.name];
              const isSelected = selectedIcons[iconConfig.name];
              
              return (
                <div 
                  key={iconConfig.name} 
                  className={`
                    relative border-2 rounded-lg p-6 transition-all cursor-pointer
                    ${isSelected 
                      ? "border-primary bg-accent" 
                      : "border-border hover:border-muted-foreground bg-card"
                    }
                  `}
                  onClick={() => toggleIconSelection(iconConfig.name)}
                >
                  {/* Checkbox */}
                  <div className="absolute top-3 right-3">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleIconSelection(iconConfig.name)}
                    />
                  </div>
                  
                  {/* Icon Preview */}
                  <div className="flex items-center justify-center mb-4" style={{ minHeight: "80px" }}>
                    {url && (
                      <img
                        src={url}
                        alt={`${iconConfig.size}x${iconConfig.size}`}
                        className="max-w-full max-h-full"
                        style={{ 
                          width: `${Math.min(iconConfig.size, 80)}px`,
                          height: `${Math.min(iconConfig.size, 80)}px`,
                          imageRendering: iconConfig.size <= 48 ? "pixelated" : "auto"
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Icon Info */}
                  <div className="text-center">
                    <p className="font-semibold text-base mb-1">{iconConfig.fileName}</p>
                    <p className="text-sm text-muted-foreground mb-1">
                      {iconConfig.size}×{iconConfig.size}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {iconConfig.format}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={reset}>
              <X className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}