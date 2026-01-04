"use client";

import { Download } from "lucide-react";
import FileIcon from "./file-icon";

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

  return (
    <div className="space-y-2">
      {/* All Attachments - Display as file links */}
      {attachments.map((file, index) => (
        <a
          key={index}
          href={file.url}
          download={file.name}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            variant === "user"
              ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
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
  );
}
