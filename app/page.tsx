"use client";

import { useState, useEffect, useCallback } from "react";
import { Inter } from "next/font/google";
import GridPattern from "@/components/GridPattern";
import Header from "@/components/Header";
import { SettingsMenu } from "@/components/SettingsMenu";
import TaskSection from "@/components/TaskSection";
import NotesSection from "@/components/NotesSection";
import Footer from "@/components/Footer";
import { ConfettiEffect } from "@/components/ui/confetti";
import { GifPopup } from "@/components/ui/gif-popup";
import useConfettiTrigger from "@/hooks/useConfettiTrigger";
import { storage, StorageKeys, AnimalType } from "@/lib/localStorage";
import type { Task } from "@/types";

const inter = Inter({ subsets: ["latin"] });

export default function EODUpdatePage() {
  const [mentionList, setMentionList] = useState<string[]>(
    () =>
      storage
        .getItem(StorageKeys.TEAM_MEMBERS)
        ?.map((member) => member.username) || []
  );

  const updateMentionList = useCallback(() => {
    const members = storage.getItem(StorageKeys.TEAM_MEMBERS);
    setMentionList(members?.map((member) => member.username) || []);
  }, []);

  // Handle storage changes from other windows/tabs
  useEffect(() => {
    window.addEventListener("storage", updateMentionList);
    return () => window.removeEventListener("storage", updateMentionList);
  }, [updateMentionList]);

  const { confettiTriggers, triggerConfetti } = useConfettiTrigger();
  const [isGenerating, setIsGenerating] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState("");
  const [aiUpdate, setAiUpdate] = useState("");
  const [animalType, setAnimalType] = useState<AnimalType>(() => {
    return storage.getItem(StorageKeys.ANIMAL_TYPE) || "cat";
  });
  const [gifPopup, setGifPopup] = useState<{
    show: boolean;
    type: "angry" | "happy";
  }>({
    show: false,
    type: "angry",
  });

  useEffect(() => {
    const savedTasks = storage.getItem(StorageKeys.TASKS);
    if (savedTasks) {
      setTasks(savedTasks);
    }

    const savedNotes = storage.getItem(StorageKeys.NOTES);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  useEffect(() => {
    storage.setItem(StorageKeys.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    storage.setItem(StorageKeys.NOTES, notes);
  }, [notes]);

  const generateUpdate = () => {
    setIsGenerating(true);
    // Check if there's no content to generate update from
    const hasNoTasks = tasks.length === 0;
    const hasNoNotes = !notes.trim();

    if (hasNoTasks && hasNoNotes) {
      setGifPopup({ show: true, type: "angry" });
      setAiUpdate(""); // Clear any existing update
      setIsGenerating(false);
      return;
    }

    const completedTasks = tasks
      .filter((task) => task.done)
      .map((task) => task.text)
      .join(", ");
    const pendingTasks = tasks
      .filter((task) => !task.done)
      .map((task) => task.text)
      .join(", ");
    const update = `Today's accomplishments: ${completedTasks}. 
    Notes: ${notes}. 
    Pending tasks for tomorrow: ${pendingTasks}.`;

    // Single synchronized update for all states
    requestAnimationFrame(() => {
      setAiUpdate(update);
      setGifPopup({ show: true, type: "happy" });
      triggerConfetti("updateGenerated");
      setIsGenerating(false);
    });
  };

  return (
    <main className={`relative min-h-screen pt-8 sm:pt-12 ${inter.className}`}>
      {/* Confetti Effects */}
      {Object.entries(confettiTriggers).map(
        ([key, value]) => value && <ConfettiEffect key={key} />
      )}

      {/* GIF Popup */}
      <GifPopup
        isVisible={gifPopup.show}
        onClose={() => setGifPopup((prev) => ({ ...prev, show: false }))}
        searchTerm={
          gifPopup.type === "angry"
            ? `super angry ${animalType}`
            : `silly ${animalType} dance png`
        }
      />

      <GridPattern />

      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <Header onTeamMembersChange={updateMentionList} />
        <SettingsMenu
          onTeamMembersChange={updateMentionList}
          onAnimalTypeChange={setAnimalType}
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Tasks Section */}
          <TaskSection
            tasks={tasks}
            setTasks={setTasks}
            triggerConfetti={triggerConfetti}
            onGenerateUpdate={generateUpdate}
            isGenerating={isGenerating}
            isGifPlaying={gifPopup.show}
            mentionList={mentionList}
          />

          {/* Notes Section */}
          <NotesSection
            notes={notes}
            setNotes={setNotes}
            aiUpdate={aiUpdate}
            mentionList={mentionList}
            triggerConfetti={triggerConfetti}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
