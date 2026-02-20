"use client";

import { useState, useMemo } from "react";
import { useLocalStorage } from "react-use";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Plus,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// --- Types ---

type TimeFormat = "12h" | "24h";
type OverlapMode = "meeting" | "base";
type City = { name: string; timezone: string; country: string };
type Settings = {
  wakeupFrom: number;
  wakeupTo: number;
  timeFormat: TimeFormat;
};

// --- City Data ---

const CITIES: City[] = [
  { name: "San Francisco", timezone: "America/Los_Angeles", country: "US" },
  { name: "New York", timezone: "America/New_York", country: "US" },
  { name: "Los Angeles", timezone: "America/Los_Angeles", country: "US" },
  { name: "Chicago", timezone: "America/Chicago", country: "US" },
  { name: "Denver", timezone: "America/Denver", country: "US" },
  { name: "London", timezone: "Europe/London", country: "GB" },
  { name: "Paris", timezone: "Europe/Paris", country: "FR" },
  { name: "Geneva", timezone: "Europe/Zurich", country: "CH" },
  { name: "Berlin", timezone: "Europe/Berlin", country: "DE" },
  { name: "Amsterdam", timezone: "Europe/Amsterdam", country: "NL" },
  { name: "Madrid", timezone: "Europe/Madrid", country: "ES" },
  { name: "Rome", timezone: "Europe/Rome", country: "IT" },
  { name: "Stockholm", timezone: "Europe/Stockholm", country: "SE" },
  { name: "Moscow", timezone: "Europe/Moscow", country: "RU" },
  { name: "Istanbul", timezone: "Europe/Istanbul", country: "TR" },
  { name: "Dubai", timezone: "Asia/Dubai", country: "AE" },
  { name: "Mumbai", timezone: "Asia/Kolkata", country: "IN" },
  { name: "Bangkok", timezone: "Asia/Bangkok", country: "TH" },
  { name: "Singapore", timezone: "Asia/Singapore", country: "SG" },
  { name: "Hong Kong", timezone: "Asia/Hong_Kong", country: "HK" },
  { name: "Shanghai", timezone: "Asia/Shanghai", country: "CN" },
  { name: "Tokyo", timezone: "Asia/Tokyo", country: "JP" },
  { name: "Seoul", timezone: "Asia/Seoul", country: "KR" },
  { name: "Sydney", timezone: "Australia/Sydney", country: "AU" },
  { name: "Auckland", timezone: "Pacific/Auckland", country: "NZ" },
  { name: "Denpasar", timezone: "Asia/Makassar", country: "ID" },
  { name: "Jakarta", timezone: "Asia/Jakarta", country: "ID" },
  { name: "São Paulo", timezone: "America/Sao_Paulo", country: "BR" },
  { name: "Mexico City", timezone: "America/Mexico_City", country: "MX" },
  { name: "Toronto", timezone: "America/Toronto", country: "CA" },
  { name: "Vancouver", timezone: "America/Vancouver", country: "CA" },
  { name: "Lisbon", timezone: "Europe/Lisbon", country: "PT" },
  { name: "Cairo", timezone: "Africa/Cairo", country: "EG" },
  { name: "Nairobi", timezone: "Africa/Nairobi", country: "KE" },
  { name: "Honolulu", timezone: "Pacific/Honolulu", country: "US" },
];

const DEFAULT_CITIES: City[] = [
  CITIES.find((c) => c.name === "San Francisco")!,
  CITIES.find((c) => c.name === "Denpasar")!,
  CITIES.find((c) => c.name === "Geneva")!,
];

const DEFAULT_SETTINGS: Settings = {
  wakeupFrom: 7,
  wakeupTo: 23,
  timeFormat: "12h",
};

// --- Timezone Utilities ---

