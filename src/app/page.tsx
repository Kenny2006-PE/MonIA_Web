import Link from "next/link";
import styles from "./page.module.css";
import { getDefaultUser, getAccounts } from "@/app/actions/wallet";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getDefaultUser();
  const accounts = await getAccounts();

  // Calcular métricas reales a partir de las cuentas
  const debitTotal = accounts
    .filter((a) => a.type === "DEBIT")
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const totalDebt = accounts
    .filter((a) => a.type === "CREDIT")
    .reduce((sum, a) => sum + (a.currentDebt || 0), 0);

  // Liquidez real: saldo en débito si tiene cuentas registradas, o su sueldo neto
  const availableLiquidity = debitTotal > 0 ? debitTotal : user.netIncome;

  // Cálculo inteligente de Salud Financiera
  let healthScore = 95;
  let healthMessage = "¡Excelente! Mantienes tus finanzas y deudas bajo control.";

  if (user.netIncome > 0 && totalDebt > 0) {
    const debtRatio = totalDebt / user.netIncome;
    if (debtRatio <= 0.2) {
      healthScore = 90;
      healthMessage = "¡Excelente! Tu nivel de endeudamiento es muy bajo (<20%).";
    } else if (debtRatio <= 0.4) {
      healthScore = 78;
      healthMessage = "Saludable: Mantienes un endeudamiento moderado dentro de tus ingresos.";
    } else if (debtRatio <= 0.7) {
      healthScore = 60;
      healthMessage = "Precaución: Tus deudas representan más del 40% de tu sueldo mensual.";
    } else {
      healthScore = 40;
      healthMessage = "Alerta: Tu deuda supera el 70% de tus ingresos. Es prioritario amortizar.";
    }
  } else if (totalDebt === 0) {
    healthScore = 95;
    healthMessage = "¡Excelente! No registras deudas de crédito activas.";
  }

  // Recomendación inteligente para la tarjeta de IA
  const highestTeaCard = accounts
    .filter((a) => a.type === "CREDIT" && (a.currentDebt || 0) > 0 && a.tea)
    .sort((a, b) => (b.tea || 0) - (a.tea || 0))[0];

  let aiRecommendationText = "Tienes saldo suficiente para organizar tus finanzas del mes. ¿Armamos un presupuesto?";
  if (highestTeaCard) {
    aiRecommendationText = `Tu tarjeta ${highestTeaCard.name} tiene una TEA de ${highestTeaCard.tea}%. Te conviene priorizar amortizar su deuda de S/ ${highestTeaCard.currentDebt?.toLocaleString()} para evitar intereses.`;
  } else if (availableLiquidity > 3000) {
    aiRecommendationText = "Cuentas con buena liquidez este mes. ¿Quieres evaluar opciones seguras de ahorro o metas?";
  }

  const monthlyHistory = [
    { month: "Octubre", income: user.netIncome, expenses: Math.round(totalDebt * 0.4 + user.netIncome * 0.5) },
    { month: "Septiembre", income: user.netIncome, expenses: Math.round(user.netIncome * 0.65) },
    { month: "Agosto", income: user.netIncome, expenses: Math.round(user.netIncome * 0.6) },
  ];

  const goal = {
    name: "Fondo de Emergencia",
    target: user.netIncome * 3,
    current: Math.min(availableLiquidity, user.netIncome * 3),
  };
  
  const goalProgress = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.greeting}>
          <h1 className={styles.title}>Hola, {user.name} 👋</h1>
          <p className={styles.subtitle}>Tu resumen financiero al día</p>
        </div>
        <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
      </header>

      <div className={styles.dashboardGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.heroSection}>
            {/* Health Score Widget */}
            <div className={styles.scoreCard}>
              <div className={styles.scoreRing}>
                <svg viewBox="0 0 36 36" className={styles.circularChart}>
                  <path className={styles.circleBg}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className={styles.circle}
                    strokeDasharray={`${healthScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className={styles.scoreValue}>{healthScore}</div>
              </div>
              <div className={styles.scoreInfo}>
                <h3>Salud Financiera</h3>
                <p>{healthMessage}</p>
              </div>
            </div>

            {/* Liquidity */}
            <div className={styles.liquidityCard}>
              <p className={styles.liquidityLabel}>Liquidez Disponible</p>
              <h2 className={styles.liquidityAmount}>
                S/ {availableLiquidity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </section>

          {/* AI Alert Card */}
          <section className={styles.aiAlertSection}>
            <Link href="/chat/new" className={styles.aiAlertCard}>
              <div className={styles.aiAlertIcon}>✨</div>
              <div className={styles.aiAlertContent}>
                <h4>Recomendación de la IA</h4>
                <p>{aiRecommendationText}</p>
              </div>
              <div className={styles.aiAlertAction}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </Link>
          </section>
        </div>

        <div className={styles.columnRight}>
          {/* Monthly History Table Equivalent */}
          <section className={styles.historySection}>
            <h3 className={styles.sectionTitle}>Historial Estimado</h3>
            <div className={styles.historyList}>
              {monthlyHistory.map((data, index) => {
                const balance = data.income - data.expenses;
                return (
                  <div key={index} className={styles.historyRow}>
                    <div className={styles.historyMonth}>{data.month}</div>
                    <div className={styles.historyStats}>
                      <div className={styles.historyStat}>
                        <span className={styles.statLabel}>Ingresos</span>
                        <span className={styles.statIncome}>S/ {data.income.toLocaleString()}</span>
                      </div>
                      <div className={styles.historyStat}>
                        <span className={styles.statLabel}>Gastos</span>
                        <span className={styles.statExpense}>S/ {data.expenses.toLocaleString()}</span>
                      </div>
                      <div className={styles.historyStat}>
                        <span className={styles.statLabel}>Balance</span>
                        <span className={styles.statBalance}>S/ {balance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Goals Progress */}
          <section className={styles.goalSection}>
            <h3 className={styles.sectionTitle}>Metas Activas</h3>
            <div className={styles.goalCard}>
              <div className={styles.goalHeader}>
                <span className={styles.goalName}>{goal.name}</span>
                <span className={styles.goalPercent}>{Math.round(goalProgress)}%</span>
              </div>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${goalProgress}%` }}></div>
              </div>
              <div className={styles.goalFooter}>
                <span>S/ {goal.current.toLocaleString()}</span>
                <span>Objetivo: S/ {goal.target.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
