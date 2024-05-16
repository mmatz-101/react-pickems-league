import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    boolean,
    pgEnum,
    date,
    decimal,
    doublePrecision,
  } from "drizzle-orm/pg-core"
  import postgres from "postgres"
  import { drizzle } from "drizzle-orm/postgres-js"
  import type { AdapterAccount } from "next-auth/adapters"
import { float } from "drizzle-orm/mysql-core"
   
  const connectionString = "postgres://postgres:postgres@localhost:5432/drizzle"
  const pool = postgres(connectionString, { max: 1 })
   
  export const db = drizzle(pool)
  
  export const RoleEnum = pgEnum("roles", ["user", "admin"])
   
  export const users = pgTable("user", {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"),
    twoFactorEnabled: boolean("twoFactorEnabled").default(false),
    role: RoleEnum("roles").default("user"),
  })
   
  export const accounts = pgTable(
    "account",
    {
      userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
      type: text("type").$type<AdapterAccount>().notNull(),
      provider: text("provider").notNull(),
      providerAccountId: text("providerAccountId").notNull(),
      refresh_token: text("refresh_token"),
      access_token: text("access_token"),
      expires_at: integer("expires_at"),
      token_type: text("token_type"),
      scope: text("scope"),
      id_token: text("id_token"),
      session_state: text("session_state"),
    },
    (account) => ({
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    })
  )

  export const emailTokens = pgTable(
    "email_tokens",
    {
      id: text("id").notNull(),
      token: text("token").notNull(),
      expires: timestamp("expires", { mode: "date" }).notNull(),
      email: text("email").notNull(),
    },
    (vt) => ({
      compoundKey: primaryKey({ columns: [vt.id, vt.token] }),
    })
  )

  export const passwordResetTokens = pgTable(
    "password_reset_tokens",
    {
      id: text("id").notNull(),
      token: text("token").notNull(),
      expires: timestamp("expires", { mode: "date" }).notNull(),
      email: text("email").notNull(),
    },
    (vt) => ({
      compoundKey: primaryKey({ columns: [vt.id, vt.token] }),
    })
  )

  export const games = pgTable("games", {
    id: text("id").primaryKey(),
    league: text("league"),
    year: integer("year"),
    week: integer("week"),
    date: date("date", { mode: "date"}),
    status: text("status"),
    tvStation: text("tvStation"),
    homeTeam: text("homeTeam"),
    homeSpread: doublePrecision("homeSpread"),
    awayTeam: text("awayTeam"),
    awaySpread: doublePrecision("awaySpread"), 
  })

  export const currentWeeks = pgTable("current_weeks", {
    id: text("id").primaryKey().default("current_week"),
    currentWeek: integer("currentWeek"),
  })
