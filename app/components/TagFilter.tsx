"use client";

interface Tag {
  id: number;
  name: string;
  count: number;
}

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 sm:px-6 py-3">
      <button
        onClick={() => onSelectTag(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedTag === null
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onSelectTag(tag.name)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedTag === tag.name
              ? "bg-violet-600 text-white"
              : "bg-violet-50 text-violet-700 hover:bg-violet-100"
          }`}
        >
          {tag.name}
          <span className="ml-1 opacity-60">({tag.count})</span>
        </button>
      ))}
    </div>
  );
}
