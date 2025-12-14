"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, RotateCcw, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatScenarios, type ChatMessage } from "@/lib/demo-data";

interface DisplayMessage {
  id: string;
  role: "ai" | "user";
  text: string;
}

export function ChatSimulator() {
  const scenario = chatScenarios[0]; // Use the first scenario
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [currentOptions, setCurrentOptions] = useState<typeof scenario.messages.greeting.options>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addMessage = (message: ChatMessage) => {
    setIsTyping(true);
    setCurrentOptions([]);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: message.id, role: message.role, text: message.text },
      ]);
      
      if (message.options) {
        setCurrentOptions(message.options);
      }
    }, message.delay || 800);
  };

  const startConversation = () => {
    setIsStarted(true);
    setMessages([]);
    addMessage(scenario.messages[scenario.startMessageId]);
  };

  const handleOptionClick = (option: { id: string; text: string; nextMessageId: string }) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: option.text },
    ]);
    setCurrentOptions([]);

    // Add AI response
    const nextMessage = scenario.messages[option.nextMessageId];
    if (nextMessage) {
      setTimeout(() => addMessage(nextMessage), 400);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setCurrentOptions([]);
    setIsTyping(false);
    setIsStarted(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Phone Frame */}
      <div className="rounded-3xl border-4 border-muted bg-card overflow-hidden shadow-2xl">
        {/* Phone Header */}
        <div className="bg-muted px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>Mike&apos;s Auto Shop</span>
          </div>
          <div className="w-16" />
        </div>

        {/* Chat Area */}
        <div className="h-[400px] flex flex-col">
          {!isStarted ? (
            // Start Screen
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mb-6">
                <Phone className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Demo</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Experience a simulated phone call with Voice AI. Click the button below to start.
              </p>
              <Button size="lg" className="gradient-bg border-0" onClick={startConversation}>
                <Phone className="mr-2 h-4 w-4" />
                Start Call
              </Button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    } animate-fade-in`}
                  >
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "ai"
                          ? "gradient-bg"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "ai" ? (
                        <Bot className="h-4 w-4 text-white" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl ${
                        message.role === "ai"
                          ? "bg-muted rounded-tl-none"
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Options */}
              <div className="border-t p-4">
                {currentOptions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">Choose a response:</p>
                    {currentOptions.map((option) => (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option.text}
                      </Button>
                    ))}
                  </div>
                ) : isTyping ? (
                  <p className="text-sm text-muted-foreground text-center">
                    AI is responding...
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Waiting for response options...
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Phone Footer */}
        {isStarted && (
          <div className="border-t px-4 py-3 flex justify-center">
            <Button variant="ghost" size="sm" onClick={resetConversation} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Start Over
            </Button>
          </div>
        )}
      </div>

      {/* Note */}
      <p className="text-sm text-muted-foreground text-center mt-6">
        This is an interactive simulation. Real calls use natural voice conversation.
      </p>
    </div>
  );
}
