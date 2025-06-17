import React, { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle, File } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface FileImportProps {
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: () => void;
  acceptedExtensions: string[];
  acceptedTypes: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

const FileImport: React.FC<FileImportProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedExtensions,
  acceptedTypes,
  maxFileSize = 10,
  className = "",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const isValidType =
      acceptedTypes.includes(file.type) ||
      acceptedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      return `Please select a valid Excel file (${acceptedExtensions.join(
        ", "
      )})`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxFileSize) {
      return `Each file size must be less than ${maxFileSize}MB`;
    }

    return null;
  };

  const handleFileSelection = (files: File[]) => {
    var errorCount = 0;

    const validationError = files.map((file) => {
      if (validateFile(file)) {
        errorCount++;
      }
      return validateFile(file);
    });

    const error =
      errorCount > 0
        ? validationError.filter((val) => val !== null).join("\n")
        : null;

    if (error) {
      setError(error);
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(files);
    onFileSelect?.(files);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files;

    if (!files) {
      toast.info("Select file");
      return;
    }

    const uploadFile = Object.values(files);

    if (files && files.length > 0) {
      handleFileSelection(uploadFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    onFileRemove?.();
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card className="w-full">
        <CardContent className="p-6">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Select the file"
            multiple
          />

          {/* Upload Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${
                isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }
              ${
                selectedFile
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : ""
              }
            `}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <File className="h-12 w-12 text-green-600" />
                </div>
                <div className="grid grid-cols-1">
                  {selectedFile &&
                    selectedFile.length > 0 &&
                    selectedFile.map((file) => (
                      <div className="space-y-2">
                        <p className="font-medium text-green-800 dark:text-green-200">
                          {file.name}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Upload
                    className={`h-12 w-12 ${
                      isDragOver ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {isDragOver ? "Drop your file here" : "Import File"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Supports {acceptedExtensions.join(", ")} files up to{" "}
                    {maxFileSize}MB
                  </p>
                </div>
                <Button variant="outline" className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {selectedFile && !error && (
            <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-950/20">
              <File className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                File imported successfully! Ready to process.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileImport;
