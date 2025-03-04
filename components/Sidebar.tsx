"use client";

import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { AnimalType } from "@/lib/localStorage";
import { useStore } from "@/stores/useStore";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";

export function Sidebar() {
  const { teamMembers, setTeamMembers, animalType, setAnimalType } = useStore();
  const [newUsername, setNewUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const addTeamMember = () => {
    if (!newUsername) return;

    if (!teamMembers.some((member) => member.username === newUsername)) {
      setTeamMembers([
        ...teamMembers,
        { id: crypto.randomUUID(), username: newUsername },
      ]);
    }
    setNewUsername("");
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
  };

  // Close sidebar on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 items-center border-white/10 bg-white/10 hover:bg-white/20"
      >
        <Menu className="h-[1.2rem] w-[1.2rem] text-white" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-[101] flex h-full w-80 flex-col border-r border-white/[0.08] bg-black/20 p-6 backdrop-blur-lg transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-lg p-0.5"
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto">
          {/* Team Members Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-white/90">Team Members</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add team member username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTeamMember();
                  }
                }}
                className="border-white/10 bg-white/5 focus:border-white/20"
              />
              <Button
                onClick={addTeamMember}
                className="bg-white/10 hover:bg-white/20"
              >
                Add
              </Button>
            </div>
            <div className="scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-white/10 h-[140px] space-y-2 overflow-y-auto pr-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 pr-14"
                >
                  <span className="text-sm text-white/90">
                    @{member.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeamMember(member.id)}
                    className="absolute right-2 opacity-100 hover:bg-white/10 group-hover:opacity-100 md:opacity-0"
                  >
                    <X className="h-4 w-4 text-white/90" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* GIF Settings Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-white/90">GIF Settings</h3>
            <div className="relative">
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value as AnimalType)}
                className="w-full appearance-none rounded-md border border-white/10 bg-white/5 px-3 py-2 pr-8 text-sm text-white/90 focus:border-white/20 focus:outline-none focus:ring-0"
              >
                <option value="cat">Cat GIFs</option>
                <option value="dog">Dog GIFs</option>
                <option value="rabbit">Bunny GIFs</option>
                <option value="hamster">Hamster GIFs</option>
                <option value="panda">Panda GIFs</option>
                <option value="penguin">Penguin GIFs</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
