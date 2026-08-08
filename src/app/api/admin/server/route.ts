import { NextResponse } from "next/server";
import { db } from "@/db";
import { serverInfo, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const [info] = await db.select().from(serverInfo).limit(1);
    return NextResponse.json({ serverInfo: info });
  } catch (err: unknown) {
    console.error("Fetch server info error:", err);
    return NextResponse.json({ error: "Ошибка получения данных сервера" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["owner", "ga"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { serverName, ipAddress, onlinePlayers, maxPlayers, status, announcement } = await req.json();

    const [existing] = await db.select().from(serverInfo).limit(1);
    if (!existing) {
      await db.insert(serverInfo).values({
        serverName: serverName || "Ender Online | BLACK",
        ipAddress: ipAddress || "black.ender-online.ru:7777",
        onlinePlayers: Number(onlinePlayers) || 842,
        maxPlayers: Number(maxPlayers) || 1000,
        status: status || "ONLINE",
        announcement: announcement || "",
      });
    } else {
      await db
        .update(serverInfo)
        .set({
          serverName: serverName ?? existing.serverName,
          ipAddress: ipAddress ?? existing.ipAddress,
          onlinePlayers: onlinePlayers !== undefined ? Number(onlinePlayers) : existing.onlinePlayers,
          maxPlayers: maxPlayers !== undefined ? Number(maxPlayers) : existing.maxPlayers,
          status: status ?? existing.status,
          announcement: announcement ?? existing.announcement,
        })
        .where(eq(serverInfo.id, existing.id));
    }

    await db.insert(auditLogs).values({
      userId: currentUser.id,
      action: "Обновление настроек Сервера BLACK",
      details: `Обновлен онлайн (${onlinePlayers}/${maxPlayers}), статус ${status}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Update server info error:", err);
    return NextResponse.json({ error: "Ошибка при обновлении сервера" }, { status: 500 });
  }
}
