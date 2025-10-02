import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetingCountdownProps {
  meeting: {
    id: string;
    title: string;
    startTime: string;
    meetingLink?: string;
    location?: string;
  };
  onJoin?: () => void;
}

export const MeetingCountdown = ({ meeting, onJoin }: MeetingCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const meetingTime = new Date(meeting.startTime).getTime();
      const difference = meetingTime - now;

      if (difference < 0) {
        setTimeLeft("In progress");
        setIsUrgent(true);
        return;
      }

      const minutes = Math.floor(difference / 1000 / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      setIsUrgent(minutes <= 15);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes % 60}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [meeting.startTime]);

  return (
    <Card className={`transition-all duration-300 ${isUrgent ? 'border-destructive border-2 shadow-lg' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`w-4 h-4 flex-shrink-0 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`} />
              <Badge variant={isUrgent ? "destructive" : "secondary"} className="text-xs">
                {timeLeft}
              </Badge>
            </div>
            <h4 className="font-semibold text-sm mb-2 line-clamp-2">{meeting.title}</h4>
            <div className="flex flex-col gap-1">
              {meeting.meetingLink && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Video className="w-3 h-3" />
                  <span className="truncate">Video call</span>
                </div>
              )}
              {meeting.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{meeting.location}</span>
                </div>
              )}
            </div>
          </div>
          {meeting.meetingLink && (
            <Button
              size="sm"
              variant={isUrgent ? "default" : "outline"}
              className="flex-shrink-0"
              onClick={onJoin}
            >
              Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
