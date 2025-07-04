
import { Zap, Search } from "lucide-react";

interface TabSwitcherProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  return (
    <div className="flex justify-center mb-2">
      <div className="inline-flex bg-gray-100 rounded-xl p-2 shadow-xl border border-gray-200">
        <button
          onClick={() => onTabChange("quick")}
          className={`flex items-center gap-3 px-12 py-6 rounded-xl font-bold text-lg transition-all duration-300 relative ${
            activeTab === "quick"
              ? "bg-accent text-accent-foreground shadow-xl transform scale-105"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/60 hover:shadow-md"
          }`}
        >
          <Zap className="w-5 h-5" />
          I Know What I Want
        </button>
        <button
          onClick={() => onTabChange("explore")}
          className={`flex items-center gap-3 px-12 py-6 rounded-xl font-bold text-lg transition-all duration-300 relative ${
            activeTab === "explore"
              ? "bg-primary text-primary-foreground shadow-xl transform scale-105"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/60 hover:shadow-md"
          }`}
        >
          <Search className="w-5 h-5" />
          Help Me Explore
        </button>
      </div>
    </div>
  );
};
