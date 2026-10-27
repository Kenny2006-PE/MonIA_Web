"use client";

import { useState } from "react";
import styles from "./WalletCard.module.css";

interface WalletCardProps {
  type: "DEBIT" | "CREDIT";
  name: string;
  balanceOrLimit: number;
  bankName?: string;
  onEdit?: () => void;
}

export default function WalletCard({ type, name, balanceOrLimit, bankName = "Banco", onEdit }: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(false);
  const isCredit = type === "CREDIT";
  
  const formattedAmount = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(balanceOrLimit);

  return (
    <div className={`${styles.walletCard} ${isCredit ? styles.creditBg : styles.debitBg}`}>
      <div className={styles.cardHeader}>
        <div className={styles.bankAndType}>
          <span className={styles.bankName}>{bankName}</span>
          <span className={styles.cardType}>{isCredit ? "Crédito" : "Débito"}</span>
        </div>
        {onEdit && (
          <button className={styles.editButton} onClick={onEdit} title="Editar tarjeta">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
        )}
      </div>
      
      <div className={styles.cardChip}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 32 24" fill="none">
          <rect width="32" height="24" rx="4" fill="#E8D18C" fillOpacity="0.8"/>
          <path d="M8 0V24M24 0V24M0 8H32M0 16H32" stroke="#B89B48" strokeWidth="1" opacity="0.6"/>
        </svg>
      </div>
      
      <div className={styles.cardBody}>
      </div>
      
      <div className={styles.cardFooter}>
        <div className={styles.balanceSection}>
          <div className={styles.balanceHeader}>
            <span className={styles.balanceLabel}>{isCredit ? "Límite Disponible" : "Saldo Actual"}</span>
            <button 
              className={styles.eyeButton} 
              onClick={(e) => {
                e.stopPropagation();
                setShowBalance(!showBalance);
              }}
              title={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
            >
              {showBalance ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              )}
            </button>
          </div>
          <span className={styles.balanceAmount}>
            {showBalance ? formattedAmount : "S/ ***.**"}
          </span>
        </div>
        <div className={styles.cardName} title={name}>{name}</div>
      </div>
    </div>
  );
}
