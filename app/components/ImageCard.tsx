"use client";

import { useState } from "react";

interface ImageData {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  tags: string[];
}

interface ImageCardProps {
  image: ImageData;
  onDelete: (id: number) => void;
  onTagUpdate: (id: number, tags: string[]) => void;
}

export default function ImageCard({ image, onDelete, onTagUpdate }: ImageCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tagInput, setTagInput] = useState(image.tags.join(", "));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "Z");
    return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = `/api/download/${image.id}`;
    a.download = image.original_name;
    a.click();
  };

  const handleSaveTags = () => {
    const tags = tagInput.split(",").map(t => t.trim()).filter(Boolean);
    onTagUpdate(image.id, tags);
    setEditing(false);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-gray-50">
        <img
          src={`/uploads/${image.filename}`}
          alt={image.original_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        {/* Action buttons on hover */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDownload}
            className="w-9 h-9 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            title="Download"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {showMenu && (
          <div className="absolute top-12 right-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
            <button
              onClick={() => { setEditing(true); setShowMenu(false); }}
              className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Edit Tags
            </button>
            <button
              onClick={() => { onDelete(image.id); setShowMenu(false); }}
              className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate" title={image.original_name}>
          {image.original_name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatSize(image.size)} · {formatDate(image.created_at)}
        </p>

        {editing ? (
          <div className="mt-2 flex gap-1">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="tag1, tag2"
              className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              onKeyDown={(e) => e.key === "Enter" && handleSaveTags()}
              autoFocus
            />
            <button onClick={handleSaveTags} className="text-xs px-2 py-1 bg-violet-500 text-white rounded-lg">
              Save
            </button>
          </div>
        ) : (
          image.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {image.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
