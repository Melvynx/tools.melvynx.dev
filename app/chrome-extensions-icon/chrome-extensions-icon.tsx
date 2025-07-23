"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, X, ArrowLeft, Image, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface IconSize {
  name: string;
  size: number;
}

const CHROME_ICON_SIZES: IconSize[] = [
  { name: "icon16", size: 16 },
  { name: "icon32", size: 32 },
  { name: "icon48", size: 48 },
  { name: "icon64", size: 64 },
  { name: "icon128", size: 128 },
  { name: "icon256", size: 256 },
];

export function ChromeExtensionsIcon() {
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
      CHROME_ICON_SIZES.forEach(size => {
        allSelected[size.name] = true;
      });
      setSelectedIcons(allSelected);

      toast.success("Icons generated successfully!");
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
    for (const iconSize of CHROME_ICON_SIZES) {
      const canvas = await resizeImage(img, iconSize.size, iconSize.size);
      const blob = await canvasToBlob(canvas);
      icons[iconSize.name] = URL.createObjectURL(blob);
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
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
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
        if (url) {
          const response = await fetch(url);
          const blob = await response.blob();
          zip.file(`${name}.png`, blob);
        }
      }
      
      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const fileName = selectedIconNames.length === CHROME_ICON_SIZES.length 
        ? "chrome-extension-icons.zip" 
        : `chrome-extension-icons-selected-${selectedIconNames.length}.zip`;
      saveAs(zipBlob, fileName);
      
      toast.success(`${selectedIconNames.length} icon(s) downloaded successfully!`);
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
    CHROME_ICON_SIZES.forEach(size => {
      allSelected[size.name] = true;
    });
    setSelectedIcons(allSelected);
  };

  const deselectAllIcons = () => {
    const allDeselected: { [key: string]: boolean } = {};
    CHROME_ICON_SIZES.forEach(size => {
      allDeselected[size.name] = false;
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
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 scale-[1.02]" 
            : sourceImage 
              ? "border-green-500 bg-green-50 dark:bg-green-950/50" 
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-950/50"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
            <p className="text-lg font-medium">Processing image...</p>
            <p className="text-sm text-gray-500 mt-1">Generating all icon sizes</p>
          </div>
        ) : sourceImage ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
              {sourceFileName} uploaded successfully!
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {CHROME_ICON_SIZES.length} icon sizes generated
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Image className="h-4 w-4" />
              <span>Click to upload a different image</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-6 mb-6">
              <Upload className="h-12 w-12 text-blue-500" />
            </div>
            <p className="text-xl font-semibold mb-2">
              {isDragActive ? "Drop your image here" : "Upload your Chrome extension icon"}
            </p>
            <p className="text-gray-500 mb-2">
              Drag & drop an image here, or click to browse
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Supports PNG, JPG, GIF, WebP (max 10MB)</p>
              <p>• Recommended: 512×512 pixels for best quality</p>
              <p>• Generates all required Chrome extension sizes</p>
            </div>
          </div>
        )}
      </div>

      {/* Selection and Download Controls */}
      {Object.keys(generatedIcons).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Generated Icons</h3>
              <p className="text-sm text-gray-500">
                Select the icons you want to download ({getSelectedCount()}/{CHROME_ICON_SIZES.length} selected)
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CHROME_ICON_SIZES.map((iconSize) => {
              const url = generatedIcons[iconSize.name];
              const isSelected = selectedIcons[iconSize.name];
              
              return (
                <div 
                  key={iconSize.name} 
                  className={`
                    relative border-2 rounded-lg p-4 transition-all cursor-pointer
                    ${isSelected 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50" 
                      : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-900"
                    }
                  `}
                  onClick={() => toggleIconSelection(iconSize.name)}
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 right-2">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleIconSelection(iconSize.name)}
                    />
                  </div>
                  
                  {/* Icon Preview */}
                  <div className="flex items-center justify-center mb-3" style={{ minHeight: "64px" }}>
                    {url && (
                      <img
                        src={url}
                        alt={`${iconSize.size}x${iconSize.size}`}
                        className="max-w-full max-h-full"
                        style={{ 
                          width: `${Math.min(iconSize.size, 64)}px`,
                          height: `${Math.min(iconSize.size, 64)}px`,
                          imageRendering: iconSize.size <= 32 ? "pixelated" : "auto"
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Icon Info */}
                  <div className="text-center">
                    <p className="font-medium text-sm">{iconSize.size}×{iconSize.size}</p>
                    <p className="text-xs text-gray-500">{iconSize.name}.png</p>
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