import { FileText, File, Image as ImageIcon } from "lucide-react";

interface FileIconProps {
  mimeType: string;
  className?: string;
}

export default function FileIcon({ mimeType, className = "w-6 h-6" }: FileIconProps) {
  // Image files
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className={`${className} text-teal-600`} />;
  }

  // PDF files
  if (mimeType === "application/pdf") {
    return <FileText className={`${className} text-red-600`} />;
  }

  // Word documents
  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FileText className={`${className} text-blue-600`} />;
  }

  // Excel spreadsheets
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return <FileText className={`${className} text-green-600`} />;
  }

  // Text files
  if (mimeType === "text/plain") {
    return <FileText className={`${className} text-gray-600`} />;
  }

  // Default for unknown types
  return <File className={`${className} text-gray-500`} />;
}
