import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface DailySummaryProps {
  meetingsCount: number;
  emailsCount: number;
  upcomingMeeting?: {
    title: string;
    startTime: string;
  };
  criticalTasks: number;
}

export const DailySummary = ({
  meetingsCount,
  emailsCount,
  upcomingMeeting,
  criticalTasks
}: DailySummaryProps) => {
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Today's Overview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{currentDate}</p>
          </div>
          <Badge variant="outline" className="h-8 px-3">
            <Clock className="w-3 h-3 mr-1" />
            {format(new Date(), "h:mm a")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Meetings */}
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border">
            <Calendar className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold">{meetingsCount}</div>
            <p className="text-sm text-muted-foreground">Meetings</p>
          </div>

          {/* Emails */}
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border">
            <Mail className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-3xl font-bold">{emailsCount}</div>
            <p className="text-sm text-muted-foreground">Emails</p>
          </div>

          {/* Critical Tasks */}
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border">
            <AlertCircle className="w-8 h-8 text-destructive mb-2" />
            <div className="text-3xl font-bold">{criticalTasks}</div>
            <p className="text-sm text-muted-foreground">Critical</p>
          </div>

          {/* Next Meeting */}
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border">
            <TrendingUp className="w-8 h-8 text-success mb-2" />
            <div className="text-lg font-bold">
              {upcomingMeeting ? format(new Date(upcomingMeeting.startTime), "h:mm a") : "--"}
            </div>
            <p className="text-xs text-muted-foreground text-center">Next Meeting</p>
          </div>
        </div>

        {upcomingMeeting && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium">Up Next:</p>
            <p className="text-sm text-muted-foreground">{upcomingMeeting.title}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
