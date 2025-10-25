"use client";

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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function HeaderMenu({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => router.push("/statistics")}
          className={pathname === "/statistics" ? "bg-gray-100" : ""}
        >
          <BarChart className="mr-2 h-4 w-4" />
          <span>Statistics</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/history")}
          className={pathname === "/history" ? "bg-gray-100" : ""}
        >
          <History className="mr-2 h-4 w-4" />
          <span>History</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/reminders")}
          className={pathname === "/reminders" ? "bg-gray-100" : ""}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Reminder Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className={pathname === "/profile" ? "bg-gray-100" : ""}
        >
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
