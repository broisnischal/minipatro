import { asc, between, inArray } from "drizzle-orm";
import { Calendar } from "lucide-react";
import { Link, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { Button } from "@/components/ui/button";
import { getDb } from "@/db";
import { calendarDay, calendarEvent } from "@/db/schema";
import { getServerSession } from "@/lib/auth.server";

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function addMonths(date: Date, delta: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));
}

function parseMonth(input: string | null) {
  if (!input || !/^\d{4}-\d{2}$/.test(input)) {
    return null;
  }

  const [yearRaw, monthRaw] = input.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, 1));
}

function weekdayNames() {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

export const meta: MetaFunction = () => {
  return [
    { title: "Mini Patro | Calendar" },
    {
      name: "description",
      content: "A minimal, clean Nepali calendar viewer powered by Drizzle and Better Auth.",
    },
  ];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const db = getDb(env);
  const url = new URL(request.url);
  const baseMonth = parseMonth(url.searchParams.get("month")) ?? new Date();
  const monthStart = new Date(
    Date.UTC(baseMonth.getUTCFullYear(), baseMonth.getUTCMonth(), 1)
  );
  const monthEnd = new Date(
    Date.UTC(baseMonth.getUTCFullYear(), baseMonth.getUTCMonth() + 1, 0)
  );
  const gridStart = new Date(monthStart);
  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()));

  let days: Array<typeof calendarDay.$inferSelect> = [];
  let events: Array<typeof calendarEvent.$inferSelect> = [];

  try {
    days = await db
      .select()
      .from(calendarDay)
      .where(between(calendarDay.adDate, toISODate(gridStart), toISODate(gridEnd)))
      .orderBy(asc(calendarDay.adDate));

    const dayIds = days.map((day) => day.id);
    events =
      dayIds.length > 0
        ? await db
            .select()
            .from(calendarEvent)
            .where(inArray(calendarEvent.dayId, dayIds))
            .orderBy(asc(calendarEvent.dayId), asc(calendarEvent.id))
        : [];
  } catch (error) {
    console.error("Calendar query failed. Did you run DB migrations?", error);
    days = [];
    events = [];
  }

  const dayByAdDate = new Map(days.map((day) => [day.adDate, day]));
  const eventByDayId = new Map<number, typeof events>();

  for (const event of events) {
    const items = eventByDayId.get(event.dayId) ?? [];
    items.push(event);
    eventByDayId.set(event.dayId, items);
  }

  const cells = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const adDate = toISODate(cursor);
    const day = dayByAdDate.get(adDate) ?? null;
    const dayEvents = day ? eventByDayId.get(day.id) ?? [] : [];

    cells.push({
      adDate,
      adDay: cursor.getUTCDate(),
      isCurrentMonth: cursor.getUTCMonth() === monthStart.getUTCMonth(),
      day,
      events: dayEvents.map((event) => ({
        id: event.id,
        titleNe: event.titleNe,
        titleEn: event.titleEn,
        isPublicHoliday: event.isPublicHoliday,
      })),
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const now = new Date();
  const today = toISODate(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  );
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(monthStart);
  const session = await getServerSession(request, env);

  return {
    month: monthKey(monthStart),
    prevMonth: monthKey(addMonths(monthStart, -1)),
    nextMonth: monthKey(addMonths(monthStart, 1)),
    monthLabel,
    today,
    weekdays: weekdayNames(),
    cells,
    userEmail: session?.user?.email ?? null,
  };
}

export default function Home() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-6 md:px-6 md:py-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-700" />
          <h1 className="text-xl font-semibold tracking-tight">Mini Patro</h1>
        </div>
        <div className="flex items-center gap-2">
          {loaderData.userEmail ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/auth/session">{loaderData.userEmail}</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link to="/auth/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <Button asChild size="sm" variant="ghost">
            <Link to={`/?month=${loaderData.prevMonth}`}>Previous</Link>
          </Button>
          <div className="text-sm font-medium">{loaderData.monthLabel}</div>
          <Button asChild size="sm" variant="ghost">
            <Link to={`/?month=${loaderData.nextMonth}`}>Next</Link>
          </Button>
        </div>

        <div className="grid grid-cols-7 border-b bg-muted/30">
          {loaderData.weekdays.map((day) => (
            <div
              className="border-r px-2 py-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
              key={day}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {loaderData.cells.map((cell) => (
            <article
              className="min-h-28 border-b border-r p-2 last:border-r-0 md:min-h-32"
              key={cell.adDate}
            >
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span
                  className={
                    cell.isCurrentMonth
                      ? "text-muted-foreground"
                      : "text-muted-foreground/40"
                  }
                >
                  {cell.adDay}
                </span>
                {cell.adDate === loaderData.today ? (
                  <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Today
                  </span>
                ) : null}
              </div>

              {cell.day ? (
                <div className="space-y-1">
                  <p className="text-base leading-none font-semibold">{cell.day.bsDay}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {cell.day.bsMonthNameNe}
                  </p>
                  {cell.day.tithi ? (
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">
                      {cell.day.tithi}
                    </p>
                  ) : null}
                  {cell.events.length > 0 ? (
                    <div className="pt-1">
                      <p className="line-clamp-1 text-[11px] font-medium">
                        {cell.events[0].titleNe}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="pt-3 text-center text-[11px] text-muted-foreground/45">
                  No data
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
