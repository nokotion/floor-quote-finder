
"use client";

import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import tileIcon from "@/assets/categories/tile.png";
import vinylIcon from "@/assets/categories/vinyl.png";
import hardwoodIcon from "@/assets/categories/hardwood.png";
import laminateIcon from "@/assets/categories/laminate.png";
import carpetIcon from "@/assets/categories/carpet.png";
import sportsIcon from "@/assets/categories/sports.png";

interface FlooringCategoriesProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const categories = [
  {
    id: "all",
    icon: <Home className="text-accent size-6" />,
    title: "All",
    description: "Browse all flooring brands and options",
  },
  {
    id: "tile",
    icon: <img src={tileIcon} alt="Tile" className="w-6 h-6" />,
    title: "Tile",
    description: "Ceramic, porcelain, and natural stone",
  },
  {
    id: "vinyl",
    icon: <img src={vinylIcon} alt="Vinyl" className="w-6 h-6" />,
    title: "Vinyl",
    description: "Luxury vinyl plank and sheet options",
  },
  {
    id: "hardwood",
    icon: <img src={hardwoodIcon} alt="Hardwood" className="w-6 h-6" />,
    title: "Hardwood",
    description: "Premium hardwood flooring options",
  },
  {
    id: "laminate",
    icon: <img src={laminateIcon} alt="Laminate" className="w-6 h-6" />,
    title: "Laminate",
    description: "Durable and affordable wood-look floors",
  },
  {
    id: "carpet",
    icon: <img src={carpetIcon} alt="Carpet" className="w-6 h-6" />,
    title: "Carpet",
    description: "Soft and comfortable floor coverings",
  },
  {
    id: "sports",
    icon: <img src={sportsIcon} alt="Sports" className="w-6 h-6" />,
    title: "Sports",
    description: "Performance flooring for gyms and sports areas",
  },
];

export default function FlooringCategories({ selectedCategory, onCategorySelect }: FlooringCategoriesProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-6">
      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => onCategorySelect(cat.id)}
          className={cn(
            "group relative flex cursor-pointer flex-col items-start rounded-lg border border-border bg-background p-3 max-w-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-sm hover:border-accent hover:bg-muted/50 grayscale hover:grayscale-0",
            selectedCategory === cat.id && "ring-2 ring-accent bg-accent/10 grayscale-0 border-accent"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            {cat.icon}
            <h3 className={cn(
              "text-base font-medium",
              selectedCategory === cat.id ? "text-accent" : ""
            )}>{cat.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground sm:hidden">{cat.description}</p>
        </div>
      ))}
    </div>
  );
}
