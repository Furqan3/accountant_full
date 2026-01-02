"use client";

import { Download } from "lucide-react";
import FileIcon from "./file-icon";
import Image from "next/image";

interface Attachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

interface AttachmentDisplayProps {
  attachments: Attachment[];
  variant?: "user" | "admin";
  onImageClick?: (images: Array<{ url: string; name: string }>, index: number) => void;
}

export default function AttachmentDisplay({
  attachments,
  variant = "user",
  onImageClick,
}: AttachmentDisplayProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const images = attachments.filter((att) => att.type.startsWith("image/"));
  const files = attachments.filter((att) => !att.type.startsWith("image/"));

  const handleImageClick = (imageIndex: number) => {
    if (onImageClick) {
      const imageData = images.map((img) => ({ url: img.url, name: img.name }));
      onImageClick(imageData, imageIndex);
    }
  };

  return (
    <div className="space-y-2">
      {/* Image Attachments */}
      {images.length > 0 && (
        <div
          className={`grid gap-2 ${
            images.length === 1
              ? "grid-cols-1"
              : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-teal-600 transition-colors"
              onClick={() => handleImageClick(index)}
            >
              <Image
                src={image.url}
                alt={image.name}
                width={300}
                height={300}
                className="w-full h-auto object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                  Click to view
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Attachments */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <a
              key={index}
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                variant === "user"
                  ? "border-teal-600/20 bg-teal-600/5 hover:bg-teal-600/10"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <FileIcon mimeType={file.type} className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <Download className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
