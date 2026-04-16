"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import TagFilter from "./components/TagFilter";
import ImageGrid from "./components/ImageGrid";
import UploadModal from "./components/UploadModal";

interface ImageData {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  tags: string[];
}

interface Tag {
  id: number;
  name: string;
  count: number;
}

export default function Home() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchImages = useCallback(async () => {
    const url = selectedTag
      ? `/api/images?tag=${encodeURIComponent(selectedTag)}`
      : "/api/images";
    const res = await fetch(url);
    const data = await res.json();
    setImages(data);
  }, [selectedTag]);

  const fetchTags = async () => {
    const res = await fetch("/api/tags");
    const data = await res.json();
    setTags(data);
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/images/${id}`, { method: "DELETE" });
    fetchImages();
    fetchTags();
  };

  const handleTagUpdate = async (id: number, newTags: string[]) => {
    await fetch(`/api/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags }),
    });
    fetchImages();
    fetchTags();
  };

  const handleUploadComplete = () => {
    fetchImages();
    fetchTags();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onUploadClick={() => setUploadOpen(true)} imageCount={images.length} />

      <main className="max-w-7xl mx-auto">
        <TagFilter tags={tags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
        <ImageGrid images={images} onDelete={handleDelete} onTagUpdate={handleTagUpdate} />
      </main>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
