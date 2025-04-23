"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
	Plus,
	X,
	ListTodo,
	Trash2,
	AlertTriangle,
	Loader2,
	Send,
	Maximize2,
	Mic,
	MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
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
import type { ConfettiTriggers } from "@/types";
import { useStore } from "@/stores/useStore";
import { useVoiceTyping } from "@/hooks/useVoiceTyping";

interface TaskSectionProps {
	triggerConfetti: (type: keyof ConfettiTriggers) => void;
	onGenerateUpdate: () => void;
	isGenerating: boolean;
	isGifPlaying: boolean;
}

const TaskSection = ({
	triggerConfetti,
	onGenerateUpdate,
	isGenerating,
	isGifPlaying,
}: TaskSectionProps) => {
	const {
		tasks,
		addTask,
		removeTask,
		toggleTask,
		clearTasks,
		teamMembers,
		undoTaskDelete,
	} = useStore();
	const { toast } = useToast();
	const [newTask, setNewTask] = useState("");
	const [interimResult, setInterimResult] = useState("");
	const [taskMentionQuery, setTaskMentionQuery] = useState("");
	const [taskMentionSuggestions, setTaskMentionSuggestions] = useState<
		string[]
	>([]);
	const taskInputRef = useRef<HTMLInputElement>(null);
	const {
		isListening,
		startListening,
		stopListening,
		addCurrentTranscript,
		isSupported,
		hasPermission,
		currentText,
	} = useVoiceTyping({
		onInterimResult: (text) => {
			setInterimResult(text);
		},
		onError: (error) => {
			toast({
				title: "Voice input error",
				description: error,
				variant: "destructive",
			});
		},
		onAddTask: (text) => {
			addTask(text);
			setNewTask("");
			setInterimResult("");
			triggerConfetti("taskAdded");
		},
	});

	const handleTaskInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setNewTask(value);
		const words = value.split(" ");
		const lastWord = words[words.length - 1];
		if (lastWord.startsWith("@")) {
			const query = lastWord.slice(1);
			setTaskMentionQuery(query);
			setTaskMentionSuggestions(
				teamMembers
					.map((member) => member.username)
					.filter((name) => name.toLowerCase().startsWith(query.toLowerCase())),
			);
		} else {
			setTaskMentionSuggestions([]);
		}
	};

	const insertTaskMention = (name: string): void => {
		if (!taskInputRef.current) return;

		const input = taskInputRef.current;
		const cursorPosition = input.selectionStart ?? 0;
		const textBeforeCursor = newTask.slice(0, cursorPosition);
		const textAfterCursor = newTask.slice(cursorPosition);
		const lastAtSymbolIndex = textBeforeCursor.lastIndexOf("@");
		const newText = `${textBeforeCursor.slice(0, lastAtSymbolIndex)}@${name} ${textAfterCursor}`;
		setNewTask(newText);
		setTaskMentionSuggestions([]);
		input.focus();
		const newCursorPosition = lastAtSymbolIndex + name.length + 2;
		setTimeout(
			() => input.setSelectionRange(newCursorPosition, newCursorPosition),
			0,
		);
	};

	const handleAddTask = () => {
		if (isListening) {
			addCurrentTranscript();
		} else if (newTask.trim()) {
			addTask(newTask);
			setNewTask("");
			triggerConfetti("taskAdded");
		}
	};

	const handleRemoveTask = (id: number) => {
		const taskToDelete = tasks.find((t) => t.id === id);
		removeTask(id);
		triggerConfetti("taskDeleted");

		const toastInstance = toast({
			title: "Task deleted",
			description: taskToDelete?.text.length
				? taskToDelete.text.slice(0, 100) +
					(taskToDelete.text.length > 100 ? "..." : "")
				: "",
			duration: 5000,
			action: (
				<ToastAction
					altText="Undo task deletion"
					className="border-white/10 bg-white/5 hover:bg-white/10"
					onClick={() => {
						undoTaskDelete();
						toastInstance?.dismiss(true);
					}}
				>
					Undo
				</ToastAction>
			),
		});
	};

	const handleToggleTask = (id: number) => {
		toggleTask(id);
		const task = tasks.find((t) => t.id === id);
		if (task && !task.done) {
			triggerConfetti("taskCompleted");
		}
	};

	const handleClearTasks = () => {
		if (tasks.length > 0) {
			clearTasks();
			triggerConfetti("allTasksCleared");

			const toastInstance = toast({
				title: "All tasks cleared",
				description: "All tasks have been removed",
				duration: 5000,
				action: (
					<ToastAction
						altText="Undo clear all tasks"
						className="border-white/10 bg-white/5 hover:bg-white/10"
						onClick={() => {
							undoTaskDelete();
							toastInstance?.dismiss(true);
						}}
					>
						Undo
					</ToastAction>
				),
			});
		}
	};

	const handleVoiceInput = async () => {
		if (isListening) {
			stopListening();
		} else {
			await startListening();
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			className="space-y-6"
		>
			<div className="flex items-center gap-3">
				<ListTodo className="h-5 w-5 text-white" />
				<h2 className="text-gradient text-xl font-semibold">
					Today&apos;s Tasks
				</h2>
			</div>

			<div className="flex gap-2">
				<div className="relative flex-1">
					<Input
						ref={taskInputRef}
						type="text"
						placeholder={
							isListening
								? "Listening..."
								: "Add a new task... Use @ to mention team members"
						}
						className={`w-full border-white/10 focus:border-white/20 ${
							isListening ? "bg-red-500/5" : "bg-white/5"
						}`}
						value={isListening ? interimResult : newTask}
						onChange={handleTaskInputChange}
						onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
							e.key === "Enter" && handleAddTask()
						}
						disabled={isListening}
					/>
					<AnimatePresence>
						{taskMentionSuggestions.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="absolute top-[calc(100%+4px)] z-10 w-[200px] overflow-hidden rounded-lg border border-white/10 bg-zinc-800 shadow-xl backdrop-blur-sm"
							>
								{taskMentionSuggestions.map((name) => (
									<button
										type="button"
										key={name}
										className="block w-full px-4 py-3 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/5"
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
						onClick={handleVoiceInput}
						size="icon"
						className={`${
							isListening
								? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
								: hasPermission === false
									? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
									: "bg-white/10 text-white hover:bg-white/20"
						} transition-colors`}
						title={
							!isSupported
								? "Voice input is not supported in this browser"
								: hasPermission === false
									? "Microphone access is required for voice input"
									: isListening
										? "Stop voice input"
										: "Start voice input"
						}
					>
						{isListening ? (
							<MicOff className="h-4 w-4 animate-pulse" />
						) : hasPermission === false ? (
							<Mic className="h-4 w-4 opacity-50" />
						) : (
							<Mic className="h-4 w-4" />
						)}
					</Button>
					<Button
						onClick={handleAddTask}
						size="icon"
						className="bg-white/10 text-white transition-colors hover:bg-white/20"
					>
						<Plus className="h-4 w-4" />
					</Button>
					<Dialog>
						<DialogTrigger asChild>
							<Button
								size="icon"
								className="bg-red-500/20 text-red-500 transition-colors hover:bg-red-500/30"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<AlertTriangle className="h-5 w-5 text-red-500" />
									<span>Clear All Tasks</span>
								</DialogTitle>
								<DialogDescription className="pt-3">
									Are you sure you want to clear all tasks? You can undo this
									action.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter className="mt-6">
								<DialogClose asChild>
									<Button
										variant="outline"
										className="w-full border-white/10 bg-white/5 hover:bg-white/10 sm:w-auto"
									>
										Cancel
									</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button
										onClick={handleClearTasks}
										className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/30 sm:w-auto"
									>
										Clear All
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent max-h-[400px] space-y-2 overflow-y-auto">
				<AnimatePresence mode="sync" initial={false}>
					{tasks.length === 0 ? (
						<motion.div
							key="empty"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{
								duration: 0.25,
								ease: [0.4, 0.0, 0.2, 1],
								layout: { duration: 0.25, ease: [0.4, 0.0, 0.2, 1] },
							}}
							className="flex flex-col items-center justify-center rounded-md border border-white/10 bg-white/5 py-12 text-center"
						>
							<ListTodo className="mb-3 h-8 w-8 text-white/40" />
							<p className="text-sm font-medium text-white/60">
								Start by creating a task
							</p>
						</motion.div>
					) : (
						tasks.map((task) => (
							<motion.div
								key={task.id}
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{
									duration: 0.25,
									ease: [0.4, 0.0, 0.2, 1],
									layout: { duration: 0.25, ease: [0.4, 0.0, 0.2, 1] },
								}}
								className="group relative flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-4 pr-24 transition-colors hover:bg-white/[0.07]"
							>
								<div className="flex min-w-0 flex-1 items-center gap-3">
									<Checkbox
										checked={task.done}
										onCheckedChange={() => handleToggleTask(task.id)}
										className="border-white/20"
									/>
									<span
										className={`truncate text-[15px] font-medium transition-all duration-200 ${
											task.done ? "text-white/40 line-through" : "text-white/90"
										}`}
									>
										{task.text}
									</span>
								</div>
								<div className="absolute right-2 flex gap-1">
									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="opacity-100 hover:bg-white/10 group-hover:opacity-100 md:opacity-0"
											>
												<Maximize2 className="h-4 w-4" />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Task Details</DialogTitle>
											</DialogHeader>
											<div className="mt-4 space-y-4">
												<div className="flex gap-3">
													<div className="pt-1">
														<Checkbox
															checked={task.done}
															onCheckedChange={() => handleToggleTask(task.id)}
															className="border-white/20"
														/>
													</div>
													<div className="flex-1">
														<span
															className={`whitespace-pre-wrap text-[15px] font-medium leading-relaxed transition-all duration-200 ${
																task.done
																	? "text-white/40 line-through"
																	: "text-white/90"
															}`}
														>
															{task.text}
														</span>
													</div>
												</div>
												<div className="text-sm text-white/60">
													<p>Created: {new Date(task.id).toLocaleString()}</p>
												</div>
											</div>
											<DialogFooter className="mt-6">
												<DialogClose asChild>
													<Button
														onClick={() => handleRemoveTask(task.id)}
														className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/30 sm:w-auto"
													>
														Delete Task
													</Button>
												</DialogClose>
											</DialogFooter>
										</DialogContent>
									</Dialog>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleRemoveTask(task.id)}
										className="opacity-100 hover:bg-white/10 group-hover:opacity-100 md:opacity-0"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</motion.div>
						))
					)}
				</AnimatePresence>
			</div>

			<Button
				onClick={onGenerateUpdate}
				disabled={isGifPlaying}
				className="h-12 w-full bg-white/10 text-white transition-colors hover:bg-white/20"
			>
				<div className="flex items-center justify-center">
					<AnimatePresence mode="wait" initial={false}>
						<motion.div
							key={
								isGifPlaying ? "playing" : isGenerating ? "generating" : "idle"
							}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.15 }}
							className="flex items-center"
						>
							{isGifPlaying ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									<span>Playing GIF...</span>
								</>
							) : isGenerating ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									<span>Generating...</span>
								</>
							) : (
								<>
									<Send className="mr-2 h-5 w-5" />
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
