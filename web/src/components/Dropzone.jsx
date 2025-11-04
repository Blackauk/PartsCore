import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText } from 'lucide-react';

export default function Dropzone({ 
  files = [], 
  onFilesChange, 
  maxFiles = 10,
  accept = 'image/*,application/pdf',
  className = '',
  inputRef = null
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const internalInputRef = useRef(null);
  const fileInputRef = inputRef || internalInputRef;

  const processFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).slice(0, maxFiles - files.length);
    if (newFiles.length === 0) return;

    // Simulate upload with progress
    setUploading(true);
    const processedFiles = newFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      progress: 0,
    }));

    // Add files immediately with 0 progress
    const currentFiles = [...files, ...processedFiles];
    onFilesChange(currentFiles);

    // Simulate upload progress for each file
    processedFiles.forEach((processedFile) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onFilesChange((prevFiles) =>
          prevFiles.map((f) =>
            f.id === processedFile.id ? { ...f, progress } : f
          )
        );
        
        if (progress >= 100) {
          clearInterval(interval);
          setUploading((prev) => {
            const allDone = !processedFiles.some((pf) => {
              const current = currentFiles.find((f) => f.id === pf.id);
              return current && current.progress < 100;
            });
            return !allDone;
          });
        }
      }, 50);
    });
  }, [files, maxFiles, onFilesChange]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const fileList = e.dataTransfer.files;
    processFiles(fileList);
  }, [processFiles]);

  const handleFileSelect = useCallback((e) => {
    const fileList = e.target.files;
    processFiles(fileList);
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items;
    const fileList = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
          fileList.push(file);
        }
      }
    }
    
    if (fileList.length > 0) {
      e.preventDefault();
      processFiles(fileList);
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId) => {
    const updatedFiles = files.filter((f) => f.id !== fileId);
    // Revoke object URL to free memory
    const fileToRemove = files.find((f) => f.id === fileId);
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div 
      className={className}
      onPaste={handlePaste}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
        <div className="text-sm text-zinc-300 mb-1">
          Click to select, drag & drop, or paste (Ctrl+V)
        </div>
        <div className="text-xs text-zinc-500">
          Images and PDFs accepted
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-2 bg-zinc-800 rounded border border-zinc-700"
            >
              <div className="text-zinc-400">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-200 truncate">{file.name}</div>
                <div className="text-xs text-zinc-500">{formatFileSize(file.size)}</div>
                {file.progress < 100 && (
                  <div className="mt-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

