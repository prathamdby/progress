"use client";

import { Settings, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { storage, StorageKeys, TeamMember } from "@/lib/localStorage";

export interface SettingsMenuProps {
  onTeamMembersChange: () => void;
}

export function SettingsMenu({ onTeamMembersChange }: SettingsMenuProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    return storage.getItem(StorageKeys.TEAM_MEMBERS) || [];
  });

  useEffect(() => {
    storage.setItem(StorageKeys.TEAM_MEMBERS, teamMembers);
    onTeamMembersChange();
  }, [teamMembers, onTeamMembersChange]);

  const [newUsername, setNewUsername] = useState("");

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
          className="fixed right-4 top-4 z-50 rounded-full border-white/10 bg-white/10 hover:bg-white/20"
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
          {/* Additional settings sections can be added here */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
