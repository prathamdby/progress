/**
 * Enumerated storage keys to ensure type safety and avoid typos
 */
export const StorageKeys = {
  TASKS: "progress:tasks",
  NOTES: "progress:notes",
  TEAM_MEMBERS: "progress:team_members",
  ANIMAL_TYPE: "progress:animal_type",
} as const;

export type AnimalType =
  | "cat"
  | "dog"
  | "rabbit"
  | "hamster"
  | "panda"
  | "penguin";

export type StorageKeysType = (typeof StorageKeys)[keyof typeof StorageKeys];

/**
 * Type to store task data
 */
export interface Task {
  id: number;
  text: string;
  done: boolean;
}

/**
 * Store type definitions for the app's data
 */
export interface StoreData {
  [StorageKeys.TASKS]: Task[];
  [StorageKeys.NOTES]: string;
  [StorageKeys.TEAM_MEMBERS]: TeamMember[];
  [StorageKeys.ANIMAL_TYPE]: AnimalType;
}

export interface TeamMember {
  id: string;
  username: string;
}

/**
 * Local-first storage utility class
 * Falls back to in-memory storage if localStorage is not available
 */
class StorageUtility {
  private static instance: StorageUtility;
  private memoryStore: Partial<StoreData> = {};
  private isLocalStorageAvailable: boolean;

  private constructor() {
    this.isLocalStorageAvailable =
      typeof window !== "undefined" && !!window.localStorage;
  }

  public static getInstance(): StorageUtility {
    if (!StorageUtility.instance) {
      StorageUtility.instance = new StorageUtility();
    }
    return StorageUtility.instance;
  }

  /**
   * Set an item in storage
   */
  setItem<K extends StorageKeysType>(key: K, value: StoreData[K]): void {
    try {
      const jsonValue = JSON.stringify(value);
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, jsonValue);
      } else {
        this.memoryStore[key] = value;
      }
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
    }
  }

  /**
   * Get an item from storage
   */
  getItem<K extends StorageKeysType>(key: K): StoreData[K] | null {
    try {
      if (this.isLocalStorageAvailable) {
        const jsonValue = localStorage.getItem(key);
        return jsonValue ? JSON.parse(jsonValue) : null;
      }
      return (this.memoryStore[key] as StoreData[K]) || null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove an item from storage
   */
  removeItem(key: StorageKeysType): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(key);
      } else {
        delete this.memoryStore[key];
      }
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
    }
  }

  /**
   * Clear all items from storage
   */
  clear(): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.clear();
      } else {
        this.memoryStore = {};
      }
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }
}

export const storage = StorageUtility.getInstance();
