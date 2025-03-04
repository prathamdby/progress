import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  storage,
  StorageKeys,
  type Task,
  type AnimalType,
  type TeamMember,
} from "@/lib/localStorage";

interface Store {
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (text: string) => void;
  removeTask: (id: number) => void;
  toggleTask: (id: number) => void;
  clearTasks: () => void;

  // Notes
  notes: string;
  setNotes: (notes: string) => void;
  clearNotes: () => void;

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
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, done: !task.done } : task
          ),
        }));
      },

      clearTasks: () => set({ tasks: [] }),

      // Notes
      setNotes: (notes) => set({ notes }),
      clearNotes: () => set({ notes: "" }),

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
