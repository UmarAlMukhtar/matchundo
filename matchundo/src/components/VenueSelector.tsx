"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { VenueInfo } from "@/lib/venue";

interface VenueSelectorProps {
  venues: VenueInfo[];
  value: string;
  onChange: (value: string) => void;
  onSelectVenue: (venue: VenueInfo) => void;
  placeholder?: string;
}

export function VenueSelector({
  venues,
  value,
  onChange,
  onSelectVenue,
  placeholder = "Search or enter venue..."
}: VenueSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [prevValue, setPrevValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive filtered list on render
  const query = value.trim().toLowerCase();
  const filtered = query
    ? venues
        .filter((v) => v.venueName.toLowerCase().includes(query))
        .slice(0, 10)
    : venues.slice(0, 10);

  // Reset activeIndex when the search value changes
  if (value !== prevValue) {
    setPrevValue(value);
    setActiveIndex(-1);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        const selected = filtered[activeIndex];
        onChange(selected.venueName);
        onSelectVenue(selected);
        setIsOpen(false);
      } else {
        // Just let Enter submit or close if typing custom
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelect = (venue: VenueInfo) => {
    onChange(venue.venueName);
    onSelectVenue(venue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
        required
      />

      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-900 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 py-1 animate-in fade-in duration-100">
          {filtered.map((venue, index) => (
            <div
              key={`${venue.venueName}-${venue.city}-${index}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur from firing before selection
                handleSelect(venue);
              }}
              className={`px-3 py-2 text-left cursor-pointer transition-colors flex flex-col gap-0.5 select-none ${
                index === activeIndex
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-xs font-semibold">{venue.venueName}</span>
              <span className="text-[10px] text-zinc-500">
                {venue.city} • {venue.address}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
