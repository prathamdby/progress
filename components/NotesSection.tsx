"use client";

import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ConfettiTriggers } from "@/types";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
  aiUpdate: string;
  mentionList: string[];
  triggerConfetti: (type: keyof ConfettiTriggers) => void;
}

const NotesSection = ({
  notes,
  setNotes,
  aiUpdate,
  mentionList,
  triggerConfetti,
}: NotesSectionProps) => {
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const copyToClipboard = async () => {
    if (aiUpdate) {
      await navigator.clipboard.writeText(aiUpdate);
      triggerConfetti("updateCopied");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <ScrollText className="h-5 w-5 text-white" />
        <h2 className="text-xl font-semibold text-gradient">Notes & Updates</h2>
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
  );
};

export default NotesSection;
