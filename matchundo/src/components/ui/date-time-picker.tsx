"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";

interface DateTimePickerProps {
  value: string; // Format: YYYY-MM-DDTHH:MM
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  error,
  placeholder = "Select date and time",
  className
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current YYYY-MM-DDTHH:MM value to components
  let currentDate: Date | undefined = undefined;
  let hourStr = "19"; // Default to 7 PM
  let minStr = "00";

  if (value) {
    try {
      const parts = value.split("T");
      if (parts.length === 2) {
        const dateParts = parts[0].split("-");
        const timeParts = parts[1].split(":");
        if (dateParts.length === 3 && timeParts.length === 2) {
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const day = parseInt(dateParts[2], 10);
           currentDate = new Date(year, month, day);
          hourStr = timeParts[0].padStart(2, "0");
          minStr = timeParts[1].padStart(2, "0");
        }
      }
    } catch (e) {
      console.error("Error parsing datetime string:", e);
    }
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const yearStr = date.getFullYear().toString();
    const monthStr = (date.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = date.getDate().toString().padStart(2, "0");
    
    // Combine back to ISO-like local datetime
    const newValue = `${yearStr}-${monthStr}-${dayStr}T${hourStr}:${minStr}`;
    onChange(newValue);
  };

  // Handle hour selection
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    const dateStr = value ? value.split("T")[0] : format(new Date(), "yyyy-MM-dd");
    const newValue = `${dateStr}T${newHour}:${minStr}`;
    onChange(newValue);
  };

  // Handle minute selection
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMin = e.target.value;
    const dateStr = value ? value.split("T")[0] : format(new Date(), "yyyy-MM-dd");
    const newValue = `${dateStr}T${hourStr}:${newMin}`;
    onChange(newValue);
  };

  // Generate selection lists
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  // Format label to display on the button
  const displayLabel = () => {
    if (!value || !currentDate) return placeholder;
    try {
      return `${format(currentDate, "PPP")} at ${hourStr}:${minStr}`;
    } catch {
      return placeholder;
    }
  };

  return (
    <div className={`relative w-full ${className || ""}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={`w-full justify-start text-left font-normal text-xs h-9 bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 ${
              value ? "text-zinc-200" : ""
            } ${error ? "border-red-900/50 focus:ring-red-950" : ""}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500 shrink-0" />
            <span className="truncate">{displayLabel()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-zinc-900 bg-zinc-950" align="start">
          <div className="rdp-custom p-3 select-none">
            <DayPicker
              mode="single"
              selected={currentDate}
              onSelect={handleDateSelect}
            />
          </div>
          
          {/* Time Selector Footer */}
          <div className="flex items-center justify-between p-3 border-t border-zinc-900 bg-zinc-950/60 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span>Time</span>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Hour Dropdown */}
              <select
                value={hourStr}
                onChange={handleHourChange}
                className="bg-zinc-950 border border-zinc-900 rounded px-1.5 py-1 text-xs text-white outline-none focus:border-zinc-800"
              >
                {hours.map((h) => (
                  <option key={h} value={h} className="bg-zinc-950 text-white">
                    {h}
                  </option>
                ))}
              </select>
              
              <span className="text-zinc-650 font-bold">:</span>
              
              {/* Minute Dropdown */}
              <select
                value={minStr}
                onChange={handleMinuteChange}
                className="bg-zinc-950 border border-zinc-900 rounded px-1.5 py-1 text-xs text-white outline-none focus:border-zinc-800"
              >
                {minutes.map((m) => (
                  <option key={m} value={m} className="bg-zinc-950 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
