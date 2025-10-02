import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  Mail,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface TaskCardProps {
  task: {
    description: string;
    dueTime?: string;
    type?: "Meeting" | "Email" | "Task";
    priority: "critical" | "high" | "medium" | "low" | "fyi";
    details?: string;
    actionRequired?: string;
  };
  onComplete?: () => void;
}

export const TaskCard = ({ task, onComplete }: TaskCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const getPriorityConfig = () => {
    switch (task.priority) {
      case "critical":
        return {
          color: "border-destructive bg-destructive/5",
          badge: "destructive",
          icon: <AlertCircle className="w-4 h-4" />,
        };
      case "high":
        return {
          color: "border-orange-500 bg-orange-500/5",
          badge: "outline",
          icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
        };
      case "medium":
        return {
          color: "border-blue-500 bg-blue-500/5",
          badge: "secondary",
          icon: null,
        };
      case "low":
        return {
          color: "border-muted",
          badge: "outline",
          icon: null,
        };
      default:
        return {
          color: "border-muted bg-muted/30",
          badge: "outline",
          icon: null,
        };
    }
  };

  const getTypeIcon = () => {
    switch (task.type) {
      case "Meeting":
        return <Calendar className="w-4 h-4" />;
      case "Email":
        return <Mail className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const config = getPriorityConfig();

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete?.();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className={`transition-all duration-300 hover:shadow-md ${config.color} ${
          isCompleted ? "opacity-50" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={handleComplete}
              className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
              disabled={isCompleted}
            >
              <CheckCircle2
                className={`w-5 h-5 ${
                  isCompleted
                    ? "text-success fill-success"
                    : "text-muted-foreground hover:text-primary"
                }`}
              />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p
                  className={`font-medium text-sm ${
                    isCompleted ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.description}
                </p>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {task.type && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    {getTypeIcon()}
                    {task.type}
                  </Badge>
                )}
                <Badge variant={config.badge as any} className="text-xs gap-1">
                  {config.icon}
                  {task.priority}
                </Badge>
                {task.dueTime && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(task.dueTime), "h:mm a")}
                  </Badge>
                )}
              </div>

              <CollapsibleContent className="mt-3 space-y-2 animate-accordion-down">
                {task.details && (
                  <p className="text-sm text-muted-foreground">{task.details}</p>
                )}
                {task.actionRequired && (
                  <div className="bg-card rounded-lg p-3 border">
                    <p className="text-xs font-semibold mb-1">Action Required:</p>
                    <p className="text-sm">{task.actionRequired}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Mark Complete
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-7">
                    Snooze
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </div>
        </CardContent>
      </Card>
    </Collapsible>
  );
};
