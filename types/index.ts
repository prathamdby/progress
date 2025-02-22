export interface Task {
  id: number;
  text: string;
  done: boolean;
}

export interface ConfettiTriggers {
  taskAdded: boolean;
  taskCompleted: boolean;
  taskDeleted: boolean;
  allTasksCleared: boolean;
  notesSaved: boolean;
  notesDeleted: boolean;
  updateGenerated: boolean;
  updateCopied: boolean;
}

export interface GifPopup {
  show: boolean;
  type: "angry" | "happy";
}
