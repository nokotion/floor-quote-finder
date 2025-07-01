
"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  LayoutPanelTop,
  Ruler,
  Trees,
  Sparkles,
  Sofa,
  Dribbble,
} from "lucide-react";

interface FlooringCategoriesProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const categories = [
  {
    id: "all",
    icon: <Home className="text-blue-500 size-6" />,
    title: "All",
    description: "Browse all flooring brands and options",
  },
  {
    id: "tile",
    icon: <LayoutPanelTop className="text-gray-600 size-6" />,
    title: "Tile",
    description: "Ceramic, porcelain, and natural stone",
  },
  {
    id: "vinyl",
    icon: <Ruler className="text-green-600 size-6" />,
    title: "Vinyl",
    description: "Luxury vinyl plank and sheet options",
  },
  {
    id: "hardwood",
    icon: <Trees className="text-amber-700 size-6" />,
    title: "Hardwood",
    description: "Premium hardwood flooring options",
  },
  {
    id: "laminate",
    icon: <Sparkles className="text-yellow-400 size-6" />,
    title: "Laminate",
    description: "Durable and affordable wood-look floors",
  },
  {
    id: "carpet",
    icon: <Sofa className="text-pink-500 size-6" />,
    title: "Carpet",
    description: "Soft and comfortable floor coverings",
  },
  {
    id: "sports",
    icon: <Dribbble className="text-orange-500 size-6" />,
    title: "Sports",
    description: "Performance flooring for gyms and sports areas",
  },
];

export default function FlooringCategories({ selectedCategory, onCategorySelect }: FlooringCategoriesProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 px-4 py-10">
      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => onCategorySelect(cat.id)}
          className={cn(
            "group relative flex h-40 cursor-pointer flex-col justify-between rounded-xl border border-border bg-background p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-md hover:border-primary hover:bg-muted/50 grayscale hover:grayscale-0",
            selectedCategory === cat.id && "ring-2 ring-blue-500 bg-blue-50/70 grayscale-0 border-blue-500"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-muted p-2">{cat.icon}</div>
            <h3 className={cn(
              "text-lg font-semibold",
              selectedCategory === cat.id ? "text-blue-600" : ""
            )}>{cat.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{cat.description}</p>
        </div>
      ))}
    </div>
  );
}
