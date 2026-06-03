import { FormEvent, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { askAssistant } from "../services/data";
import { cn } from "../utils/cn";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const prompts = [
  "How much did I spend this month?",
  "Show my pending expenses.",
  "Which department spent the most this month?",
  "Summarize my travel expenses."
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi, I can help search expenses, summarize trips, and guide reports." }
  ]);
  const chat = useMutation({
    mutationFn: askAssistant,
    onSuccess: (response) => {
      setMessages((items) => [...items, { role: "assistant", content: response.answer }]);
    }
  });

  function send(message = input) {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessages((items) => [...items, { role: "user", content: trimmed }]);
    setInput("");
    chat.mutate(trimmed);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send();
  }

  return (
    <>
      <button
        className="fixed bottom-20 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-andritz-blue text-white shadow-enterprise transition hover:bg-[#00629f] lg:bottom-6"
        onClick={() => setOpen(true)}
        title="Open AI assistant"
      >
        <Sparkles size={24} />
      </button>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-enterprise dark:border-slate-800 dark:bg-slate-950 lg:bottom-24">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Bot className="text-andritz-blue" size={20} />
              Enterprise Copilot
            </div>
            <button onClick={() => setOpen(false)} title="Close assistant">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-andritz-blue text-white"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100"
                )}
              >
                {message.content}
              </div>
            ))}
            {chat.isPending && <div className="w-fit rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:bg-slate-900">Thinking...</div>}
          </div>
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="mb-3 flex gap-2 overflow-x-auto">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  onClick={() => send(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={submit}>
              <input
                className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-andritz-blue dark:border-slate-700 dark:bg-slate-900"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about expenses..."
              />
              <Button className="w-10 px-0" disabled={chat.isPending}>
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
