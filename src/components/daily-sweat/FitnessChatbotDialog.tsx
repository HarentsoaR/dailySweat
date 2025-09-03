
"use client";

import { fitnessChat } from '@/ai/flows/fitness-chat-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react'; 
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface FitnessChatbotDialogProps {
  children: React.ReactNode; 
  dict: { 
    dialogTitle?: string;
    dialogDescription?: string;
    inputPlaceholder?: string;
    initialMessage?: string;
    errorMessage?: string;
    sendButtonSR?: string;
    quickPromptsTitle?: string;
    quickPrompts?: string[];
  };
}

export function FitnessChatbotDialog({ children, dict }: FitnessChatbotDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const rotateTimerRef = useRef<number | null>(null);
  // Get language from html tag set by app layout
  const appLang = typeof document !== 'undefined' ? (document.documentElement.getAttribute('lang') || 'en') : 'en';
  
  // Render assistant text into tidy blocks: lists, paragraphs, line breaks
  const MessageContent = ({ text }: { text: string }) => {
    const normalized = (text || '').trim();
    if (!normalized) return null;
    // Basic formatting: convert markdown-like bullets into list, split paragraphs
    const lines = normalized.split(/\n+/).filter(Boolean);
    const bulletRegex = /^\s*([-*•]|\d+\.)\s+/;
    const blocks: Array<{ type: 'list' | 'p'; items?: string[]; text?: string }> = [];
    let currentList: string[] | null = null;
    for (const line of lines) {
      if (bulletRegex.test(line)) {
        if (!currentList) currentList = [];
        currentList.push(line.replace(bulletRegex, '').trim());
      } else {
        if (currentList && currentList.length) {
          blocks.push({ type: 'list', items: currentList });
          currentList = null;
        }
        blocks.push({ type: 'p', text: line.trim() });
      }
    }
    if (currentList && currentList.length) blocks.push({ type: 'list', items: currentList });

    return (
      <div className="space-y-2">
        {blocks.map((b, i) => b.type === 'list' ? (
          <ul key={i} className="list-disc pl-5 space-y-1">
            {b.items!.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        ))}
      </div>
    );
  };
  const defaultQuick = [
    'Clean bulk meal plan',
    'Warm-up before leg day',
    'How to stop calf cramps?',
    'Beginner 20‑min HIIT',
    'Protein timing around workouts',
    'Mobility routine for desk workers',
    'Beginner pull day plan',
    'Low-impact cardio ideas',
    'Healthy snacks high in protein',
    'Reduce knee pain during squats',
    'Core routine 10 minutes',
    'Lose fat while keeping muscle',
    'Hydration strategy on training days',
    'Pre-workout meal examples',
    'Post-workout recovery tips',
    'Fix shoulder rounding posture',
    'At-home workout no equipment',
    'Deload week guidelines',
    'RPE vs % and how to use it',
    'Weekly split for beginners',
  ];

  const handleSendMessage = async () => {
    if (currentMessage.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fitnessChat({ question: newUserMessage.content, language: (appLang as any) });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling fitness chat flow:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: dict?.errorMessage || "Sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth auto-scroll to bottom on new messages
  useEffect(() => {
    const container = scrollAreaRef.current as unknown as HTMLElement | null;
    if (!container) return;
    const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    const target = viewport || container;
    try {
      target.scrollTo({ top: target.scrollHeight, behavior: 'smooth' });
    } catch {
      target.scrollTop = target.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'initial-bot-message',
          role: 'assistant',
          content: dict?.initialMessage || "Hello! I'm Daily Sweat AI. Ask me anything about fitness, nutrition, or your workouts!",
        },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, messages.length, dict?.initialMessage]);

  // Suggestions pool + auto-rotate
  useEffect(() => {
    const pool = (dict?.quickPrompts && dict.quickPrompts.length > 0) ? dict.quickPrompts.slice() : defaultQuick.slice();
    const shuffled = shuffle(pool);
    setMessages(m => m); // no-op to keep dependency list lint calm
    setVisible(shuffled.slice(0, 4));
    if (rotateTimerRef.current) window.clearInterval(rotateTimerRef.current);
    rotateTimerRef.current = window.setInterval(() => {
      setVisible(shuffle(pool).slice(0, 4));
    }, 6000);
    return () => { if (rotateTimerRef.current) window.clearInterval(rotateTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dict?.quickPrompts, isOpen]);

  const [visible, setVisible] = useState<string[]>([]);
  const shuffle = (arr: string[]) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] md:h-[65vh] lg:h-[60vh] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <Bot className="mr-2 h-6 w-6 text-primary" />
            {dict?.dialogTitle || "Daily Sweat AI Chat"}
          </SheetTitle>
          <SheetDescription>
            {dict?.dialogDescription || "Ask any fitness or nutrition related questions."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow px-3 py-3 md:px-4 space-y-3 overscroll-contain" ref={scrollAreaRef}>
          {/* Quick prompts compact row */}
          <div className="mb-1 flex flex-wrap gap-1 transition-opacity duration-300">
            {(visible.length ? visible : (dict?.quickPrompts && dict.quickPrompts.length > 0 ? dict.quickPrompts.slice(0,4) : defaultQuick.slice(0,4)))
              .map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentMessage(p)}
                className="text-xs px-2 py-1 rounded-full border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-transform active:scale-[.98]"
              >
                {p}
              </button>
            ))}
          </div>
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                'flex items-end space-x-2 max-w-[85%] sm:max-w-[75%]',
                message.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Bot className="h-6 w-6 text-primary mb-1 shrink-0" />
              )}
              <div
                className={cn(
                  'p-3 rounded-2xl shadow-sm break-words text-sm leading-6',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                <MessageContent text={message.content} />
              </div>
              {message.role === 'user' && (
                <User className="h-6 w-6 text-secondary-foreground mb-1 shrink-0" />
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 mr-auto justify-start">
              <Bot className="h-6 w-6 text-primary mb-1" />
              <div className="p-3 rounded-lg bg-muted text-muted-foreground shadow-md">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </ScrollArea>
        <SheetFooter className="p-4 border-t bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder={dict?.inputPlaceholder || "Ask about exercises, diet, etc..."}
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || currentMessage.trim() === ''} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">{dict?.sendButtonSR || "Send message"}</span>
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

