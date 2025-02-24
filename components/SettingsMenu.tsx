"use client";

import { ChevronDown, Settings, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  AnimalType,
  storage,
  StorageKeys,
  TeamMember,
} from "@/lib/localStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";

export interface SettingsMenuProps {
  onTeamMembersChange: () => void;
  onAnimalTypeChange?: (type: AnimalType) => void;
}

export function SettingsMenu({
  onTeamMembersChange,
  onAnimalTypeChange,
}: SettingsMenuProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    return storage.getItem(StorageKeys.TEAM_MEMBERS) || [];
  });

  useEffect(() => {
    storage.setItem(StorageKeys.TEAM_MEMBERS, teamMembers);
    onTeamMembersChange();
  }, [teamMembers, onTeamMembersChange]);

  const [newUsername, setNewUsername] = useState("");
  const [animalType, setAnimalType] = useState<AnimalType>(() => {
    return storage.getItem(StorageKeys.ANIMAL_TYPE) || "cat";
  });

  useEffect(() => {
    storage.setItem(StorageKeys.ANIMAL_TYPE, animalType);
    onAnimalTypeChange?.(animalType);
  }, [animalType, onAnimalTypeChange]);

  const addTeamMember = () => {
    if (!newUsername) return;

    setTeamMembers([
      ...teamMembers,
      { id: crypto.randomUUID(), username: newUsername },
    ]);
    setNewUsername("");
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-4 z-50 items-center border-white/10 bg-white/10 hover:bg-white/20"
        >
          <Settings className="h-[1.2rem] w-[1.2rem] text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h3 className="font-medium leading-none">Team Members</h3>
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
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 pr-14"
                >
                  <span className="text-sm">@{member.username}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeamMember(member.id)}
                    className="absolute right-2 opacity-100 hover:bg-white/10 group-hover:opacity-100 md:opacity-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium leading-none">GIF Settings</h3>
            <div className="flex items-center gap-2">
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value as AnimalType)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-white/20 focus:outline-none focus:ring-0"
              >
                <option value="cat">Cat GIFs</option>
                <option value="dog">Dog GIFs</option>
                <option value="rabbit">Bunny GIFs</option>
                <option value="hamster">Hamster GIFs</option>
                <option value="panda">Panda GIFs</option>
                <option value="penguin">Penguin GIFs</option>
              </select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
