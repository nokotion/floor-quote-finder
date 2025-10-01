import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Store, 
  Mail, 
  FileText, 
  Settings, 
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Retailers", path: "/admin/retailers", icon: Store },
  { name: "Leads", path: "/admin/leads", icon: Mail },
  { name: "Applications", path: "/admin/applications", icon: FileText },
  { name: "Settings", path: "/admin/settings", icon: Settings },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
];

const AdminTabs = () => {
  return (
    <div className="bg-background border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto" aria-label="Admin navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminTabs;
