"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { storage, StorageKeys } from "@/lib/localStorage";
import type { Task } from "@/lib/localStorage";

const inter = Inter({ subsets: ["latin"] });

const mentionList = ["Pratham", "Ayush", "Venkat", "Dipto"];

const GridPattern = () => (
  <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] [mask-image:radial-gradient(white,transparent_85%)] pointer-events-none" />
);

export default function EODUpdatePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [notes, setNotes] = useState("");
  const [aiUpdate, setAiUpdate] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [taskMentionQuery, setTaskMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [taskMentionSuggestions, setTaskMentionSuggestions] = useState<
    string[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Load saved data on component mount
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

  // Save tasks when they change
  useEffect(() => {
    storage.setItem(StorageKeys.TASKS, tasks);
  }, [tasks]);

  // Save notes when they change
  useEffect(() => {
    storage.setItem(StorageKeys.NOTES, notes);
  }, [notes]);

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
    }
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const generateUpdate = () => {
    const completedTasks = tasks
      .filter((task) => task.done)
      .map((task) => task.text)
      .join(", ");
    const pendingTasks = tasks
      .filter((task) => !task.done)
      .map((task) => task.text)
      .join(", ");
    setAiUpdate(`Today's accomplishments: ${completedTasks}. 
    Notes: ${notes}. 
    Pending tasks for tomorrow: ${pendingTasks}.`);
  };

  const copyToClipboard = async () => {
    if (aiUpdate) {
      await navigator.clipboard.writeText(aiUpdate);
    }
  };

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
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
    const lineHeight = parseInt(style.lineHeight) || 20; // Default to 20px
    const paddingTop = parseInt(style.paddingTop) || 0;
    const paddingLeft = parseInt(style.paddingLeft) || 0;

    // Calculate position with fallback values
    const x = Math.min(
      currentLineText.length * 8 + paddingLeft,
      textarea.clientWidth - 200 // Ensure popup doesn't go off-screen
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
    <main className={`min-h-screen pt-12 pb-16 relative ${inter.className}`}>
      <GridPattern />
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-center gap-3 mb-16">
          <Activity className="h-8 w-8 text-white/90" />
          <span className="text-xl font-semibold text-gradient">Progress</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-[72px] font-black tracking-tight mb-4 text-gradient">
            What did you get done today?
          </h1>
          <p className="text-xl font-medium text-gradient">
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
              <Button
                onClick={addTask}
                className="bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
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
                      className="opacity-0 group-hover:opacity-100 hover:bg-white/10 absolute right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Button
              onClick={generateUpdate}
              className="w-full bg-white/10 hover:bg-white/20 text-white h-12 transition-colors"
            >
              <Send className="h-5 w-5 mr-2" />
              Generate Update
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

      <div className="mt-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-white/60">
            Made with ♥️ by Pratham
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/prathamdubey"
              target="_blank"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com/prathamdubey"
              target="_blank"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com/in/prathamdubey"
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
