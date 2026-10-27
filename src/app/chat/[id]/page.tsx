import { getMessages } from "@/app/actions/chat";
import styles from "./chat.module.css";

import ChatClient from "./ChatClient";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ChatSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: threadId } = await params;
  
  // Verify thread exists
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId }
  });

  if (!thread) {
    notFound();
  }

  const messages = await getMessages(threadId);

  return (
    <div className={styles.container}>
      <ChatClient 
        threadId={threadId} 
        initialTitle={thread.title} 
        initialMessages={messages} 
      />
    </div>
  );
}
