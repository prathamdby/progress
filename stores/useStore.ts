import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  storage,
  StorageKeys,
  type Task,
  type AnimalType,
  type TeamMember,
} from "@/lib/localStorage";

type ClearAllTaskMarker = {
  id: -1;
  text: string;
  done: boolean;
  savedTasks: Task[];
};

interface Store {
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (text: string) => void;
  removeTask: (id: number) => void;
  toggleTask: (id: number) => void;
  clearTasks: () => void;
  undoTaskDelete: () => void;
  lastDeletedTask: Task | ClearAllTaskMarker | null;

  // Notes
  notes: string;
  setNotes: (notes: string) => void;
  clearNotes: () => void;
  undoNoteClear: () => void;
  lastDeletedNote: string;

  // Team Members
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;

  // Animal Type
  animalType: AnimalType;
  setAnimalType: (type: AnimalType) => void;

  // Clear All
  clearAllData: () => void;
}

const defaultState = {
  tasks: [],
  notes: "",
  teamMembers: [],
  animalType: "cat" as AnimalType,
  lastDeletedTask: null as Task | ClearAllTaskMarker | null,
  lastDeletedNote: "",
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Tasks
      // Tasks
      setTasks: (tasks) => set({ tasks }),

      addTask: (text) => {
        const newTask: Task = {
          id: Date.now(),
          text,
          done: false,
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      removeTask: (id) => {
        set((state) => {
          const taskToDelete = state.tasks.find((task) => task.id === id);
          return {
            tasks: state.tasks.filter((task) => task.id !== id),
            lastDeletedTask: taskToDelete || null,
          };
        });
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, done: !task.done } : task
          ),
        }));
      },

      clearTasks: () => {
        set((state) => ({
          tasks: [],
          lastDeletedTask:
            state.tasks.length > 0
              ? {
                  id: -1,
                  text: "all tasks",
                  done: false,
                  savedTasks: state.tasks,
                }
              : null,
        }));
      },

      undoTaskDelete: () => {
        set((state) => {
          if (!state.lastDeletedTask) return state;
          if (state.lastDeletedTask.id === -1) {
            // Special case for clearing all tasks
            return {
              ...state,
              tasks: (state.lastDeletedTask as ClearAllTaskMarker).savedTasks,
              lastDeletedTask: null,
            };
          }
          return {
            tasks: [...state.tasks, state.lastDeletedTask],
            lastDeletedTask: null,
          };
        });
      },

      // Notes
      setNotes: (notes) => set({ notes }),
      clearNotes: () => {
        set((state) => ({
          notes: "",
          lastDeletedNote: state.notes,
        }));
      },
      undoNoteClear: () => {
        set((state) => ({
          notes: state.lastDeletedNote,
          lastDeletedNote: "",
        }));
      },

      // Team Members
      setTeamMembers: (members) => set({ teamMembers: members }),

      // Animal Type
      setAnimalType: (type) => set({ animalType: type }),

      // Clear All
      clearAllData: () => set({ tasks: [], notes: "" }),
    }),
    {
      name: "progress-store",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // Important for Next.js
    }
  )
);

// Handle hydration
if (typeof window !== "undefined") {
  useStore.persist.rehydrate();
}
