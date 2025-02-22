import { useState, useCallback } from "react";
import type { ConfettiTriggers } from "@/types";

export const useConfettiTrigger = () => {
  const [confettiTriggers, setConfettiTriggers] = useState<ConfettiTriggers>({
    taskAdded: false,
    taskCompleted: false,
    taskDeleted: false,
    allTasksCleared: false,
    notesSaved: false,
    notesDeleted: false,
    updateGenerated: false,
    updateCopied: false,
  });

  const triggerConfetti = useCallback((type: keyof ConfettiTriggers) => {
    setConfettiTriggers((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setConfettiTriggers((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  }, []);

  return {
    confettiTriggers,
    triggerConfetti,
  };
};

export default useConfettiTrigger;
