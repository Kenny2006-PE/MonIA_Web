import { getDefaultUser } from "@/app/actions/wallet";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getDefaultUser();
  const thread = await prisma.chatThread.create({
    data: {
      userId: user.id,
      title: "Nueva Asesoría",
    },
  });

  redirect(`/chat/${thread.id}`);
}
