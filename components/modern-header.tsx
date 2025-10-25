"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  History,
  Settings,
  Menu,
  User,
  LogOut,
  Edit,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ModernHeader({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: User },
    { name: "Statistics", href: "/statistics", icon: BarChart },
    { name: "History", href: "/history", icon: History },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">👁️</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                LucidEye
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/50"
                      : "text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle - hidden on mobile */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* User menu for desktop */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">
                      {user?.email?.split("@")[0] || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className={
                      isActive("/profile") ? "bg-gray-100 dark:bg-gray-800" : ""
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/reminders")}
                    className={
                      isActive("/reminders")
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Reminder Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/50"
                      : "text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              );
            })}

            {/* Mobile theme toggle */}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-gray-700 dark:text-gray-300">Theme</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Mobile user actions */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  router.push("/profile");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400"
              >
                <Edit className="h-5 w-5 mr-3" />
                Edit Profile
              </button>
              <button
                onClick={() => {
                  router.push("/reminders");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400"
              >
                <Settings className="h-5 w-5 mr-3" />
                Reminder Settings
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
