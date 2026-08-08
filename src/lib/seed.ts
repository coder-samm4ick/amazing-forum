import { db } from "@/db";
import { users, categories, forums, threads, posts, serverInfo, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function ensureSeeded() {
  try {
    // Check if serverInfo exists
    const existingServer = await db.select().from(serverInfo).limit(1);
    if (existingServer.length > 0) {
      return; // Already seeded
    }

    console.log("Seeding Ender Online Forum Database...");

    // Insert Server Info for BLACK Server
    await db.insert(serverInfo).values({
      serverName: "Ender Online | Сервер BLACK",
      ipAddress: "black.ender-online.ru:7777",
      onlinePlayers: 842,
      maxPlayers: 1000,
      status: "ONLINE",
      announcement: "Добро пожаловать на официальный форум проекта Ender Online — Сервер BLACK! Открыты заявления на лидерские посты и пост администратора.",
    });

    // Password for default accounts is 'admin'
    const defaultPasswordHash = await bcrypt.hash("admin", 10);

    // Create Owner & Staff Users
    const [owner] = await db.insert(users).values({
      username: "Ender_Owner",
      email: "owner@ender-online.ru",
      passwordHash: defaultPasswordHash,
      role: "owner",
      customTitle: "👑 Основатель Проекта | Владелец",
      badgeColor: "purple-glow",
      avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
      signature: "[CENTER][B][COLOR=rgb(168, 85, 247)]Ender Online — Сервер BLACK[/COLOR][/B]\n[COLOR=rgb(148, 163, 184)]Официальный форум проекта. Создатель & Разработчик[/COLOR][/CENTER]",
      reputation: 999,
      messagesCount: 154,
      reactionScore: 840,
      vkLink: "https://vk.com/ender_online",
      discordTag: "ender_owner#0001",
    }).returning();

    const [ga] = await db.insert(users).values({
      username: "Alex_Mason",
      email: "ga@ender-online.ru",
      passwordHash: defaultPasswordHash,
      role: "ga",
      customTitle: "🛡️ Главный Администратор [BLACK]",
      badgeColor: "red",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      reputation: 420,
      messagesCount: 320,
      reactionScore: 512,
    }).returning();

    const [zga] = await db.insert(users).values({
      username: "Mikhail_Volkov",
      email: "zga@ender-online.ru",
      passwordHash: defaultPasswordHash,
      role: "zga",
      customTitle: "⚖️ Зам. Главного Администратора [BLACK]",
      badgeColor: "amber",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      reputation: 280,
      messagesCount: 198,
      reactionScore: 310,
    }).returning();

    const [curator] = await db.insert(users).values({
      username: "Dmitry_Sokolov",
      email: "curator@ender-online.ru",
      passwordHash: defaultPasswordHash,
      role: "curator",
      customTitle: "💼 Главный Следящий за ГОСС [BLACK]",
      badgeColor: "sky",
      avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
      reputation: 150,
      messagesCount: 112,
      reactionScore: 180,
    }).returning();

    const [user1] = await db.insert(users).values({
      username: "Egor_Krid",
      email: "user1@ender-online.ru",
      passwordHash: defaultPasswordHash,
      role: "user",
      customTitle: "Игрок сервера BLACK",
      badgeColor: "slate",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      reputation: 25,
      messagesCount: 18,
      reactionScore: 30,
    }).returning();

    // Create Categories
    const [cat1] = await db.insert(categories).values({
      title: "📢 ИНФОРМАЦИЯ И НОВОСТИ ENDER ONLINE",
      description: "Официальные анонсы, правила сервера BLACK и предложения",
      orderIndex: 1,
      icon: "megaphone",
      color: "purple",
      isServerCategory: false,
    }).returning();

    const [cat2] = await db.insert(categories).values({
      title: "⬛ СЕРВЕР BLACK",
      description: "Основной игровой раздел сервера BLACK проекта Ender Online",
      orderIndex: 2,
      icon: "server",
      color: "amber",
      isServerCategory: true,
    }).returning();

    const [cat3] = await db.insert(categories).values({
      title: "🛠️ ТЕХНИЧЕСКИЙ РАЗДЕЛ",
      description: "Помощь при технических проблемах, ошибки игры, восстановление",
      orderIndex: 3,
      icon: "wrench",
      color: "emerald",
      isServerCategory: false,
    }).returning();

    const [cat4] = await db.insert(categories).values({
      title: "☕ ИГРОВАЯ КУРИЛКА",
      description: "Свободное общение, юмор, фотоальбом и обсуждение игр",
      orderIndex: 4,
      icon: "coffee",
      color: "sky",
      isServerCategory: false,
    }).returning();

    // Category 1 Forums
    const [f1] = await db.insert(forums).values({
      categoryId: cat1.id,
      title: "Новости и обновления проекта",
      description: "Официальные новости, списки обновлений и патчноуты сервера BLACK",
      orderIndex: 1,
      icon: "newspaper",
    }).returning();

    const [f2] = await db.insert(forums).values({
      categoryId: cat1.id,
      title: "Правила проекта Ender Online",
      description: "Регламент сервера BLACK, правила захвата бизнесов, гос. фракций и администрации",
      orderIndex: 2,
      icon: "file-text",
    }).returning();

    const [f3] = await db.insert(forums).values({
      categoryId: cat1.id,
      title: "Предложения по улучшению",
      description: "Ваши идеи по новому функционалу и оптимизации игрового мода",
      orderIndex: 3,
      icon: "lightbulb",
    }).returning();

    // Category 2 Forums (Server BLACK Core)
    const [fComplaints] = await db.insert(forums).values({
      categoryId: cat2.id,
      title: "🛑 Жалобы сервера BLACK",
      description: "Раздел подач жалоб на администраторов, лидеров и игроков",
      orderIndex: 1,
      icon: "shield-alert",
    }).returning();

    // Sub-forums for Complaints
    const [subCompAdmin] = await db.insert(forums).values({
      categoryId: cat2.id,
      parentId: fComplaints.id,
      title: "Жалобы на администрацию",
      description: "Оспаривание наказаний и жалобы на действия администраторов BLACK",
      orderIndex: 1,
      icon: "user-x",
    }).returning();

    const [subCompPlayers] = await db.insert(forums).values({
      categoryId: cat2.id,
      parentId: fComplaints.id,
      title: "Жалобы на игроков не состоящих в орг.",
      description: "Нарушения правил сервера от гражданских лиц (DM, DB, NonRP, SK)",
      orderIndex: 2,
      icon: "alert-triangle",
    }).returning();

    const [subCompGov] = await db.insert(forums).values({
      categoryId: cat2.id,
      parentId: fComplaints.id,
      title: "Жалобы на игроков состоящих в гос. орг.",
      description: "Нарушения со стороны сотрудников МВД, ФСБ, Армии, МЧС",
      orderIndex: 3,
      icon: "shield",
    }).returning();

    const [subCompCrim] = await db.insert(forums).values({
      categoryId: cat2.id,
      parentId: fComplaints.id,
      title: "Жалобы на игроков состоящих в крим. орг.",
      description: "Нарушения со стороны членов ОПГ, Мафий и Банд",
      orderIndex: 4,
      icon: "flame",
    }).returning();

    const [subCompLeaders] = await db.insert(forums).values({
      categoryId: cat2.id,
      parentId: fComplaints.id,
      title: "Жалобы на лидеров и заместителей",
      description: "Жалобы на руководящий состав организаций сервера BLACK",
      orderIndex: 5,
      icon: "award",
    }).returning();

    const [subUnban] = await db.insert(forums).values({
      categoryId: cat2.id,
      parentId: fComplaints.id,
      title: "Заявления на апелляцию / Разблокировка",
      description: "Амнистия аккаунтов и прошение о снятии блокировок",
      orderIndex: 6,
      icon: "check-circle",
    }).returning();

    // State Factions
    const [fGov] = await db.insert(forums).values({
      categoryId: cat2.id,
      title: "🏛️ Государственные организации",
      description: "Раздел Правительства, МВД, ФСБ, Армии, МЧС, ТРК и ФСИН",
      orderIndex: 2,
      icon: "building-2",
    }).returning();

    const [subFSB] = await db.insert(forums).values({
      categoryId: cat2.id,
      parentId: fGov.id,
      title: "ФСБ (Федеральная Служба Безопасности)",
      description: "Приемная УФСБ по Нижегородской области | Заявления и отчеты",
      orderIndex: 1,
      icon: "shield-check",
    }).returning();

    const [subUVD] = await db.insert(forums).values({
      categoryId: cat2.id,
      parentId: fGov.id,
      title: "УВД / ППС (Полиция)",
      description: "Управление Внутренних Дел | Электронные заявления и система повышений",
      orderIndex: 2,
      icon: "badge-check",
    }).returning();

    const [subArmy] = await db.insert(forums).values({
      categoryId: cat2.id,
      parentId: fGov.id,
      title: "Воинская Часть (Армия)",
      description: "Нижегородский Военный Округ | Призыв, рапорты и устав",
      orderIndex: 3,
      icon: "crosshair",
    }).returning();

    // Criminal Organizations
    const [fCrim] = await db.insert(forums).values({
      categoryId: cat2.id,
      title: "💣 Криминальные организации",
      description: "Русская Мафия, Кавказская Мафия, ЧМ, Байкеры и капты",
      orderIndex: 3,
      icon: "swords",
    }).returning();

    // RP & Market
    const [fRP] = await db.insert(forums).values({
      categoryId: cat2.id,
      title: "🎭 Игровой процесс и RolePlay [BLACK]",
      description: "RP Биографии персонажей, скриншоты, рынок недвижимости и авто",
      orderIndex: 4,
      icon: "users",
    }).returning();

    // Technical forums
    const [fTech] = await db.insert(forums).values({
      categoryId: cat3.id,
      title: "Техническая поддержка [BLACK]",
      description: "Помощь игрокам с проблемами в игре и вылетами",
      orderIndex: 1,
      icon: "wrench",
    }).returning();

    // Offtopic forum
    const [fKurilka] = await db.insert(forums).values({
      categoryId: cat4.id,
      title: "Игровая курилка [BLACK]",
      description: "Беседы на любые темы, знакомства и обсуждения",
      orderIndex: 1,
      icon: "messages-square",
    }).returning();

    // Seed Sample Threads in Rules and News
    const [threadRules] = await db.insert(threads).values({
      forumId: f2.id,
      authorId: owner.id,
      title: "📜 Общие правила сервера Ender Online [BLACK] (Обязательно к прочтению)",
      prefix: "[Информация]",
      prefixColor: "purple",
      isPinned: true,
      isLocked: true,
      views: 1420,
      postsCount: 1,
    }).returning();

    await db.insert(posts).values({
      threadId: threadRules.id,
      authorId: owner.id,
      content: `[CENTER][SIZE=5][B][COLOR=rgb(168, 85, 247)]Официальные правила проекта Ender Online — Сервер BLACK[/COLOR][/B][/SIZE][/CENTER]

[B]1. Общие положения:[/B]
1.1. Незнание правил не освобождает от ответственности.
1.2. Качественный RolePlay — залог успешной игры. Запрещены DM (DeathMatch), DB (DriveBy), SK (Spawn Kill) и TK (Team Kill).
1.3. Запрещено использование любых сторонних софтов, читов, клео-скриптов, дающих преимущество над другими игроками.
1.4. Администрация оставляет за собой право выдавать наказание по своему усмотрению в рамках регламента.

[B]2. Поведение на форуме:[/B]
2.1. Запрещен оффтоп, оскорбления участников и нецензурная лексика в заголовках тем.
2.2. Подача жалобы производится строго по установленной форме.

[COLOR=rgb(168, 85, 247)][B]С уважением, Руководство Ender Online.[/B][/COLOR]`,
    });

    // Seed News Thread
    const [threadNews] = await db.insert(threads).values({
      forumId: f1.id,
      authorId: owner.id,
      title: "🔥 Грандиозное обновление: Открытие Сервера BLACK и Единый Форум Ender Online!",
      prefix: "[Важно]",
      prefixColor: "emerald",
      isPinned: true,
      views: 890,
      postsCount: 2,
    }).returning();

    await db.insert(posts).values({
      threadId: threadNews.id,
      authorId: owner.id,
      content: `[SIZE=4][B]Уважаемые игроки Ender Online![/B][/SIZE]\n\nМы рады представить вам обновленный форум проекта и запуск уникального [B]Сервера BLACK[/B]! \n\nВ этом обновлении вас ждут:\n• Новая экономическая система\n• Обновленный автосалон и редкие транспортные средства\n• Переработанный функционал для ФСБ, МВД и Армии\n• Системы захвата бизваров для Мафий\n\nПриглашаем всех принять участие в развивающейся жизни сервера BLACK!`,
    });

    await db.insert(posts).values({
      threadId: threadNews.id,
      authorId: ga.id,
      content: `Отличная новость! Заявления на посты лидеров ФСБ, УВД и Армии уже открыты в соответствующем разделе. Успей занять руководящую должность на сервере BLACK!`,
    });

    // Seed Sample Complaint
    const [threadComp] = await db.insert(threads).values({
      forumId: subCompAdmin.id,
      authorId: user1.id,
      title: "Жалоба на администратора Mikhail_Volkov | Причина: NonRP езда",
      prefix: "[На рассмотрении]",
      prefixColor: "amber",
      isPinned: false,
      views: 135,
      postsCount: 2,
    }).returning();

    await db.insert(posts).values({
      threadId: threadComp.id,
      authorId: user1.id,
      content: `1. Ваш никнейм: Egor_Krid
2. Никнейм администратора: Mikhail_Volkov
3. Суть жалобы: Ехал спокойно по трассе Арзамас-Южный на своем автомобиле, объезжал яму на дороге, а администратор выдал мне деморган за NonRP езду на 30 минут. Прошу предоставить доказательства нарушения.
4. Доказательства (скриншот/видео): https://i.imgur.com/sample_proof.png
5. Я готов нести ответственность в случае обмана: Да`,
    });

    await db.insert(posts).values({
      threadId: threadComp.id,
      authorId: zga.id,
      content: `[COLOR=rgb(245, 158, 11)][B]Здравствуйте, Egor_Krid.[/B][/COLOR]\nЗапросил видеофиксацию у администратора. Ожидайте вердикта в данной теме. Тема переведена в статус [B][На рассмотрении][/B].`,
    });

    // Audit log entry
    await db.insert(auditLogs).values({
      userId: owner.id,
      action: "Инициализация форума Ender Online",
      details: "Система запущена. Раздел BLACK успешно сконфигурирован.",
    });

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
