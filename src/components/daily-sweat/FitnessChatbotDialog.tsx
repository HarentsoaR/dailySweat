
"use client";

import { fitnessChat } from '@/ai/flows/fitness-chat-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Bot, Send, User, Loader2 } from 'lucide-react'; // Removed MessageSquare as it's used for trigger
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface FitnessChatbotDialogProps {
  children: React.ReactNode; // For the trigger button
  dict: { // Dictionary for this component
    dialogTitle: string;
    dialogDescription: string;
    inputPlaceholder: string;
    initialMessage: string;
    errorMessage: string;
  };
}

export function FitnessChatbotDialog({ children, dict }: FitnessChatbotDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      const response = await fitnessChat({ question: newUserMessage.content });
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
        content: dict.errorMessage,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'initial-bot-message',
          role: 'assistant',
          content: dict.initialMessage,
        },
      ]);
    }
  }, [isOpen, messages.length, dict.initialMessage]);


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <Bot className="mr-2 h-6 w-6 text-primary" />
            {dict.dialogTitle}
          </SheetTitle>
          <SheetDescription>
            {dict.dialogDescription}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
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
                  'p-3 rounded-lg shadow-md break-words',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <p className="text-sm">{message.content}</p>
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
              placeholder={dict.inputPlaceholder}
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || currentMessage.trim() === ''} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

