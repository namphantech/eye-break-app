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
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Image from "next/image";
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
    { name: "Report", href: "/report", icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="relative  from-teal-50/80  dark:bg-[#0E1815]/90  border-b border-[#C8E1DB] sticky top-0 z-50 w-full overflow-hidden backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left-aligned navigation content */}
        <div className="flex justify-between items-center h-16">
          {/* Logo on the left */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-full bg-[#359D7D] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">👁️</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
                LucidEye
              </span>
            </Link>
          </div>

          {/* Right side actions - Report, Theme, Profile */}
          <div className="flex items-center space-x-2">
            {/* Report icon */}
            <button
              onClick={() => router.push("/report")}
              className="p-2 rounded-full hover:bg-[#359D7D]/20 text-gray-800 dark:text-white"
              title="Report"
            >
              <BarChart3 className="h-5 w-5" />
            </button>

            {/* Theme toggle icon */}
            <div className="p-2 rounded-full hover:bg-[#359D7D]/20 text-gray-800 dark:text-white cursor-pointer">
              <ThemeToggle />
            </div>

            {/* Profile icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-[#359D7D]/20 text-gray-800 dark:text-white">
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-gray-800 border border-[#C8E1DB] dark:border-gray-700"
              >
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="text-gray-800 dark:text-white hover:bg-[#359D7D]/20"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/reminders")}
                  className="text-gray-800 dark:text-white hover:bg-[#359D7D]/20"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Reminder Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-gray-800 dark:text-white hover:bg-[#359D7D]/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
