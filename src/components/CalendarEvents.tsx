import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Users, Video, AlertCircle } from "lucide-react";
import { format, parseISO, formatDuration, intervalToDuration } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CalendarAttendee {
  name: string;
  email: string;
  responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  attendees: CalendarAttendee[];
  description?: string;
  location?: string;
  meetingLink?: string;
  timezone: string;
  priority: "high" | "medium" | "low";
}

// Mock data - will be replaced with real Google Calendar API data
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Sales Strategy Review with Tech Corp",
    startTime: "2025-10-02T09:00:00Z",
    endTime: "2025-10-02T10:00:00Z",
    duration: 60,
    attendees: [
      { name: "John Smith", email: "john.smith@techcorp.com", responseStatus: "accepted" },
      { name: "Sarah Johnson", email: "sarah.j@techcorp.com", responseStatus: "accepted" },
      { name: "Mike Chen", email: "mike.chen@techcorp.com", responseStatus: "tentative" },
    ],
    description: "Q4 sales pipeline review. Discuss new enterprise opportunities and competitor analysis.",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    timezone: "America/New_York",
    priority: "high",
  },
  {
    id: "2",
    title: "Product Demo - Acme Industries",
    startTime: "2025-10-02T11:30:00Z",
    endTime: "2025-10-02T12:00:00Z",
    duration: 30,
    attendees: [
      { name: "Emily Davis", email: "e.davis@acmeindustries.com", responseStatus: "accepted" },
    ],
    description: "Demo our new analytics platform. Focus on ROI metrics and integration capabilities.",
    meetingLink: "https://zoom.us/j/123456789",
    timezone: "America/New_York",
    priority: "high",
  },
  {
    id: "3",
    title: "Team Standup",
    startTime: "2025-10-02T14:00:00Z",
    endTime: "2025-10-02T14:15:00Z",
    duration: 15,
    attendees: [
      { name: "Team", email: "team@company.com", responseStatus: "accepted" },
    ],
    description: "Daily sync on ongoing projects and blockers.",
    location: "Conference Room B",
    timezone: "America/New_York",
    priority: "medium",
  },
  {
    id: "4",
    title: "Client Check-in: Global Solutions Inc",
    startTime: "2025-10-02T15:30:00Z",
    endTime: "2025-10-02T16:00:00Z",
    duration: 30,
    attendees: [
      { name: "Robert Lee", email: "robert.lee@globalsolutions.com", responseStatus: "accepted" },
      { name: "Amanda White", email: "a.white@globalsolutions.com", responseStatus: "needsAction" },
    ],
    description: "Monthly check-in. Review satisfaction scores and discuss expansion opportunities.",
    meetingLink: "https://meet.google.com/xyz-abcd-efg",
    timezone: "America/New_York",
    priority: "medium",
  },
];

const CalendarEvents = () => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchEvents();
  }, []);

  const checkAuthAndFetchEvents = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);

    if (session) {
      await fetchUserEvents();
    } else {
      setEvents(mockEvents);
    }
    setLoading(false);
  };

  const fetchUserEvents = async () => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('event_date', new Date().toISOString().split('T')[0])
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    if (data && data.length > 0) {
      const formattedEvents: CalendarEvent[] = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        startTime: `${event.event_date}T${event.start_time || '09:00:00'}Z`,
        endTime: `${event.event_date}T${event.end_time || '10:00:00'}Z`,
        duration: event.start_time && event.end_time ? 
          Math.round((new Date(`2000-01-01T${event.end_time}`).getTime() - 
                     new Date(`2000-01-01T${event.start_time}`).getTime()) / 60000) : 60,
        attendees: event.attendees || [],
        description: event.description || undefined,
        location: event.location || undefined,
        timezone: userTimezone,
        priority: (event.priority as "high" | "medium" | "low") || "medium",
      }));
      setEvents(formattedEvents);
    } else {
      setEvents([]);
    }
  };

  const formatEventTime = (isoString: string, timezone: string) => {
    const date = parseISO(isoString);
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, "h:mm a");
  };

  const getDurationText = (minutes: number) => {
    const duration = intervalToDuration({ start: 0, end: minutes * 60 * 1000 });
    if (duration.hours && duration.hours > 0) {
      return `${duration.hours}h ${duration.minutes}m`;
    }
    return `${minutes}m`;
  };

  const getAttendeeStatusColor = (status: CalendarAttendee["responseStatus"]) => {
    switch (status) {
      case "accepted":
        return "bg-success text-success-foreground";
      case "declined":
        return "bg-destructive text-destructive-foreground";
      case "tentative":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: CalendarEvent["priority"]) => {
    switch (priority) {
      case "high":
        return "border-destructive";
      case "medium":
        return "border-warning";
      default:
        return "border-muted";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading calendar...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Today's Calendar
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {events.length} events scheduled • Timezone: {userTimezone}
            {!isAuthenticated && " • Demo Data"}
          </p>
        </div>
        {!isAuthenticated && (
          <Badge variant="outline" className="h-8">
            <AlertCircle className="w-3 h-3 mr-1" />
            Demo Mode
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className={`border-l-4 ${getPriorityColor(event.priority)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatEventTime(event.startTime, event.timezone)} -{" "}
                      {formatEventTime(event.endTime, event.timezone)}
                    </span>
                    <span className="text-xs">
                      ({getDurationText(event.duration)})
                    </span>
                  </CardDescription>
                </div>
                {event.priority === "high" && (
                  <Badge variant="destructive">High Priority</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              {event.description && (
                <div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              )}

              <Separator />

              {/* Location/Link */}
              <div className="flex flex-wrap gap-3">
                {event.meetingLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4 text-primary" />
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {/* Attendees */}
              {event.attendees.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    Attendees ({event.attendees.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.attendees.map((attendee, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{attendee.name}</span>
                          <span className="text-xs text-muted-foreground">{attendee.email}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getAttendeeStatusColor(attendee.responseStatus)}`}
                        >
                          {attendee.responseStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm">
          <p className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span>
              <strong>Demo Mode:</strong> Sign in to view and manage your own calendar events.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarEvents;
