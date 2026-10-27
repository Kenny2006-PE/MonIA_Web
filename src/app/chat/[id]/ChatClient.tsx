"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./chat.module.css";
import { sendMessageToAI } from "@/app/actions/chat";
import ReactMarkdown from 'react-markdown';

import Link from "next/link";

interface Message {
  id: string;
  role: string;
  content: string;
  isNew?: boolean;
}

// Componente para escribir poco a poco
function TypewriterMarkdown({ content, onTyping }: { content: string; onTyping: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const onTypingRef = useRef(onTyping);
  useEffect(() => {
    onTypingRef.current = onTyping;
  });

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(content.slice(0, i));
      if (i % 3 === 0) onTypingRef.current();
      if (i >= content.length) {
        clearInterval(interval);
        onTypingRef.current();
      }
    }, 15);
    return () => clearInterval(interval);
  }, [content]);

  return <ReactMarkdown>{displayed}</ReactMarkdown>;
}

export default function ChatClient({ 
  threadId, 
  initialTitle, 
  initialMessages 
}: { 
  threadId: string; 
  initialTitle: string; 
  initialMessages: Message[]; 
}) {
  const [title, setTitle] = useState(initialTitle);
  const [messages, setMessages] = useState<Message[]>(initialMessages.map(m => ({ ...m, isNew: false })));
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: "user", content: userMsg, isNew: false }]);
    setIsLoading(true);

    try {
      const result = await sendMessageToAI(threadId, userMsg);
      const responseText = typeof result === "string" ? result : result.aiResponse;
      const newTitle = typeof result === "object" ? result.threadTitle : undefined;
      
      if (newTitle) {
        setTitle(newTitle);
      }

      setMessages(prev => [...prev, { id: Date.now().toString() + "ai", role: "model", content: responseText, isNew: true }]);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "desconocido";
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString() + "err", role: "model", content: "Error: " + errorMsg, isNew: true }]);
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <header className={styles.header}>
        <Link href="/chat" className={styles.backButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>
        <h1 className={styles.title}>{title}</h1>
      </header>

      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>
            <p>Escribe tu consulta financiera abajo.</p>
            <p style={{ fontSize: '0.9rem' }}>Ejemplo: &ldquo;¿Me alcanza para una moto?&rdquo;</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
            <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble}`}>
              {msg.isNew && msg.role === 'model' ? (
                <TypewriterMarkdown content={msg.content} onTyping={scrollToBottom} />
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.aiMessage}`}>
            <div className={`${styles.messageBubble} ${styles.aiBubble}`}>
              Escribiendo...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input 
          type="text" 
          className={styles.input} 
          placeholder="Escribe un mensaje..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className={styles.sendButton} disabled={!input.trim() || isLoading}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </>
  );
}
