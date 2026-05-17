"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neuralpay/ui/components/tabs";
import { InsightsList } from "./components/insights-list";
import { ChatInterface } from "./components/chat-interface";
import { Sparkles, MessageCircle } from "lucide-react";

/**
 * AI Insights Page
 * Tab 1: Insights (full list with filters, search, archive/restore)
 * Tab 2: Ask Coach (chat interface)
 */
export default function AIInsightsPage() {
  const searchParams = useSearchParams();
  const focusInsightId = searchParams.get("focus");
  const initialSessionId = searchParams.get("sessionId");

  const [activeTab, setActiveTab] = useState(
    initialSessionId ? "chat" : "insights",
  );

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">AI Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered financial intelligence and coaching
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="border-b border-border px-6">
          <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-12">
            <TabsTrigger
              value="insights"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
            >
              <Sparkles className="size-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
            >
              <MessageCircle className="size-4 mr-2" />
              Ask Coach
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="insights" className="flex-1 m-0">
          <InsightsList focusInsightId={focusInsightId ?? undefined} />
        </TabsContent>

        <TabsContent value="chat" className="flex-1 m-0">
          <ChatInterface initialSessionId={initialSessionId ?? undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
