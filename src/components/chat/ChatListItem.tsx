"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/app/chat/page.module.css";
import { deleteThread } from "@/app/actions/chat";

interface ChatListItemProps {
  id: string;
  title: string;
  updatedAt: string | Date;
  lastMsg: string;
}

export default function ChatListItem({ id, title, updatedAt, lastMsg }: ChatListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`¿Eliminar la conversación "${title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteThread(id);
      setIsDeleted(true);
    } catch (err) {
      console.error("Error al eliminar chat:", err);
      setIsDeleting(false);
    }
  };

  if (isDeleted) return null;

  return (
    <div className={`${styles.threadItemWrapper} ${isDeleting ? styles.itemDeleting : ""}`}>
      <Link href={`/chat/${id}`} className={styles.threadItem}>
        <div className={styles.threadIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div className={styles.threadContent}>
          <div className={styles.threadTopRow}>
            <h3 className={styles.threadTitle}>{title}</h3>
            <span className={styles.threadDate}>
              {new Date(updatedAt).toLocaleDateString()}
            </span>
          </div>
          <p className={styles.threadPreview}>
            {lastMsg.length > 50 ? lastMsg.substring(0, 50) + "..." : lastMsg}
          </p>
        </div>
      </Link>

      <button
        type="button"
        className={styles.deleteButton}
        onClick={handleDelete}
        disabled={isDeleting}
        title="Eliminar conversación"
        aria-label="Eliminar conversación"
      >
        {isDeleting ? (
          <div className={styles.deleteSpinner} />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        )}
      </button>
    </div>
  );
}
