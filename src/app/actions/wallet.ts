"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Obtener o crear un usuario por defecto
export async function getDefaultUser() {
  let user = await prisma.user.findFirst();
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Marco",
        netIncome: 4500,
        grossIncome: 5000,
      }
    });
  }
  
  return user;
}

// 2. Obtener las tarjetas
export async function getAccounts() {
  const user = await getDefaultUser();
  return prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" }
  });
}

export interface AccountFormData {
  id?: string;
  type: "DEBIT" | "CREDIT" | string;
  name: string;
  balance?: string | number | null;
  maintenanceFee?: string | number | null;
  trea?: string | number | null;
  creditLimit?: string | number | null;
  currentDebt?: string | number | null;
  tea?: string | number | null;
  billingDay?: string | number | null;
  tcea?: string | number | null;
}

// 3. Crear o actualizar tarjeta
export async function saveAccount(formData: AccountFormData) {
  const user = await getDefaultUser();
  
  const parseNum = (val: string | number | null | undefined): number | null => {
    if (val === null || val === undefined || val === "") return null;
    const parsed = typeof val === "number" ? val : parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  };

  const parseIntNum = (val: string | number | null | undefined): number | null => {
    if (val === null || val === undefined || val === "") return null;
    const parsed = typeof val === "number" ? Math.floor(val) : parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  };

  const dataToSave = {
    userId: user.id,
    type: formData.type,
    name: formData.name,
    balance: parseNum(formData.balance),
    maintenanceFee: parseNum(formData.maintenanceFee),
    trea: parseNum(formData.trea),
    creditLimit: parseNum(formData.creditLimit),
    currentDebt: parseNum(formData.currentDebt),
    tea: parseNum(formData.tea),
    billingDay: parseIntNum(formData.billingDay),
    tcea: parseNum(formData.tcea),
  };

  if (formData.id) {
    // Actualizar
    await prisma.account.update({
      where: { id: formData.id },
      data: dataToSave
    });
  } else {
    // Crear nueva
    await prisma.account.create({
      data: dataToSave
    });
  }

  // Refrescar los datos cacheados en la ruta /wallet
  revalidatePath("/wallet");
}

// 5. Actualizar Ingreso Neto
export async function updateIncome(newIncome: number) {
  const user = await getDefaultUser();
  
  await prisma.user.update({
    where: { id: user.id },
    data: { netIncome: newIncome }
  });

  revalidatePath("/wallet");
}

// 4. Eliminar tarjeta
export async function deleteAccount(id: string) {
  await prisma.account.delete({
    where: { id }
  });
  revalidatePath("/wallet");
}
