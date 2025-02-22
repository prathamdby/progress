"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ListTodo, Trash2, AlertTriangle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { Task, ConfettiTriggers } from "@/types";
import { storage, StorageKeys } from "@/lib/localStorage";

interface TaskSectionProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  triggerConfetti: (type: keyof ConfettiTriggers) => void;
  onGenerateUpdate: () => void;
  isGenerating: boolean;
  isGifPlaying: boolean;
}

const mentionList = ["Pratham", "Ayush", "Venkat", "Dipto"];

const TaskSection = ({
  tasks,
  setTasks,
  triggerConfetti,
  onGenerateUpdate,
  isGenerating,
  isGifPlaying,
}: TaskSectionProps) => {
  const [newTask, setNewTask] = useState("");
  const [taskMentionQuery, setTaskMentionQuery] = useState("");
  const [taskMentionSuggestions, setTaskMentionSuggestions] = useState<string[]>([]);
  const taskInputRef = useRef<HTMLInputElement>(null);

  const handleTaskInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewTask(value);
    const words = value.split(" ");
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith("@")) {
      const query = lastWord.slice(1);
      setTaskMentionQuery(query);
      setTaskMentionSuggestions(
        mentionList.filter((name) =>
          name.toLowerCase().startsWith(query.toLowerCase())
        )
      );
    } else {
      setTaskMentionSuggestions([]);
    }
  };

  const insertTaskMention = (name: string) => {
    if (!taskInputRef.current) return;

    const input = taskInputRef.current;
    const cursorPosition = input.selectionStart ?? 0;
    const textBeforeCursor = newTask.slice(0, cursorPosition);
    const textAfterCursor = newTask.slice(cursorPosition);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf("@");
    const newText =
      textBeforeCursor.slice(0, lastAtSymbolIndex) +
      `@${name} ` +
      textAfterCursor;
    setNewTask(newText);
    setTaskMentionSuggestions([]);
    input.focus();
    const newCursorPosition = lastAtSymbolIndex + name.length + 2;
    setTimeout(
      () => input.setSelectionRange(newCursorPosition, newCursorPosition),
      0
    );
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
      setNewTask("");
      triggerConfetti("taskAdded");
    }
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
    triggerConfetti("taskDeleted");
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const newDone = !task.done;
          if (newDone) {
            triggerConfetti("taskCompleted");
          }
          return { ...task, done: newDone };
        }
        return task;
      })
    );
  };

  const clearAllData = () => {
    setTasks([]);
    storage.removeItem(StorageKeys.TASKS);
    storage.removeItem(StorageKeys.NOTES);
    triggerConfetti("allTasksCleared");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <ListTodo className="h-5 w-5 text-white" />
        <h2 className="text-xl font-semibold text-gradient">Today's Tasks</h2>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={taskInputRef}
            type="text"
            placeholder="Add a new task... Use @ to mention team members"
            className="w-full bg-white/5 border-white/10 focus:border-white/20"
            value={newTask}
            onChange={handleTaskInputChange}
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && addTask()
            }
          />
          <AnimatePresence>
            {taskMentionSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute w-[200px] top-[calc(100%+4px)] bg-zinc-800 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden z-10"
              >
                {taskMentionSuggestions.map((name) => (
                  <button
                    key={name}
                    className="block w-full text-left px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors text-white/90"
                    onClick={() => insertTaskMention(name)}
                  >
                    @{name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={addTask}
            size="icon"
            className="bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Clear All Data</span>
                </DialogTitle>
                <DialogDescription className="pt-3">
                  Are you sure you want to clear all tasks and notes? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    onClick={clearAllData}
                    className="w-full sm:w-auto bg-red-500/20 hover:bg-red-500/30 text-red-500"
                  >
                    Clear All
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 border rounded-md bg-white/5 border-white/10 text-center"
            >
              <ListTodo className="h-8 w-8 text-white/40 mb-3" />
              <p className="text-white/60 text-sm font-medium">
                Start by creating a task
              </p>
            </motion.div>
          )}
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center justify-between bg-white/5 border border-white/10 rounded-md p-4 hover:bg-white/[0.07] transition-colors pr-14 relative"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Checkbox
                  checked={task.done}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="border-white/20"
                />
                <span
                  className={`text-[15px] font-medium transition-all duration-200 truncate ${
                    task.done
                      ? "line-through text-white/40"
                      : "text-white/90"
                  }`}
                >
                  {task.text}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTask(task.id)}
                className="opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-white/10 absolute right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button
        onClick={onGenerateUpdate}
        disabled={isGifPlaying}
        className="w-full bg-white/10 hover:bg-white/20 text-white h-12 transition-colors"
      >
        <div className="flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isGifPlaying ? "playing" : isGenerating ? "generating" : "idle"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center"
            >
              {isGifPlaying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span>Playing GIF...</span>
                </>
              ) : isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  <span>Generate Update</span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Button>
    </motion.div>
  );
};

export default TaskSection;