function getUtcOffset(timezone: string): number {
  const now = new Date();
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

function getHourInTimezone(
  referenceTimezone: string,
  targetTimezone: string,
  referenceHour: number
): number {
  const refOffset = getUtcOffset(referenceTimezone);
  const targetOffset = getUtcOffset(targetTimezone);
  const diff = targetOffset - refOffset;
  return (((referenceHour + diff) % 24) + 24) % 24;
}

function formatHour(hour: number, format: TimeFormat): string {
  if (format === "24h") return `${hour.toString().padStart(2, "0")}h`;
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

function isAwake(hour: number, from: number, to: number): boolean {
  if (from <= to) return hour >= from && hour <= to;
  return hour >= from || hour <= to;
}

function getOverlapHours(
  cities: City[],
  wakeFrom: number,
  wakeTo: number
): number[] {
  if (cities.length === 0) return [];
  const refTz = cities[0].timezone;
  const overlap: number[] = [];
  for (let refHour = 0; refHour < 24; refHour++) {
    const allAwake = cities.every((city) => {
      const cityHour = getHourInTimezone(refTz, city.timezone, refHour);
      return isAwake(cityHour, wakeFrom, wakeTo);
    });
    if (allAwake) overlap.push(refHour);
  }
  return overlap;
}

function formatUtcOffset(timezone: string): string {
  const offset = getUtcOffset(timezone);
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  if (minutes === 0) return `UTC${sign}${hours}`;
  return `UTC${sign}${hours}:${minutes.toString().padStart(2, "0")}`;
}

function toRanges(hours: number[]): [number, number][] {
  if (hours.length === 0) return [];
  const sorted = [...hours].sort((a, b) => a - b);
  const ranges: [number, number][] = [];
  let start = sorted[0];
  let end = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push([start, end]);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push([start, end]);
  return ranges;
}

// --- Sub-Components ---

function AddCity({
  onAdd,
  existingCities,
}: {
  onAdd: (city: City) => void;
  existingCities: City[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = CITIES.filter((city) => {
    if (
      existingCities.some(
        (c) => c.name === city.name && c.timezone === city.timezone
      )
    )
      return false;
    if (!search) return true;
    return (
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.country.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add City
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-2">
          <Input
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-y-auto px-1 pb-1">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground p-2">
              No cities found
            </p>
          )}
          {filtered.map((city) => (
            <button
              key={`${city.name}-${city.timezone}`}
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent flex justify-between items-center"
              onClick={() => {
                onAdd(city);
                setSearch("");
                setOpen(false);
              }}
            >
              <span>{city.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatUtcOffset(city.timezone)}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SettingsDialog({
  settings,
  onUpdate,
}: {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <SettingsIcon className="h-3.5 w-3.5" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          <div className="space-y-3">
            <Label>
              Wake up: {formatHour(settings.wakeupFrom, settings.timeFormat)}
            </Label>
            <Slider
              min={0}
              max={23}
              step={1}
              value={[settings.wakeupFrom]}
              onValueChange={([v]) => onUpdate({ wakeupFrom: v })}
            />
          </div>
          <div className="space-y-3">
            <Label>
              Sleep: {formatHour(settings.wakeupTo, settings.timeFormat)}
            </Label>
            <Slider
              min={0}
              max={23}
              step={1}
              value={[settings.wakeupTo]}
              onValueChange={([v]) => onUpdate({ wakeupTo: v })}
            />
          </div>
          <div className="border-t" />
          <div className="flex items-center justify-between">
            <Label>24h format</Label>
            <Switch
              checked={settings.timeFormat === "24h"}
              onCheckedChange={(checked: boolean) =>
                onUpdate({ timeFormat: checked ? "24h" : "12h" })
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HourCell({
  hour,
  wakeFrom,
  wakeTo,
  isOverlap,
  format,
}: {
  hour: number;
  wakeFrom: number;
  wakeTo: number;
  isOverlap: boolean;
  format: TimeFormat;
}) {
  const awake = isAwake(hour, wakeFrom, wakeTo);
  return (
    <div
      className={cn(
        "flex items-center justify-center text-xs font-mono h-8 min-w-10 rounded-sm border transition-colors",
        !awake && "bg-muted/50 text-muted-foreground/50 border-transparent",
        awake &&
          !isOverlap &&
          "bg-secondary text-secondary-foreground border-border",
        awake &&
          isOverlap &&
          "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold"
      )}
    >
      {formatHour(hour, format)}
    </div>
  );
}

function CityRow({
  city,
  index,
  referenceTimezone,
  overlapSet,
  wakeFrom,
  wakeTo,
  format,
  onRemove,
  onSetReference,
}: {
  city: City;
  index: number;
  referenceTimezone: string;
  overlapSet: Set<number>;
  wakeFrom: number;
  wakeTo: number;
  format: TimeFormat;
  onRemove: (index: number) => void;
  onSetReference: (index: number) => void;
}) {
  const isRef = index === 0;
  const hours = Array.from({ length: 24 }, (_, h) =>
    getHourInTimezone(referenceTimezone, city.timezone, h)
  );

  return (
    <div className="flex gap-3 items-start">
      <div className="shrink-0 w-36 pt-1">
        <button
          onClick={() => onSetReference(index)}
          className="text-left w-full"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm truncate">{city.name}</span>
            {isRef && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                REF
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatUtcOffset(city.timezone)}
          </span>
        </button>
      </div>

      <div className="flex gap-0.5 overflow-x-auto flex-1 pb-1">
        {hours.map((hour, h) => (
          <HourCell
            key={h}
            hour={hour}
            wakeFrom={wakeFrom}
            wakeTo={wakeTo}
            isOverlap={overlapSet.has(h)}
            format={format}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(index)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function MobileTable({
  cities,
  settings,
  overlapSets,
  onRemove,
  onSetReference,
}: {
  cities: City[];
  settings: Settings;
  overlapSets: Set<number>[];
  onRemove: (index: number) => void;
  onSetReference: (index: number) => void;
}) {
  const refTz = cities[0].timezone;
  const cityHours = cities.map((city) =>
    Array.from({ length: 24 }, (_, h) =>
      getHourInTimezone(refTz, city.timezone, h)
    )
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            {cities.map((city, i) => (
              <th
                key={`${city.name}-${city.timezone}`}
                className="p-1 text-left align-top"
              >
                <div className="flex items-start justify-between gap-1">
                  <button
                    onClick={() => onSetReference(i)}
                    className="text-left"
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-xs">{city.name}</span>
                      {i === 0 && (
                        <Badge
                          variant="default"
                          className="text-[9px] px-1 py-0"
                        >
                          REF
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatUtcOffset(city.timezone)}
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 24 }, (_, refHour) => (
            <tr key={refHour}>
              {cities.map((city, ci) => {
                const hour = cityHours[ci][refHour];
                const awake = isAwake(
                  hour,
                  settings.wakeupFrom,
                  settings.wakeupTo
                );
                const isOverlap = overlapSets[ci]?.has(refHour) ?? false;
                return (
                  <td key={`${city.name}-${refHour}`} className="p-0.5">
                    <div
                      className={cn(
                        "text-center text-xs font-mono py-1.5 rounded-sm border transition-colors",
                        !awake &&
                          "bg-muted/50 text-muted-foreground/50 border-transparent",
                        awake &&
                          !isOverlap &&
                          "bg-secondary text-secondary-foreground border-border",
                        awake &&
                          isOverlap &&
                          "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold"
                      )}
                    >
                      {formatHour(hour, settings.timeFormat)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverlapSummary({
  cities,
  overlapSets,
  format,
  mode,
}: {
  cities: City[];
  overlapSets: Set<number>[];
  format: TimeFormat;
  mode: OverlapMode;
}) {
  if (mode === "meeting") {
    const overlapHours = Array.from(overlapSets[0]).sort((a, b) => a - b);
    if (overlapHours.length === 0) {
      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          No overlapping awake hours found
        </div>
      );
    }
    const ranges = toRanges(overlapHours);
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {overlapHours.length}h overlap
        </span>
        {ranges.map(([s, e]) => (
          <Badge
            key={s}
            variant="secondary"
            className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
          >
            {formatHour(s, format)} — {formatHour((e + 1) % 24, format)}
          </Badge>
        ))}
        <span className="text-xs text-muted-foreground">
          ({cities[0].name} time)
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {cities.slice(1).map((city, idx) => {
        const overlapHours = Array.from(overlapSets[idx + 1]).sort((a, b) => a - b);
        if (overlapHours.length === 0) {
          return (
            <div
              key={city.name}
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              No overlap with {city.name}
            </div>
          );
        }
        const ranges = toRanges(overlapHours);
        return (
          <div
            key={city.name}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex flex-wrap items-center gap-2"
          >
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {city.name}: {overlapHours.length}h
            </span>
            {ranges.map(([s, e]) => (
              <Badge
                key={s}
                variant="secondary"
                className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
              >
                {formatHour(s, format)} — {formatHour((e + 1) % 24, format)}
              </Badge>
            ))}
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">
        ({cities[0].name} time)
      </p>
    </div>
  );
}

// --- Main Component ---

export function TimezoneChecker() {
  const [storedCities, setStoredCities] = useLocalStorage<City[]>(
    "tz-cities",
    DEFAULT_CITIES
  );
  const [storedSettings, setStoredSettings] = useLocalStorage<Settings>(
    "tz-settings",
    DEFAULT_SETTINGS
  );
  const [storedMode, setMode] = useLocalStorage<OverlapMode>(
    "tz-mode",
    "meeting"
  );

  const cities = storedCities ?? DEFAULT_CITIES;
  const settings = storedSettings ?? DEFAULT_SETTINGS;
  const mode = storedMode ?? "meeting";

  const overlapSets = useMemo(() => {
    if (cities.length === 0) return [];
    if (mode === "meeting") {
      const globalOverlap = new Set(
        getOverlapHours(cities, settings.wakeupFrom, settings.wakeupTo)
      );
      return cities.map(() => globalOverlap);
    }
    return cities.map((_, i) => {
      if (i === 0) return new Set<number>();
      return new Set(
        getOverlapHours(
          [cities[0], cities[i]],
          settings.wakeupFrom,
          settings.wakeupTo
        )
      );
    });
  }, [cities, settings.wakeupFrom, settings.wakeupTo, mode]);

  const addCity = (city: City) => {
    if (
      cities.some(
        (c) => c.timezone === city.timezone && c.name === city.name
      )
    )
      return;
    setStoredCities([...cities, city]);
  };

  const removeCity = (index: number) => {
    setStoredCities(cities.filter((_, i) => i !== index));
  };

  const setReference = (index: number) => {
    const newCities = [...cities];
    const [city] = newCities.splice(index, 1);
    newCities.unshift(city);
    setStoredCities(newCities);
  };

  const updateSettings = (partial: Partial<Settings>) => {
    setStoredSettings({ ...settings, ...partial });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Globe className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              Timezone Checker
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center rounded-lg border bg-muted p-0.5">
              <button
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  mode === "meeting"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("meeting")}
              >
                Meeting
              </button>
              <button
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  mode === "base"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("base")}
              >
                Base
              </button>
            </div>
            <AddCity onAdd={addCity} existingCities={cities} />
            <SettingsDialog settings={settings} onUpdate={updateSettings} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {cities.length > 1 && (
          <div className="mb-4">
            <OverlapSummary
              cities={cities}
              overlapSets={overlapSets}
              format={settings.timeFormat}
              mode={mode}
            />
          </div>
        )}

        {cities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Add cities to compare timezones
          </div>
        ) : (
          <>
            <div className="hidden md:flex flex-col gap-2">
              {cities.map((city, i) => (
                <CityRow
                  key={`${city.name}-${city.timezone}`}
                  city={city}
                  index={i}
                  referenceTimezone={cities[0].timezone}
                  overlapSet={overlapSets[i] ?? new Set()}
                  wakeFrom={settings.wakeupFrom}
                  wakeTo={settings.wakeupTo}
                  format={settings.timeFormat}
                  onRemove={removeCity}
                  onSetReference={setReference}
                />
              ))}
            </div>

            <div className="md:hidden">
              <MobileTable
                cities={cities}
                settings={settings}
                overlapSets={overlapSets}
                onRemove={removeCity}
                onSetReference={setReference}
              />
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Click a city name to set it as reference.{" "}
          {mode === "meeting"
            ? "Green cells = everyone awake."
            : `Green cells = overlap with ${cities[0]?.name ?? "reference"}.`}
        </p>
      </div>
    </div>
  );
}
