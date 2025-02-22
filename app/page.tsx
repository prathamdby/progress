"use client";

import {
  useState,
  useRef,
  KeyboardEvent,
  ChangeEvent,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfettiEffect } from "@/components/ui/confetti";
import { GifPopup } from "@/components/ui/gif-popup";
import {
  Send,
  Plus,
  X,
  Activity,
  Copy,
  Github,
  Twitter,
  Linkedin,
  ListTodo,
  ScrollText,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
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
import Link from "next/link";
import { Inter } from "next/font/google";
import { storage, StorageKeys } from "@/lib/localStorage";
import type { Task } from "@/lib/localStorage";

const inter = Inter({ subsets: ["latin"] });

const mentionList = ["Pratham", "Ayush", "Venkat", "Dipto"];

const GridPattern = () => (
  <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] [mask-image:radial-gradient(white,transparent_85%)] pointer-events-none" />
);

// Confetti trigger states type
interface ConfettiTriggers {
  taskAdded: boolean;
  taskCompleted: boolean;
  taskDeleted: boolean;
  allTasksCleared: boolean;
  notesSaved: boolean;
  notesDeleted: boolean;
  updateGenerated: boolean;
  updateCopied: boolean;
}

export default function EODUpdatePage() {
  const [isGenerating, setIsGenerating] = useState(false);
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [notes, setNotes] = useState("");
  const [aiUpdate, setAiUpdate] = useState("");
  const [gifPopup, setGifPopup] = useState<{
    show: boolean;
    type: "angry" | "happy";
  }>({
    show: false,
    type: "angry",
  });
  const [_mentionQuery, setMentionQuery] = useState("");
  const [_taskMentionQuery, setTaskMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [taskMentionSuggestions, setTaskMentionSuggestions] = useState<
    string[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

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

  const triggerConfetti = useCallback((type: keyof ConfettiTriggers) => {
    setConfettiTriggers((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setConfettiTriggers((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  }, []);

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
    setNotes("");
    setAiUpdate("");
    storage.removeItem(StorageKeys.TASKS);
    storage.removeItem(StorageKeys.NOTES);
    triggerConfetti("allTasksCleared");
    if (notes.trim()) {
      triggerConfetti("notesDeleted");
    }
  };

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

  const copyToClipboard = async () => {
    if (aiUpdate) {
      await navigator.clipboard.writeText(aiUpdate);
      triggerConfetti("updateCopied");
    }
  };

  const debounce = (func: (...args: unknown[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: unknown[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleNotesSaved = debounce(() => {
    triggerConfetti("notesSaved");
  }, 1000);

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    handleNotesSaved();

    const words = value.split(" ");
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith("@")) {
      const query = lastWord.slice(1);
      setMentionQuery(query);
      setMentionSuggestions(
        mentionList.filter((name) =>
          name.toLowerCase().startsWith(query.toLowerCase())
        )
      );
    } else {
      setMentionSuggestions([]);
    }
    updateCursorPosition(e.target);
  };

  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const cursorIndex = textarea.selectionStart ?? 0;
    const value = textarea.value ?? "";
    const textBeforeCursor = value.substring(0, cursorIndex);
    const lines = textBeforeCursor.split("\n");
    const currentLineIndex = lines.length - 1;
    const currentLineText = lines[currentLineIndex];

    const style = window.getComputedStyle(textarea);
    const lineHeight = parseInt(style.lineHeight) || 20;
    const paddingTop = parseInt(style.paddingTop) || 0;
    const paddingLeft = parseInt(style.paddingLeft) || 0;

    const x = Math.min(
      currentLineText.length * 8 + paddingLeft,
      textarea.clientWidth - 200
    );
    const y = currentLineIndex * lineHeight + paddingTop;

    setCursorPosition({ x, y });
  };

  const insertMention = (name: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart ?? 0;
    const textBeforeCursor = notes.slice(0, cursorPosition);
    const textAfterCursor = notes.slice(cursorPosition);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf("@");
    const newText =
      textBeforeCursor.slice(0, lastAtSymbolIndex) +
      `@${name} ` +
      textAfterCursor;
    setNotes(newText);
    setMentionSuggestions([]);
    textarea.focus();
    const newCursorPosition = lastAtSymbolIndex + name.length + 2;
    setTimeout(
      () => textarea.setSelectionRange(newCursorPosition, newCursorPosition),
      0
    );
  };

  return (
    <main className={`min-h-screen pt-8 sm:pt-12 relative ${inter.className}`}>
      {Object.entries(confettiTriggers).map(
        ([key, value]) => value && <ConfettiEffect key={key} />
      )}

      <GifPopup
        isVisible={gifPopup.show}
        onClose={() => setGifPopup((prev) => ({ ...prev, show: false }))}
        searchTerm={
          gifPopup.type === "angry" ? "super angry cat" : "silly cat dance png"
        }
      />

      <GridPattern />
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-center gap-3 mb-10 sm:mb-16">
          <Activity className="h-8 w-8 text-white/90" />
          <span className="text-xl font-semibold text-gradient">Progress</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight mb-2 lg:mb-4 leading-tight lg:leading-[1.15] text-gradient">
            What did you get done today?
          </h1>
          <p className="text-lg sm:text-xl font-medium text-gradient max-w-2xl mx-auto">
            Track your accomplishments and share updates with your team
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <ListTodo className="h-5 w-5 text-white" />
              <h2 className="text-xl font-semibold text-gradient">
                Today's Tasks
              </h2>
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
                        Are you sure you want to clear all tasks and notes? This
                        action cannot be undone.
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
              onClick={generateUpdate}
              disabled={gifPopup.show}
              className="w-full bg-white/10 hover:bg-white/20 text-white h-12 transition-colors"
            >
              <div className="flex items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={
                      gifPopup.show
                        ? "playing"
                        : isGenerating
                        ? "generating"
                        : "idle"
                    }
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center"
                  >
                    {gifPopup.show ? (
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <ScrollText className="h-5 w-5 text-white" />
              <h2 className="text-xl font-semibold text-gradient">
                Notes & Updates
              </h2>
            </div>

            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Write your notes here... Use @ to mention team members"
                className="min-h-[400px] bg-white/5 border-white/10 focus:border-white/20 resize-none text-[15px] font-medium text-white/90"
                value={notes}
                onChange={handleNotesChange}
              />
              <AnimatePresence>
                {mentionSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      position: "absolute",
                      left: `${cursorPosition.x}px`,
                      top: `${cursorPosition.y + 24}px`,
                      width: "200px",
                    }}
                    className="bg-zinc-800 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden z-10"
                  >
                    {mentionSuggestions.map((name) => (
                      <button
                        key={name}
                        className="block w-full text-left px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors text-white/90"
                        onClick={() => insertMention(name)}
                      >
                        @{name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {aiUpdate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="relative bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <h3 className="text-sm font-medium text-white/80 mb-2">
                    Generated Update
                  </h3>
                  <div className="pr-12">
                    <p className="text-[15px] leading-relaxed whitespace-pre-line text-white/90 font-medium">
                      {aiUpdate}
                    </p>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="mt-16 sm:mt-24 py-8 text-center border-t border-white/5 bg-white/[0.02]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-white/60">
            Made with ♥️ by Pratham
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/prathamdby"
              target="_blank"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com/prathamdby"
              target="_blank"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com/in/prathamdby"
              target="_blank"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
