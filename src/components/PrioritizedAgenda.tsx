import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Flame, Zap, FileText, Pin, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PrioritizedTask {
  description: string;
  dueTime?: string;
  type?: "Meeting" | "Email" | "Task";
}

interface PrioritizedAgenda {
  critical: PrioritizedTask[];
  high: PrioritizedTask[];
  medium: PrioritizedTask[];
  low: { description: string }[];
  fyi: { description: string }[];
}

interface PrioritizedAgendaProps {
  calendarEvents: any[];
  emails: any[];
}

export const PrioritizedAgenda = ({ calendarEvents, emails }: PrioritizedAgendaProps) => {
  const [agenda, setAgenda] = useState<PrioritizedAgenda | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prioritize-tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ calendarEvents, emails }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to prioritize tasks');
      }

      const data = await response.json();
      setAgenda(data);
    } catch (error) {
      console.error('Error prioritizing tasks:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskBadge = (type?: string) => {
    const variants: Record<string, string> = {
      Meeting: "default",
      Email: "secondary",
      Task: "outline",
    };
    return type ? (
      <Badge variant={variants[type] as any} className="ml-2">
        {type}
      </Badge>
    ) : null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI-Powered Task Prioritization
          </CardTitle>
          <CardDescription>
            Analyze your calendar events and emails to create an intelligent daily agenda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={analyzeTasks} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Tasks...
              </>
            ) : (
              "Generate Prioritized Agenda"
            )}
          </Button>
        </CardContent>
      </Card>

      {agenda && (
        <Card>
          <CardHeader>
            <CardTitle>📅 TODAY'S AGENDA - {format(new Date(), "MMMM dd, yyyy")}</CardTitle>
            <CardDescription>⏰ Current Time: {format(new Date(), "hh:mm a")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Critical Tasks */}
            {agenda.critical.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-destructive mb-3">
                  <Flame className="h-5 w-5" />
                  🔥 CRITICAL TASKS (Priority 5)
                </h3>
                <ul className="space-y-2">
                  {agenda.critical.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 border-l-4 border-destructive pl-3 py-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span>{task.description}</span>
                        {task.dueTime && <span className="text-muted-foreground"> | Due: {task.dueTime}</span>}
                        {getTaskBadge(task.type)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* High Priority */}
            {agenda.high.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">
                  <Zap className="h-5 w-5" />
                  ⚡ HIGH PRIORITY (Priority 4)
                </h3>
                <ul className="space-y-2">
                  {agenda.high.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 border-l-4 border-orange-500 pl-3 py-2">
                      <span className="flex-1">
                        {task.description}
                        {task.dueTime && <span className="text-muted-foreground"> | Due: {task.dueTime}</span>}
                        {getTaskBadge(task.type)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medium Priority */}
            {agenda.medium.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">
                  <FileText className="h-5 w-5" />
                  📋 MEDIUM PRIORITY (Priority 3)
                </h3>
                <ul className="space-y-2">
                  {agenda.medium.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 border-l-4 border-blue-500 pl-3 py-2">
                      <span className="flex-1">
                        {task.description}
                        {task.dueTime && <span className="text-muted-foreground"> | Due: {task.dueTime}</span>}
                        {getTaskBadge(task.type)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Low Priority */}
            {agenda.low.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-muted-foreground mb-3">
                  <Pin className="h-5 w-5" />
                  📌 LOW PRIORITY (Priority 2)
                </h3>
                <ul className="space-y-2">
                  {agenda.low.map((task, idx) => (
                    <li key={idx} className="border-l-4 border-muted pl-3 py-2">
                      {task.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FYI Items */}
            {agenda.fyi.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-muted-foreground mb-3">
                  <Info className="h-5 w-5" />
                  ℹ️ FYI ITEMS (Priority 1)
                </h3>
                <ul className="space-y-2">
                  {agenda.fyi.map((task, idx) => (
                    <li key={idx} className="border-l-4 border-muted-foreground/30 pl-3 py-2 text-muted-foreground">
                      {task.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
