import { pgTable, serial, text, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 30 }).default("user").notNull(), // 'owner', 'ga', 'zga', 'admin', 'curator', 'leader', 'user'
  customTitle: text("custom_title"), // e.g., "Главный Администратор [BLACK]"
  badgeColor: varchar("badge_color", { length: 30 }).default("purple-glow"), // 'purple-glow', 'red', 'amber', 'emerald', 'sky', 'slate'
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  signature: text("signature"),
  reputation: integer("reputation").default(0).notNull(),
  messagesCount: integer("messages_count").default(0).notNull(),
  reactionScore: integer("reaction_score").default(0).notNull(),
  warnings: integer("warnings").default(0).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  banReason: text("ban_reason"),
  vkLink: text("vk_link"),
  discordTag: text("discord_tag"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0).notNull(),
  icon: varchar("icon", { length: 50 }).default("folder").notNull(),
  color: varchar("color", { length: 30 }).default("purple").notNull(),
  isServerCategory: boolean("is_server_category").default(false).notNull(),
});

// Forums / Sub-boards Table
export const forums = pgTable("forums", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "cascade" }).notNull(),
  parentId: integer("parent_id"), // null if root forum, or id of parent forum for subforums
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0).notNull(),
  icon: varchar("icon", { length: 50 }).default("message-square").notNull(),
  threadsCount: integer("threads_count").default(0).notNull(),
  postsCount: integer("posts_count").default(0).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  minRoleToPost: varchar("min_role_to_post", { length: 30 }).default("user").notNull(),
});

// Threads Table
export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").references(() => forums.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  prefix: varchar("prefix", { length: 50 }).default("").notNull(), // '[На рассмотрении]', '[Одобрено]', '[Отказано]', '[Важно]'
  prefixColor: varchar("prefix_color", { length: 30 }).default("amber").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  views: integer("views").default(0).notNull(),
  postsCount: integer("posts_count").default(1).notNull(),
  lastPostAt: timestamp("last_post_at").defaultNow().notNull(),
  lastPostAuthorId: integer("last_post_author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Posts Table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => threads.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  isSolution: boolean("is_solution").default(false).notNull(),
  editedAt: timestamp("edited_at"),
  editedBy: integer("edited_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Post Reactions Table
export const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'like', 'heart', 'respect', 'dislike', 'helpful'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Server Info / Stats Table
export const serverInfo = pgTable("server_info", {
  id: serial("id").primaryKey(),
  serverName: varchar("server_name", { length: 100 }).default("Ender Online | BLACK").notNull(),
  ipAddress: varchar("ip_address", { length: 100 }).default("black.ender-online.ru:7777").notNull(),
  onlinePlayers: integer("online_players").default(842).notNull(),
  maxPlayers: integer("max_players").default(1000).notNull(),
  status: varchar("status", { length: 20 }).default("ONLINE").notNull(),
  announcement: text("announcement").default("Добро пожаловать на официальный форум Ender Online — Сервер BLACK! Будьте вежливы и соблюдайте правила проекта.").notNull(),
});

// Notifications Table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  link: text("link"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Private Messages Table
export const privateMessages = pgTable("private_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  recipientId: integer("recipient_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit Logs Table
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  action: text("action").notNull(),
  details: text("details"),
  ip: varchar("ip", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
