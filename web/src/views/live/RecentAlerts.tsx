import { useFrigateReviews } from "@/api/ws";
import { AnimatedEventCard } from "@/components/card/AnimatedEventCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReviewSegment } from "@/types/review";
import { useEffect, useMemo } from "react";
import useSWR from "swr";

type RecentAlertsProps = {
  alertCameras: string | null;
  cameraGroup: string;
};

export function RecentAlerts({ alertCameras, cameraGroup }: RecentAlertsProps) {
  const eventUpdate = useFrigateReviews();

  const { data: allEvents, mutate: updateEvents } = useSWR<ReviewSegment[]>([
    "review",
    {
      limit: 10,
      severity: "alert",
      reviewed: 0,
      cameras: alertCameras,
    },
  ]);

  useEffect(() => {
    if (!eventUpdate) {
      return;
    }

    // if event is ended and was saved, update events list
    if (eventUpdate.after.severity == "alert") {
      if (
        eventUpdate.type == "end" ||
        eventUpdate.type == "new" ||
        eventUpdate.type == "genai"
      ) {
        setTimeout(
          () => updateEvents(),
          eventUpdate.type == "end" ? 1000 : 6000,
        );
      } else if (
        eventUpdate.before.data.objects.length <
        eventUpdate.after.data.objects.length
      ) {
        setTimeout(() => updateEvents(), 5000);
      }

      return;
    }
  }, [eventUpdate, updateEvents]);

  const events = useMemo(() => {
    if (!allEvents) {
      return [];
    }

    const date = new Date();
    date.setHours(date.getHours() - 1);
    const cutoff = date.getTime() / 1000;
    return allEvents.filter((event) => event.start_time > cutoff);
  }, [allEvents]);

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <ScrollArea>
      <TooltipProvider>
        <div className="flex items-center gap-2 px-1">
          {events.map((event) => {
            return (
              <AnimatedEventCard
                key={event.id}
                event={event}
                selectedGroup={cameraGroup}
                updateEvents={updateEvents}
              />
            );
          })}
        </div>
      </TooltipProvider>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
