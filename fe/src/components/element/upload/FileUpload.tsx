"use client";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/element/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Check, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { uploadFile } from "@/api/upload.api";

interface FileUploadProps {
  label?: string;
  accept?: string; // "image/*,application/pdf"
  onChange?: (file: string | null) => void;
  preview?: boolean;
}

export function FileUpload({
  label = "Upload file",
  accept = "image/*",
  onChange,
  preview = true,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);

    if (preview && selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleChoose = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // cleanup memory khi unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUpload = async () => {
    // Implement upload logic here
    try {
      setIsUploading(true);
      const imageData = await uploadFile(file as File);
      onChange?.(imageData.url);
      setUploaded(true);
      setIsUploading(false);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>

      <div
        className={clsx(
          "flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 transition-colors",
          previewUrl && "flex-col sm:flex-row sm:items-center"
        )}
      >
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />

        {!file ? (
          <Button
            type="button"
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Select file
          </Button>
        ) : (
          <div className="flex items-center gap-3 w-full justify-between">
            {previewUrl ? (
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-sm truncate">{file.name}</p>
              </div>
            ) : (
              <p className="text-sm">{file.name}</p>
            )}

            {!uploaded ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" /> Clear
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={isUploading || uploaded}
                  isLoading={isUploading}
                >
                  <Check className="w-4 h-4 text-green-500" /> Upload
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={handleChoose}>
                <RefreshCw className="w-4 h-4 text-purple-500 mr-2" /> Change
                File
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
