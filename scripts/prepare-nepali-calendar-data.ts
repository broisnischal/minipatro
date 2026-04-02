import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import NepaliDate from "nepali-date-converter";
import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

type CalendarEvent = {
  titleNe: string;
  titleEn?: string;
  eventType: "holiday" | "festival" | "observance" | "fasting" | "custom";
  isPublicHoliday: boolean;
  isOptionalHoliday: boolean;
  metadata?: Record<string, unknown>;
};

type CalendarDaySeed = {
  adDate: string;
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  bsMonthNameNe: string;
  bsMonthNameEn: string;
  weekdayIndex: number;
  weekdayNameNe: string;
  weekdayNameEn: string;
  isWeekend: boolean;
  notes?: string;
  events: CalendarEvent[];
};

type CalendarDataset = {
  version: 1;
  generatedAt: string;
  days: CalendarDaySeed[];
};

function getArgValue(flag: string, fallback: string) {
  const args = process.argv.slice(2);
  const index = args.indexOf(flag);
  if (index >= 0 && args[index + 1]) {
    return args[index + 1];
  }
  return fallback;
}

function parseISODate(input: string) {
  isoDateSchema.parse(input);
  const [yearRaw, monthRaw, dayRaw] = input.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${input}`);
  }

  return date;
}

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildNewYearEvent(bsYear: number): CalendarEvent {
  return {
    titleNe: "नयाँ वर्ष",
    titleEn: "Nepali New Year",
    eventType: "holiday",
    isPublicHoliday: true,
    isOptionalHoliday: false,
    metadata: { bsYear },
  };
}

function main() {
  const startAd = getArgValue("--start-ad", "2020-01-01");
  const endAd = getArgValue("--end-ad", "2033-12-31");
  const outputPath = resolve(
    getArgValue("--output", "data/nepali-calendar.seed.json")
  );

  const start = parseISODate(startAd);
  const end = parseISODate(endAd);

  if (start > end) {
    throw new Error(
      `Invalid range: --start-ad (${startAd}) must be before --end-ad (${endAd})`
    );
  }

  const days: CalendarDaySeed[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const adDate = formatISODate(cursor);
    const bsDate = NepaliDate.fromAD(new Date(cursor));
    const bsYear = bsDate.getYear();
    const bsMonth = bsDate.getMonth() + 1;
    const bsDay = bsDate.getDate();
    const weekdayIndex = bsDate.getDay();
    const isWeekend = weekdayIndex === 6;
    const isNewYear = bsMonth === 1 && bsDay === 1;
    const events: CalendarEvent[] = [];

    if (isNewYear) {
      events.push(buildNewYearEvent(bsYear));
    }

    days.push({
      adDate,
      bsYear,
      bsMonth,
      bsDay,
      bsMonthNameNe: bsDate.format("MMMM", "np"),
      bsMonthNameEn: bsDate.format("MMMM", "en"),
      weekdayIndex,
      weekdayNameNe: bsDate.format("ddd", "np"),
      weekdayNameEn: bsDate.format("ddd", "en"),
      isWeekend,
      notes: isNewYear ? `नयाँ वर्ष ${bsYear}` : isWeekend ? "साप्ताहिक बिदा" : undefined,
      events,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  const dataset: CalendarDataset = {
    version: 1,
    generatedAt: new Date().toISOString(),
    days,
  };

  return mkdir(dirname(outputPath), { recursive: true })
    .then(() => writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf-8"))
    .then(() => {
      const first = days[0];
      const last = days[days.length - 1];
      console.log(
        [
          `Prepared Nepali calendar seed data`,
          `- output: ${outputPath}`,
          `- AD range: ${first.adDate} to ${last.adDate}`,
          `- total days: ${days.length}`,
        ].join("\n")
      );
    });
}

await main();
