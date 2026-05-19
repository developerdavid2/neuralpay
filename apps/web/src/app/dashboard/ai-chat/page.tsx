// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useChat } from "@/hooks/dashboard/use-chat";
// import { cn } from "@neuralpay/ui/lib/utils";
// import { Button } from "@neuralpay/ui/components/button";
// import { Input } from "@neuralpay/ui/components/input";
// import { ScrollArea } from "@neuralpay/ui/components/scroll-area";
// import { Send, User, Bot, Loader2 } from "lucide-react";

// /**
//  * Chat Interface for AI Coach
//  * Used by: Ask Coach tab (/dashboard/ai-insights/chat)
//  */
// export function ChatInterface({
//   initialSessionId,
// }: {
//   initialSessionId?: string;
// }) {
//   const [input, setInput] = useState("");
//   const scrollRef = useRef<HTMLDivElement>(null);

//   const { messages, isLoading, sendMessage, isSending, session } =
//     useChat(initialSessionId);

//   // Auto-scroll to bottom on new messages
//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim() || isSending) return;
//     sendMessage(input.trim());
//     setInput("");
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Chat header */}
//       <div className="border-b border-border px-4 py-3">
//         <div className="flex items-center gap-2">
//           <div className="rounded-full bg-primary/10 p-1.5">
//             <Bot className="size-4 text-primary" />
//           </div>
//           <div>
//             <h2 className="text-sm font-semibold">AI Coach</h2>
//             <p className="text-[10px] text-muted-foreground">
//               {session?.title ?? "New conversation"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Messages area */}
//       <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
//         <div className="space-y-4">
//           {messages.length === 0 && (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <Bot className="size-8 text-muted-foreground mb-3" />
//               <p className="text-sm font-medium text-foreground">
//                 Start a conversation
//               </p>
//               <p className="text-xs text-muted-foreground mt-1 max-w-[300px]">
//                 Ask me anything about your spending, budgets, or financial
//                 goals.
//               </p>
//             </div>
//           )}

//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={cn(
//                 "flex gap-3",
//                 message.role === "user" ? "justify-end" : "justify-start",
//               )}
//             >
//               {message.role === "assistant" && (
//                 <div className="rounded-full bg-primary/10 p-1.5 h-fit mt-1">
//                   <Bot className="size-3.5 text-primary" />
//                 </div>
//               )}

//               <div
//                 className={cn(
//                   "rounded-lg px-3 py-2 max-w-[80%]",
//                   message.role === "user"
//                     ? "bg-primary text-primary-foreground"
//                     : "bg-muted text-foreground",
//                 )}
//               >
//                 <p className="text-sm whitespace-pre-wrap">{message.content}</p>
//                 <span className="text-[10px] opacity-60 mt-1 block">
//                   {new Date(message.createdAt).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </span>
//               </div>

//               {message.role === "user" && (
//                 <div className="rounded-full bg-secondary p-1.5 h-fit mt-1">
//                   <User className="size-3.5 text-secondary-foreground" />
//                 </div>
//               )}
//             </div>
//           ))}

//           {isSending && (
//             <div className="flex gap-3">
//               <div className="rounded-full bg-primary/10 p-1.5">
//                 <Bot className="size-3.5 text-primary" />
//               </div>
//               <div className="bg-muted rounded-lg px-3 py-2">
//                 <Loader2 className="size-4 animate-spin text-muted-foreground" />
//               </div>
//             </div>
//           )}
//         </div>
//       </ScrollArea>

//       {/* Input area */}
//       <form onSubmit={handleSubmit} className="border-t border-border p-4">
//         <div className="flex items-center gap-2">
//           <Input
//             placeholder="Ask your AI Coach..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="flex-1"
//             disabled={isSending}
//           />
//           <Button
//             type="submit"
//             size="icon"
//             disabled={!input.trim() || isSending}
//           >
//             <Send className="size-4" />
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }

import React from "react";

const Page = () => {
  return <div>Ai Chat</div>;
};

export default Page;
