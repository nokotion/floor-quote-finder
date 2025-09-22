
import tileIcon from "@/assets/categories/tile.png";
import vinylIcon from "@/assets/categories/vinyl.png";
import hardwoodIcon from "@/assets/categories/hardwood.png";
import laminateIcon from "@/assets/categories/laminate.png";
import carpetIcon from "@/assets/categories/carpet.png";
import sportsIcon from "@/assets/categories/sports.png";

export const flooringTypes = [
  { name: "Tile", icon: tileIcon, description: "Ceramic, porcelain, and natural stone" },
  { name: "Vinyl", icon: vinylIcon, description: "Luxury vinyl plank and sheet vinyl" },
  { name: "Hardwood", icon: hardwoodIcon, description: "Solid and engineered hardwood floors" },
  { name: "Laminate", icon: laminateIcon, description: "Durable and affordable wood-look floors" },
  { name: "Carpet", icon: carpetIcon, description: "Soft and comfortable floor coverings" },
  { name: "Sports", icon: sportsIcon, description: "Athletic and commercial sport flooring" }
];

export const projectSizes = [
  { value: "0-100", label: "0–100 sq ft" },
  { value: "100-500", label: "100–500 sq ft" },
  { value: "500-1000", label: "500–1,000 sq ft" },
  { value: "1000-5000", label: "1,000–5,000 sq ft" },
  { value: "5000+", label: "5,000+ sq ft" }
];

export const SQFT_TIERS = [
  { value: '0-100', label: '0–100 sq ft', basePrice: 1.00 },
  { value: '100-500', label: '100–500 sq ft', basePrice: 1.25 },
  { value: '500-1000', label: '500–1,000 sq ft', basePrice: 2.50 },
  { value: '1000-5000', label: '1,000–5,000 sq ft', basePrice: 3.50 },
  { value: '5000+', label: '5,000+ sq ft', basePrice: 5.00 }
];
