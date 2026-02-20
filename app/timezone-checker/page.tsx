import { Metadata } from "next";
import { TimezoneChecker } from "./timezone-checker";

export const metadata: Metadata = {
  title: "Timezone Checker",
  description:
    "Compare timezones across cities and find overlapping awake hours. Meeting mode shows when everyone is available, Base mode shows per-city overlap with your timezone.",
  keywords: [
    "timezone",
    "time zone converter",
    "meeting planner",
    "overlap hours",
    "world clock",
  ],
};

export default function TimezoneCheckerPage() {
  return <TimezoneChecker />;
}
