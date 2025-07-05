
import { Zap, Search } from "lucide-react";

interface TabSwitcherProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  return (
    <div className="flex justify-center mb-2 px-2">
      <div className="inline-flex bg-gray-100 rounded-xl p-1 sm:p-2 shadow-xl border border-gray-200 w-full max-w-2xl">
        <button
          onClick={() => onTabChange("quick")}
          className={`flex items-center justify-center gap-2 flex-1 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all duration-300 relative ${
            activeTab === "quick"
              ? "bg-accent text-accent-foreground shadow-xl transform scale-[1.02] sm:scale-105"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/60 hover:shadow-md"
          }`}
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">I Know What I Want</span>
          <span className="sm:hidden">Quick Quote</span>
        </button>
        <button
          onClick={() => onTabChange("explore")}
          className={`flex items-center justify-center gap-2 flex-1 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all duration-300 relative ${
            activeTab === "explore"
              ? "bg-primary text-primary-foreground shadow-xl transform scale-[1.02] sm:scale-105"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/60 hover:shadow-md"
          }`}
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Help Me Explore</span>
          <span className="sm:hidden">Explore</span>
        </button>
      </div>
    </div>
  );
};
