import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const defaultTimestampMs = sql`(unixepoch() * 1000)`;

export const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex("user_email_idx").on(table.email),
  })
);

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs)
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    tokenIdx: uniqueIndex("session_token_idx").on(table.token),
  })
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    providerAccountIdx: uniqueIndex("account_provider_account_idx").on(
      table.providerId,
      table.accountId
    ),
  })
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    identifierValueIdx: uniqueIndex("verification_identifier_value_idx").on(
      table.identifier,
      table.value
    ),
  })
);

export const calendarDay = sqliteTable(
  "calendar_day",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    adDate: text("ad_date").notNull(),
    bsDate: text("bs_date").notNull(),
    bsYear: integer("bs_year").notNull(),
    bsMonth: integer("bs_month").notNull(),
    bsDay: integer("bs_day").notNull(),
    bsMonthNameNe: text("bs_month_name_ne").notNull(),
    bsMonthNameEn: text("bs_month_name_en").notNull(),
    weekdayIndex: integer("weekday_index").notNull(),
    weekdayNameNe: text("weekday_name_ne").notNull(),
    weekdayNameEn: text("weekday_name_en").notNull(),
    tithi: text("tithi"),
    paksha: text("paksha"),
    lunarMonthNe: text("lunar_month_ne"),
    lunarMonthEn: text("lunar_month_en"),
    nakshatra: text("nakshatra"),
    yoga: text("yoga"),
    karana: text("karana"),
    sunrise: text("sunrise"),
    sunset: text("sunset"),
    moonrise: text("moonrise"),
    moonset: text("moonset"),
    isWeekend: integer("is_weekend", { mode: "boolean" })
      .notNull()
      .default(false),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    adDateIdx: uniqueIndex("calendar_day_ad_date_idx").on(table.adDate),
    bsDateIdx: uniqueIndex("calendar_day_bs_date_idx").on(table.bsDate),
  })
);

export const calendarEvent = sqliteTable(
  "calendar_event",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dayId: integer("day_id")
      .notNull()
      .references(() => calendarDay.id, { onDelete: "cascade" }),
    titleNe: text("title_ne").notNull(),
    titleEn: text("title_en"),
    eventType: text("event_type").notNull().default("festival"),
    isPublicHoliday: integer("is_public_holiday", { mode: "boolean" })
      .notNull()
      .default(false),
    isOptionalHoliday: integer("is_optional_holiday", { mode: "boolean" })
      .notNull()
      .default(false),
    metadata: text("metadata", { mode: "json" }).$type<
      Record<string, unknown> | null
    >(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(defaultTimestampMs),
  },
  (table) => ({
    dayTypeIdx: uniqueIndex("calendar_event_day_type_title_idx").on(
      table.dayId,
      table.eventType,
      table.titleNe
    ),
  })
);
