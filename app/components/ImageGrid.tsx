"use client";

import ImageCard from "./ImageCard";

interface ImageData {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  tags: string[];
}

interface ImageGridProps {
  images: ImageData[];
  onDelete: (id: number) => void;
  onTagUpdate: (id: number, tags: string[]) => void;
}

export default function ImageGrid({ images, onDelete, onTagUpdate }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <svg className="w-20 h-20 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-400 text-lg font-medium">No images yet</p>
        <p className="text-gray-300 text-sm mt-1">Upload your first image to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-6 py-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onDelete={onDelete}
          onTagUpdate={onTagUpdate}
        />
      ))}
    </div>
  );
}
