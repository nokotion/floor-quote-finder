
"use client";

import { cn } from "@/lib/utils";

interface FlooringCategoriesProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const categories = [
  {
    id: "all",
    title: "All",
  },
  {
    id: "vinyl",
    title: "Vinyl",
  },
  {
    id: "laminate",
    title: "Laminate",
  },
  {
    id: "hardwood",
    title: "Hardwood",
  },
  {
    id: "tile",
    title: "Tile",
  },
  {
    id: "commercial",
    title: "Commercial",
  },
  {
    id: "carpet",
    title: "Carpet",
  },
];

export default function FlooringCategories({ selectedCategory, onCategorySelect }: FlooringCategoriesProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategorySelect(cat.id)}
          className={cn(
            "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 border",
            selectedCategory === cat.id 
              ? "bg-accent text-accent-foreground border-accent shadow-sm" 
              : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          )}
        >
          {cat.title}
        </button>
      ))}
    </div>
  );
}
