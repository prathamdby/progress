"use client";

import { useState, useCallback } from "react";
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
import { useStore } from "@/stores/useStore";
import { StoreInitializer } from "@/components/StoreInitializer";

const inter = Inter({ subsets: ["latin"] });

export default function EODUpdatePage() {
  const { tasks, notes, animalType } = useStore();
  const { confettiTriggers, triggerConfetti } = useConfettiTrigger();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiUpdate, setAiUpdate] = useState("");
  const [gifPopup, setGifPopup] = useState<{
    show: boolean;
    type: "angry" | "happy";
  }>({
    show: false,
    type: "angry",
  });

  const generateUpdate = useCallback((): void => {
    const generateUpdateContent = () => {
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

      requestAnimationFrame(() => {
        setAiUpdate(update);
        setGifPopup({ show: true, type: "happy" });
        triggerConfetti("updateGenerated");
        setIsGenerating(false);
      });
    };

    setIsGenerating(true);
    generateUpdateContent();
  }, [tasks, notes, setAiUpdate, setGifPopup, triggerConfetti]);

  return (
    <StoreInitializer>
      <main
        className={`relative min-h-screen pt-8 sm:pt-12 ${inter.className}`}
      >
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
          <Header />
          <SettingsMenu />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Tasks Section */}
            <TaskSection
              triggerConfetti={triggerConfetti}
              onGenerateUpdate={generateUpdate}
              isGenerating={isGenerating}
              isGifPlaying={gifPopup.show}
            />

            {/* Notes Section */}
            <NotesSection
              aiUpdate={aiUpdate}
              triggerConfetti={triggerConfetti}
            />
          </div>
        </div>

        <Footer />
      </main>
    </StoreInitializer>
  );
}
