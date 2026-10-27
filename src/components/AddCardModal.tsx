"use client";

import { useState } from "react";
import styles from "./AddCardModal.module.css";
import { saveAccount } from "@/app/actions/wallet";

export interface CardData {
  id?: string;
  type: "DEBIT" | "CREDIT";
  name: string;
  alias?: string;
  creditLimit?: number | null;
  currentDebt?: number | null;
  tea?: number | null;
  billingDay?: number | null;
  tcea?: number | null;
  balance?: number | null;
  trea?: number | null;
  maintenanceFee?: number | null;
  bankName?: string;
}

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CardData | null;
  mode?: "add" | "edit";
}

function AddCardForm({
  onClose,
  initialData,
  mode = "add"
}: {
  onClose: () => void;
  initialData?: CardData | null;
  mode?: "add" | "edit";
}) {
  const isEditMode = mode === "edit" && !!initialData;
  const [cardType, setCardType] = useState<"DEBIT" | "CREDIT">(initialData?.type || "CREDIT");
  const [cardName, setCardName] = useState(initialData?.name || "");
  const [cardAlias, setCardAlias] = useState(initialData?.alias || "");
  
  // Extra fields
  const [limit, setLimit] = useState(initialData?.creditLimit?.toString() || "");
  const [debt, setDebt] = useState(initialData?.currentDebt?.toString() || "");
  const [tea, setTea] = useState(initialData?.tea?.toString() || "");
  const [billingDay, setBillingDay] = useState(initialData?.billingDay?.toString() || "");
  
  const [balance, setBalance] = useState(initialData?.balance?.toString() || "");
  const [trea, setTrea] = useState(initialData?.trea?.toString() || "");
  const [maintenance, setMaintenance] = useState(initialData?.maintenanceFee?.toString() || "");

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!cardName) return;
    setIsSaving(true);
    
    try {
      await saveAccount({
        id: isEditMode ? initialData?.id : undefined,
        type: cardType,
        name: cardAlias ? `${cardName} (${cardAlias})` : cardName,
        creditLimit: limit,
        currentDebt: debt,
        tea: tea,
        billingDay: billingDay,
        balance: balance,
        trea: trea,
        maintenanceFee: maintenance
      });
      onClose();
    } catch (error) {
      console.error("Failed to save account", error);
    }
    setIsSaving(false);
  };

  return (
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h2>{isEditMode ? "Editar Tarjeta" : "Agregar Nueva Tarjeta"}</h2>
        <button className={styles.closeButton} onClick={onClose} disabled={isSaving}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className={styles.formGroup}>
        <label>Tipo de Tarjeta</label>
        <div className={styles.typeSelector}>
          <button 
            className={`${styles.typeButton} ${cardType === "CREDIT" ? styles.activeType : ""}`}
            onClick={() => {
              if (!isEditMode) setCardType("CREDIT");
            }}
            disabled={isEditMode || isSaving}
            style={{ opacity: isEditMode && cardType !== "CREDIT" ? 0.5 : 1, cursor: isEditMode ? "not-allowed" : "pointer" }}
          >
            Crédito
          </button>
          <button 
            className={`${styles.typeButton} ${cardType === "DEBIT" ? styles.activeType : ""}`}
            onClick={() => {
              if (!isEditMode) setCardType("DEBIT");
            }}
            disabled={isEditMode || isSaving}
            style={{ opacity: isEditMode && cardType !== "DEBIT" ? 0.5 : 1, cursor: isEditMode ? "not-allowed" : "pointer" }}
          >
            Débito
          </button>
        </div>
        {isEditMode && <p className={styles.hintText} style={{ marginTop: '8px' }}>El tipo de tarjeta no se puede cambiar al editar.</p>}
      </div>

      <div className={styles.formGroup}>
        <label>Producto Financiero (Banco y Tarjeta)</label>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Ej: Interbank Amex Gold, BCP Sueldo..." 
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          disabled={isSaving}
        />
        <button className={styles.aiButtonBlock} title="Autocompletar Inteligente" disabled={isSaving}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/>
            <path d="m14 7 3 3"/>
            <path d="M5 6v4"/>
            <path d="M19 14v4"/>
            <path d="M10 2v2"/>
            <path d="M7 8H3"/>
            <path d="M21 16h-4"/>
            <path d="M11 3H9"/>
          </svg>
          Autocompletar con IA
        </button>
      </div>

      <div className={styles.formGroup}>
        <label>Apodo de la Tarjeta (Opcional)</label>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Ej: Para Streaming, Gastos Diarios, Viajes..." 
          value={cardAlias}
          onChange={(e) => setCardAlias(e.target.value)}
          disabled={isSaving}
        />
        <p className={styles.hintText}>Esto ayuda a la IA a entender para qué usas esta tarjeta y darte mejores consejos.</p>
      </div>

      {/* Dynamic Fields based on Type */}
      {cardType === "CREDIT" ? (
        <div className={styles.dynamicGrid}>
          <div className={styles.formGroup}>
            <label>Límite de Crédito (S/)</label>
            <input type="number" className="input-field" placeholder="0.00" value={limit} onChange={e => setLimit(e.target.value)} disabled={isSaving}/>
          </div>
          <div className={styles.formGroup}>
            <label>Deuda Actual (S/)</label>
            <input type="number" className="input-field" placeholder="0.00" value={debt} onChange={e => setDebt(e.target.value)} disabled={isSaving}/>
          </div>
          <div className={styles.formGroup}>
            <label>TEA (%)</label>
            <input type="number" className="input-field" placeholder="0.00" value={tea} onChange={e => setTea(e.target.value)} disabled={isSaving}/>
          </div>
          <div className={styles.formGroup}>
            <label>Día de Corte</label>
            <input type="number" className="input-field" placeholder="Ej: 15" min="1" max="31" value={billingDay} onChange={e => setBillingDay(e.target.value)} disabled={isSaving}/>
          </div>
        </div>
      ) : (
        <div className={styles.dynamicGrid}>
          <div className={styles.formGroup}>
            <label>Saldo Actual (S/)</label>
            <input type="number" className="input-field" placeholder="0.00" value={balance} onChange={e => setBalance(e.target.value)} disabled={isSaving}/>
          </div>
          <div className={styles.formGroup}>
            <label>TREA (%)</label>
            <input type="number" className="input-field" placeholder="0.00" value={trea} onChange={e => setTrea(e.target.value)} disabled={isSaving}/>
          </div>
          <div className={styles.formGroup}>
            <label>Comisión Mantenimiento (S/)</label>
            <input type="number" className="input-field" placeholder="0.00" value={maintenance} onChange={e => setMaintenance(e.target.value)} disabled={isSaving}/>
          </div>
        </div>
      )}

      <div className={styles.modalFooter}>
        <button className="btn-secondary" onClick={onClose} disabled={isSaving}>Cancelar</button>
        <button className="btn-primary" onClick={handleSave} disabled={isSaving || !cardName}>
          {isSaving ? "Guardando..." : (isEditMode ? "Guardar Cambios" : "Guardar Tarjeta")}
        </button>
      </div>
    </div>
  );
}

export default function AddCardModal({ isOpen, onClose, initialData, mode = "add" }: AddCardModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <AddCardForm 
        key={initialData?.id || mode}
        onClose={onClose}
        initialData={initialData}
        mode={mode}
      />
    </div>
  );
}
