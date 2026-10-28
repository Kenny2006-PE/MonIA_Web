"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDefaultUser } from "./wallet";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ChatHistoryItem {
  role: "user" | "model";
  parts: { text: string }[];
}

async function generateSmartTitle(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const titleModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const snippet = messages
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content.slice(0, 250)}`)
      .join("\n");

    const prompt = `Actúa como un sintetizador de títulos concisos para un chat de finanzas personales.
A continuación tienes la conversación entre el usuario y su asistente financiero de IA:

${snippet}

Determina con precisión el tema central y concreto del que están hablando el usuario y la IA.
Genera un título muy conciso y directo (máximo 3 a 5 palabras en español).

REGLAS ESTRICTAS:
- Si mencionan un producto, bien o meta específica (ejemplo: Zapatillas Nike Jordan, Laptop de Ingeniería, Moto Honda Navi, Auto Toyota, Pago de Tarjeta, etc.), inclúyelo en el título.
- NO uses comillas, asteriscos ni formato markdown.
- NO uses puntos al final.
- NO uses palabras como "Chat", "Conversación", "Consulta" ni "Asesoría" a menos que no haya un tema específico.
- Si solo son saludos de cortesía sin tema financiero aún, responde exactamente: "Nueva Consulta".

Título:`;

    const res = await titleModel.generateContent(prompt);
    const raw = res.response.text().trim().replace(/["\n\r*#]/g, "");
    if (raw && raw.length >= 3 && raw.length <= 50) {
      return raw;
    }
  } catch (err) {
    console.warn("Gemini title generation error:", err);
  }

  // Fallback directo a partir del mensaje del usuario más relevante
  const userMsgs = messages.filter(m => m.role === 'user');
  const lastUserMsg = userMsgs[userMsgs.length - 1]?.content || "";
  const clean = lastUserMsg
    .trim()
    .replace(/^¿+|\?+$/g, "")
    .replace(/^(hola|buenas|buenos dias|buenas tardes|buenas noches)[,.\s]*/i, "")
    .trim();
  if (!clean) return "Nueva Consulta";
  return clean.charAt(0).toUpperCase() + clean.slice(1, 38) + (clean.length > 38 ? "..." : "");
}

// 1. Iniciar un nuevo hilo
export async function createThread() {
  const user = await getDefaultUser();
  
  const thread = await prisma.chatThread.create({
    data: {
      userId: user.id,
      title: "Nueva Asesoría",
    }
  });

  revalidatePath("/chat");
  return thread;
}

// 2. Obtener lista de hilos
export async function getThreads() {
  const user = await getDefaultUser();
  
  try {
    // Limpiar hilos vacíos sin mensajes
    await prisma.chatThread.deleteMany({
      where: {
        userId: user.id,
        messages: { none: {} },
        createdAt: { lt: new Date(Date.now() - 30 * 1000) }
      }
    });
  } catch (e) {
    console.warn("Could not clean old empty threads", e);
  }

  const threads = await prisma.chatThread.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Para sacar el preview del último mensaje
      }
    }
  });

  return threads;
}

// 3. Obtener historial de un chat
export async function getMessages(threadId: string) {
  return await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: 'asc' },
  });
}

// 4. Eliminar un hilo de conversación y sus mensajes
export async function deleteThread(threadId: string) {
  const user = await getDefaultUser();
  try {
    await prisma.chatMessage.deleteMany({
      where: { threadId }
    });
    await prisma.chatThread.deleteMany({
      where: {
        id: threadId,
        userId: user.id
      }
    });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Error deleting thread:", error);
    throw new Error("No se pudo eliminar la conversación");
  }
}

// 5. Enviar mensaje y procesar con IA
export async function sendMessageToAI(threadId: string, userMessage: string) {
  const user = await getDefaultUser();
  
  // Guardar mensaje del usuario
  await prisma.chatMessage.create({
    data: {
      threadId,
      role: "user",
      content: userMessage
    }
  });

  // Obtener contexto financiero del usuario
  const accounts = await prisma.account.findMany({
    where: { userId: user.id }
  });

  // Construir el System Prompt con los datos reales
  const systemPrompt = `
  Eres el Asistente Financiero de ${user.name}. Eres empático, directo y experto en finanzas personales.
  Respondes siempre en español de forma concisa. Usa formato markdown para listas o enfatizar información.

  CONTEXTO FINANCIERO DEL USUARIO:
  - Ingreso Mensual Neto: S/ ${user.netIncome}
  
  TARJETAS / CUENTAS:
  ${accounts.length > 0 
    ? accounts.map(a => 
      `- ${a.name} (${a.type}): ` +
      (a.type === 'CREDIT' ? `Límite S/ ${a.creditLimit}, Deuda Actual S/ ${a.currentDebt}, TEA ${a.tea}%` : `Saldo S/ ${a.balance}`)
    ).join("\n") 
    : "No tiene tarjetas agregadas."}
  
  REGLAS:
  1. Base de las recomendaciones: Usa exclusivamente el ingreso neto y el estado de sus deudas actuales para darle consejos sobre si puede o no permitirse una compra, si debería ahorrar, o a qué tarjeta abonar primero (por ejemplo, sugiriendo abonar a la de mayor TEA).
  2. Nunca des consejos de inversión riesgosa, céntrate en presupuestos y ahorro.
  `;

  // Obtener historial previo para darle contexto a la IA
  const history = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: 'asc' },
  });

  // Formatear historial para Gemini asegurando que los roles alternen y el primero sea 'user'
  const chatHistory: ChatHistoryItem[] = [];
  let lastRole = "";

  for (const msg of history) {
    const role: "user" | "model" = msg.role === 'model' || msg.role === 'system' ? 'model' : 'user';
    if (role === lastRole && chatHistory.length > 0) {
      chatHistory[chatHistory.length - 1].parts[0].text += "\n\n" + msg.content;
    } else {
      chatHistory.push({
        role,
        parts: [{ text: msg.content }]
      });
      lastRole = role;
    }
  }

  // Preparamos el historial para startChat: excluimos el mensaje actual recién creado
  let priorHistory = chatHistory.slice(0, -1);
  // Gemini exige que el primer mensaje en history sea del rol 'user'
  while (priorHistory.length > 0 && priorHistory[0].role !== 'user') {
    priorHistory = priorHistory.slice(1);
  }

  // Función de llamada con modelo principal y fallback en caso de 503
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.5-flash-lite"];
  let aiResponse = "";
  let lastErrorMessage = "";

  for (const modelName of modelsToTry) {
    try {
      const chatModel = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemPrompt 
      });

      const chat = chatModel.startChat({
        history: priorHistory,
      });

      const result = await chat.sendMessage(userMessage);
      aiResponse = result.response.text();
      if (aiResponse) break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lastErrorMessage = msg;
      console.warn(`Error con modelo ${modelName}:`, msg);
    }
  }

  if (!aiResponse) {
    throw new Error(`No se pudo obtener respuesta de la IA. Detalle: ${lastErrorMessage}`);
  }

  try {
    // Guardar respuesta de la IA
    await prisma.chatMessage.create({
      data: {
        threadId,
        role: "model",
        content: aiResponse
      }
    });

    // Actualizar la fecha del hilo y título dinámico inteligente según lo que se está hablando
    const currentThread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { title: true }
    });

    const isGenericTitle = !currentThread || 
      currentThread.title === "Nueva Asesoría" || 
      currentThread.title === "Nueva Consulta" ||
      currentThread.title.startsWith("Consulta") ||
      currentThread.title.startsWith("¡Hola") || 
      currentThread.title.startsWith("Hola") ||
      currentThread.title.endsWith("...");

    const allConversation = [...history, { role: "model", content: aiResponse }];
    let finalTitle = currentThread?.title || "Nueva Asesoría";

    // Si el título actual es genérico o estamos en los primeros turnos de la conversación
    if (isGenericTitle || allConversation.length <= 4) {
      const smartTitle = await generateSmartTitle(allConversation);
      if (smartTitle && smartTitle !== "Nueva Consulta") {
        finalTitle = smartTitle;
        await prisma.chatThread.update({
          where: { id: threadId },
          data: { 
            title: smartTitle,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.chatThread.update({
          where: { id: threadId },
          data: { updatedAt: new Date() }
        });
      }
    } else {
      await prisma.chatThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() }
      });
    }

    revalidatePath("/chat");
    revalidatePath(`/chat/${threadId}`);
    
    return {
      aiResponse,
      threadTitle: finalTitle
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Database save error:", errorMsg);
    throw new Error("No se pudo guardar la respuesta en la base de datos: " + errorMsg);
  }
}

