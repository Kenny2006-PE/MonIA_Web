import Link from "next/link";
import styles from "./page.module.css";
import { getThreads, createThread } from "@/app/actions/chat";
import { redirect } from "next/navigation";

export default async function ChatListPage() {
  const threads = await getThreads();

  const handleNewChat = async () => {
    "use server";
    const newThread = await createThread();
    redirect(`/chat/${newThread.id}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Asistente Financiero</h1>
        <p className={styles.subtitle}>Tus conversaciones guardadas</p>
      </header>

      <section className={styles.actionSection}>
        <form action={handleNewChat}>
          <button type="submit" className={styles.newChatButton} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="9" x2="12" y2="15"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
            </svg>
            Nueva Asesoría IA
          </button>
        </form>
      </section>

      <section className={styles.threadList}>
        <h2 className={styles.listHeader}>Historial</h2>
        
        <div className={styles.listContainer}>
          {threads.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem 0' }}>
              No tienes chats guardados. ¡Inicia uno nuevo!
            </p>
          )}
          {threads.map((thread) => {
            const lastMsg = thread.messages?.[0]?.content || "Inicia tu consulta...";
            return (
              <Link href={`/chat/${thread.id}`} key={thread.id} className={styles.threadItem}>
                <div className={styles.threadIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className={styles.threadContent}>
                  <div className={styles.threadTopRow}>
                    <h3 className={styles.threadTitle}>
                      {thread.title}
                    </h3>
                    <span className={styles.threadDate}>
                      {new Date(thread.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={styles.threadPreview}>{lastMsg.length > 50 ? lastMsg.substring(0,50) + "..." : lastMsg}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  );
}
