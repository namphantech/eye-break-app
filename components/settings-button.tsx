"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import ReminderToggle from "@/components/reminder-toggle";

export default function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4">
          <h3 className="font-medium mb-2">Reminder Settings</h3>
          <ReminderToggle />
        </div>
        <DropdownMenuItem
          className="justify-center text-xs text-gray-500 py-2"
          onSelect={(e) => e.preventDefault()}
        >
          Click "Trigger Now" to send a reminder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
