'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Paperclip, Image as ImageIcon, Send } from 'lucide-react';
import { TextAnimate } from '../magicui/text-animate';
import { cn } from '@/lib/utils';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'admin';
}

const demoMessages: Message[] = [
    { id: 1, text: 'Hello! How can I help you with our products today?', sender: 'admin' },
    { id: 2, text: "I'm looking for information on the latest sneaker releases.", sender: 'user' },
    {
        id: 3,
        text: 'Sure! Our latest collection, the "Vertex Glide", just dropped. They feature enhanced cushioning and a breathable mesh upper. Would you like to know more about specific sizes or colors?',
        sender: 'admin',
    },
];

const suggestedPrompts = [
    { title: 'Write a to-do list for a personal project or task', icon: '👤' },
    { title: 'Generate an email reply to a job offer', icon: '✉️' },
    { title: 'Summarise this article or text for me in one paragraph', icon: '📄' },
    { title: 'How does AI work in a technical capacity', icon: '⚙️' },
];

interface ChatUIProps {
    onChatSubmit: () => void;
    className?: string;
    isChatActive: boolean;
}

const ChatUI: React.FC<ChatUIProps> = ({ onChatSubmit, className, isChatActive }) => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isChatActive && messages.length === 0) {
            setMessages(demoMessages);
        }
    }, [isChatActive]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = () => {
        if (inputValue.trim()) {
            const newUserMessage: Message = {
                id: Date.now(),
                text: inputValue,
                sender: 'user',
            };
            setMessages((prevMessages) => [...prevMessages, newUserMessage]);

            setTimeout(() => {
                const adminResponse: Message = {
                    id: Date.now() + 1,
                    text: `Thanks for asking about "${inputValue}"! Let me find that information for you.`,
                    sender: 'admin',
                };
                setMessages((prevMessages) => [...prevMessages, adminResponse]);
            }, 1000);

            onChatSubmit();
            setInputValue('');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    const cardTitleContent = useMemo(
        () => (
            <div className={cn('flex flex-row items-center gap-2', isChatActive ? 'justify-start' : 'justify-center')}>
                {!isChatActive && (
                    <TextAnimate animation="blurIn" as="h1" once={true}>
                        Welcome to
                    </TextAnimate>
                )}
                <TextAnimate animation="blurIn" as="h1" className="text-blue-500" delay={0.5} once={true}>
                    {isChatActive ? 'Scarlet Vertigo AI Assistant' : 'Scarlet Vertigo'}
                </TextAnimate>
            </div>
        ),
        [isChatActive],
    );

    return (
        <Card className={cn('max-w-3xl shadow-lg flex flex-col', className)}>
            <CardHeader className={cn('border-b', isChatActive ? 'text-left p-3' : 'text-center p-6')}>
                <CardTitle className={cn('font-bold', isChatActive ? 'text-xl' : 'text-3xl')}>{cardTitleContent}</CardTitle>
                {!isChatActive && (
                    <>
                        <CardDescription className="text-lg text-muted-foreground">What would you like to order today?</CardDescription>
                        <p className="text-sm text-muted-foreground pt-2 mt-5">Use common prompts below</p>
                    </>
                )}
            </CardHeader>

            {isChatActive && (
                <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 h-[50vh]">
                    {messages.map((message) => (
                        <div key={message.id} className={cn('flex', message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                            <div className={cn('p-3 rounded-lg max-w-[75%]', message.sender === 'user' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800')}>{message.text}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
            )}

            {!isChatActive && (
                <CardContent className="flex flex-wrap justify-center gap-4 p-4 flex-grow overflow-y-auto">
                    {suggestedPrompts.map((prompt, index) => (
                        <Button key={index} variant="outline" className="flex-grow sm:flex-grow-0 w-full sm:w-auto h-auto p-4 text-left justify-start items-start flex-col">
                            <span className="text-sm font-medium">{prompt.title}</span>
                        </Button>
                    ))}
                </CardContent>
            )}
            <CardFooter className="flex flex-col items-start gap-2 p-4 border-t mt-auto">
                <div className="flex w-full items-center gap-2">
                    <Input placeholder="Ask whatever you want about our products..." className="flex-1" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />

                    <Button size="icon" onClick={handleSubmit}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex justify-between w-full items-center">
                    <span className="text-xs text-muted-foreground">0/300</span>
                    <Button variant="outline" size="sm" className="text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0 1 12 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253m0 0A11.978 11.978 0 0 0 12 16.5c2.998 0 5.74-1.1 7.843-2.918"
                            />
                        </svg>
                        Scarlet Knowledge Base
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default ChatUI;
