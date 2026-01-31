import { NextResponse } from "next/server";
import Parser from "rss-parser";

interface UnavailabilityEvent {
  messageId: string;
  status: string;
  type: string;
  eventStart: string;
  eventStop: string;
  unavailableCapacity: number;
  affectedUnit: string;
  fuelType: string;
}

function extractField(description: string, fieldName: string): string {
  // Find the field in the HTML list items using string methods
  const searchKey = `${fieldName} :`;
  const startIndex = description.indexOf(searchKey);
  if (startIndex === -1) return "";

  const valueStart = startIndex + searchKey.length;
  const endIndex = description.indexOf("<", valueStart);
  if (endIndex === -1) return "";

  return description.slice(valueStart, endIndex).trim();
}

function parseDescription(description: string): Partial<UnavailabilityEvent> {
  return {
    status: extractField(description, "Event status"),
    type: extractField(description, "Type of indisponibility"),
    eventStart: extractField(description, "Event start"),
    eventStop: extractField(description, "Event stop"),
    unavailableCapacity: parseInt(extractField(description, "Unavailable capacity"), 10) || 0,
    affectedUnit: extractField(description, "Affected asset or unit"),
    fuelType: extractField(description, "Fuel type"),
  };
}

export async function GET() {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL(
      "https://www.edf.fr/toutes-les-indisponibilites-doaat/feed"
    );

    const events: UnavailabilityEvent[] = feed.items.map((item) => {
      const parsed = parseDescription(item.content || item.contentSnippet || "");
      return {
        messageId: item.title || "",
        status: parsed.status || "",
        type: parsed.type || "",
        eventStart: parsed.eventStart || "",
        eventStop: parsed.eventStop || "",
        unavailableCapacity: parsed.unavailableCapacity || 0,
        affectedUnit: parsed.affectedUnit || "",
        fuelType: parsed.fuelType || "",
      };
    });

    // Filter only active nuclear events
    // Deduplicate by unit name, keeping the event with highest unavailable capacity
    const now = new Date();
    const activeEventsByUnit = new Map<string, UnavailabilityEvent>();

    for (const event of events) {
      if (event.status !== "Actif" || event.fuelType !== "Nucléaire") continue;

      const eventStart = new Date(event.eventStart);
      const eventStop = new Date(event.eventStop);

      if (now >= eventStart && now <= eventStop) {
        const existing = activeEventsByUnit.get(event.affectedUnit);
        if (!existing || event.unavailableCapacity > existing.unavailableCapacity) {
          activeEventsByUnit.set(event.affectedUnit, event);
        }
      }
    }

    const activeEvents = Array.from(activeEventsByUnit.values());
    const totalUnavailableCapacity = activeEvents.reduce(
      (sum, event) => sum + event.unavailableCapacity,
      0
    );

    return NextResponse.json({
      totalUnavailableCapacity,
      activeEventsCount: activeEvents.length,
      activeEvents: activeEvents.map((e) => ({
        unit: e.affectedUnit,
        unavailableCapacity: e.unavailableCapacity,
        eventStart: e.eventStart,
        eventStop: e.eventStop,
        type: e.type,
      })),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching EDF data:", error);
    return NextResponse.json(
      { error: "Failed to fetch unavailability data" },
      { status: 500 }
    );
  }
}
