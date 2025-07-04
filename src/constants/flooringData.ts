
import tileIcon from "@/assets/categories/tile.png";
import vinylIcon from "@/assets/categories/vinyl.png";
import hardwoodIcon from "@/assets/categories/hardwood.png";
import laminateIcon from "@/assets/categories/laminate.png";
import carpetIcon from "@/assets/categories/carpet.png";

export const flooringTypes = [
  { name: "Tile", icon: tileIcon, description: "Ceramic, porcelain, and natural stone" },
  { name: "Vinyl", icon: vinylIcon, description: "Luxury vinyl plank and sheet vinyl" },
  { name: "Hardwood", icon: hardwoodIcon, description: "Solid and engineered hardwood floors" },
  { name: "Laminate", icon: laminateIcon, description: "Durable and affordable wood-look floors" },
  { name: "Carpet", icon: carpetIcon, description: "Soft and comfortable floor coverings" }
];

export const projectSizes = [
  { value: "100-less", label: "100 and less" },
  { value: "100-500", label: "100–500" },
  { value: "500-1000", label: "500–1,000" },
  { value: "1000-5000", label: "1,000–5,000" },
  { value: "5000+", label: "5,000+" }
];
