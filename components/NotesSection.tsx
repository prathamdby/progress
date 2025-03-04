"use client";

import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ConfettiTriggers } from "@/types";
import { useStore } from "@/stores/useStore";

interface NotesSectionProps {
  aiUpdate: string;
  triggerConfetti: (type: keyof ConfettiTriggers) => void;
}

const NotesSection = ({ aiUpdate, triggerConfetti }: NotesSectionProps) => {
  const { notes, setNotes, teamMembers } = useStore();
  const [, setMentionQuery] = useState("");
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
        teamMembers
          .map((member) => member.username)
          .filter((name) => name.toLowerCase().startsWith(query.toLowerCase()))
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
        <h2 className="text-gradient text-xl font-semibold">Notes & Updates</h2>
      </div>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder="Write your notes here... Use @ to mention team members"
          className="min-h-[400px] resize-none border-white/10 bg-white/5 text-[15px] font-medium text-white/90 focus:border-white/20"
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
              className="z-10 overflow-hidden rounded-lg border border-white/10 bg-zinc-800 shadow-xl backdrop-blur-sm"
            >
              {mentionSuggestions.map((name) => (
                <button
                  key={name}
                  className="block w-full px-4 py-3 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/5"
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
            className="relative rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <h3 className="mb-2 text-sm font-medium text-white/80">
              Generated Update
            </h3>
            <div className="pr-12">
              <p className="whitespace-pre-line text-[15px] font-medium leading-relaxed text-white/90">
                {aiUpdate}
              </p>
            </div>
            <Button
              onClick={copyToClipboard}
              size="icon"
              variant="ghost"
              className="absolute right-3 top-3 hover:bg-white/10"
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
