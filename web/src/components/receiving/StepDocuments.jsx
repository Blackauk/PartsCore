// Step 2: Documents - Attach proof, photos, signature

import { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';

export default function StepDocuments({ documents, onChange }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const files = documents.files || [];

  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files || []);
    const newDocs = selectedFiles.map((file) => ({
      id: `DOC-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      fileName: file.name,
      sizeKB: Math.round(file.size / 1024),
      type: file.type,
      uploadedAt: new Date().toISOString(),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    onChange({ ...documents, files: [...files, ...newDocs] });
    if (e.target) e.target.value = '';
  }

  function removeDoc(id) {
    const doc = files.find((d) => d.id === id);
    if (doc?.preview) URL.revokeObjectURL(doc.preview);
    onChange({ ...documents, files: files.filter((d) => d.id !== id) });
  }

  function handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      handleFileSelect({ target: { files } });
    }
  }

  return (
    <div className="space-y-4">
      {/* Delivery Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Delivery Note No</label>
          <input
            type="text"
            className="input w-full"
            value={documents.deliveryNoteNo || ''}
            onChange={(e) => onChange({ ...documents, deliveryNoteNo: e.target.value })}
            placeholder="DN-12345"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Carrier (optional)</label>
          <input
            type="text"
            className="input w-full"
            value={documents.carrier || ''}
            onChange={(e) => onChange({ ...documents, carrier: e.target.value })}
            placeholder="FedEx, DHL, etc."
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Tracking No (optional)</label>
          <input
            type="text"
            className="input w-full"
            value={documents.trackingNo || ''}
            onChange={(e) => onChange({ ...documents, trackingNo: e.target.value })}
            placeholder="1Z999AA10123456784"
          />
        </div>
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Attachments</label>
        <div
          className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-600 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="mx-auto h-12 w-12 text-zinc-500 mb-3" />
          <p className="text-sm text-zinc-400 mb-4">
            Drag & drop files here, or click to browse
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              className="btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              Browse Files
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera size={16} />
              Take Photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-xs text-zinc-500 mt-2">
            Accepts: Images (JPG, PNG) and PDFs
          </p>
        </div>
      </div>

      {/* Thumbnails */}
      {files && files.length > 0 && (
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Attached Files ({files.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((doc) => (
              <div
                key={doc.id}
                className="relative border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900"
              >
                {doc.preview ? (
                  <img
                    src={doc.preview}
                    alt={doc.fileName}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-zinc-800">
                    <span className="text-xs text-zinc-500">PDF</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeDoc(doc.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded text-white"
                  title="Remove"
                >
                  <X size={14} />
                </button>
                <div className="p-2">
                  <p className="text-xs text-zinc-300 truncate" title={doc.fileName}>
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-zinc-500">{doc.sizeKB} KB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature (optional) */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          Signature (optional)
        </label>
        <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
          <textarea
            className="w-full input min-h-[100px]"
            placeholder="Received by signature or name..."
            value={documents.signature || ''}
            onChange={(e) => onChange({ ...documents, signature: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

