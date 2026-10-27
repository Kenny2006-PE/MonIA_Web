"use client";

import { useState, useEffect } from "react";
import WalletCard from "@/components/WalletCard";
import AddCardModal, { CardData } from "@/components/AddCardModal";
import styles from "./page.module.css";
import { getAccounts, getDefaultUser, updateIncome } from "@/app/actions/wallet";

export default function WalletPage() {
  const [showIncome, setShowIncome] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // Income Editing State
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState("");
  const [isSavingIncome, setIsSavingIncome] = useState(false);

  // Real data state
  const [myCards, setMyCards] = useState<(CardData & { balanceOrLimit: number; bankName: string })[]>([]);
  const [netIncome, setNetIncome] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
      const user = await getDefaultUser();
      setNetIncome(user.netIncome);
      setTempIncome(user.netIncome.toString());
      
      const accounts = await getAccounts();
      setMyCards(accounts.map(acc => ({
        ...acc,
        type: acc.type as "DEBIT" | "CREDIT",
        balanceOrLimit: (acc.type === 'CREDIT' ? acc.creditLimit : acc.balance) ?? 0,
        bankName: acc.name.split(' ')[0] || "Banco",
      })));
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const user = await getDefaultUser();
        if (!isMounted) return;
        setNetIncome(user.netIncome);
        setTempIncome(user.netIncome.toString());
        
        const accounts = await getAccounts();
        if (!isMounted) return;
        setMyCards(accounts.map(acc => ({
          ...acc,
          type: acc.type as "DEBIT" | "CREDIT",
          balanceOrLimit: (acc.type === 'CREDIT' ? acc.creditLimit : acc.balance) ?? 0,
          bankName: acc.name.split(' ')[0] || "Banco",
        })));
      } catch (error) {
        console.error("Error loading wallet data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveIncome = async () => {
    setIsSavingIncome(true);
    try {
      const parsedIncome = parseFloat(tempIncome);
      if (!isNaN(parsedIncome)) {
        await updateIncome(parsedIncome);
        setNetIncome(parsedIncome);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSavingIncome(false);
    setIsEditingIncome(false);
  };

  const handleAddCard = () => {
    setModalMode("add");
    setSelectedCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: CardData & { balanceOrLimit: number; bankName: string }) => {
    setModalMode("edit");
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    refreshData();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mi Billetera</h1>
        <p className={styles.subtitle}>Gestiona tus tarjetas e ingresos</p>
      </header>

      <section className={styles.incomeSection}>
        <div className={styles.incomeCard}>
          <div className={styles.incomeInfo}>
            <div className={styles.incomeHeaderRow}>
              <span className={styles.incomeLabel}>Ingreso Mensual Neto</span>
              <button 
                className={styles.eyeButtonInline}
                onClick={() => setShowIncome(!showIncome)}
              >
                {showIncome ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                )}
              </button>
            </div>
            <span className={styles.incomeAmount}>
              {isEditingIncome ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>S/</span>
                  <input 
                    type="number" 
                    className="input-field"
                    value={tempIncome} 
                    onChange={e => setTempIncome(e.target.value)}
                    style={{ width: '120px', padding: '8px', fontSize: '1.2rem', marginTop: 0 }}
                    autoFocus
                  />
                  <button className="btn-primary" style={{ padding: '8px 12px' }} onClick={handleSaveIncome} disabled={isSavingIncome}>
                    {isSavingIncome ? "..." : "Guardar"}
                  </button>
                  <button className="btn-secondary" style={{ padding: '8px 12px', border: 'none' }} onClick={() => setIsEditingIncome(false)}>
                    X
                  </button>
                </div>
              ) : (
                showIncome ? `S/ ${netIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : "S/ ***.**"
              )}
            </span>
          </div>
          {!isEditingIncome && (
            <button className={styles.editButton} onClick={() => setIsEditingIncome(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
          )}
        </div>
      </section>

      <section className={styles.cardsSection}>
        <div className={styles.sectionHeader}>
          <h2>Tus Tarjetas</h2>
          <button className={styles.addButton} onClick={handleAddCard}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div className={styles.cardsList}>
          {isLoading ? (
            <p style={{ textAlign: "center", opacity: 0.5, padding: "2rem 0" }}>Cargando tarjetas...</p>
          ) : myCards.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.5, padding: "2rem 0" }}>
              No tienes tarjetas registradas aún. ¡Agrega una con el botón +!
            </p>
          ) : (
            myCards.map((card) => (
              <WalletCard 
                key={card.id}
                type={card.type} 
                name={card.alias ? `${card.name} (${card.alias})` : card.name} 
                balanceOrLimit={card.balanceOrLimit || 0} 
                bankName={card.bankName} 
                onEdit={() => handleEditCard(card)}
              />
            ))
          )}
        </div>
      </section>
      
      <AddCardModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        initialData={selectedCard}
        mode={modalMode}
      />
    </div>
  );
}
