import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Clock, Flag, User, Briefcase, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface EmailSender {
  name: string;
  email: string;
  company?: string;
  title?: string;
}

interface EmailActionItem {
  text: string;
  deadline?: string;
  priority: "high" | "medium" | "low";
}

interface Email {
  id: string;
  sender: EmailSender;
  subject: string;
  snippet: string;
  receivedAt: string;
  priority: "high" | "medium" | "low";
  hasActionItems: boolean;
  actionItems?: EmailActionItem[];
  labels: string[];
  isSpam: boolean;
  isPromotional: boolean;
}

// Mock data - will be replaced with real Gmail API data
const mockEmails: Email[] = [
  {
    id: "1",
    sender: {
      name: "John Smith",
      email: "john.smith@techcorp.com",
      company: "Tech Corp",
      title: "VP of Sales",
    },
    subject: "Re: Q4 Budget Approval Needed",
    snippet: "Thanks for the proposal. I've reviewed the numbers and we need to discuss the ROI projections before I can approve. Can we schedule a call this week?",
    receivedAt: "2025-10-02T08:30:00Z",
    priority: "high",
    hasActionItems: true,
    actionItems: [
      { text: "Schedule call to discuss ROI projections", deadline: "2025-10-04", priority: "high" },
      { text: "Prepare updated budget analysis", priority: "medium" },
    ],
    labels: ["Important", "Work"],
    isSpam: false,
    isPromotional: false,
  },
  {
    id: "2",
    sender: {
      name: "Sarah Johnson",
      email: "sarah.j@techcorp.com",
      company: "Tech Corp",
      title: "Product Manager",
    },
    subject: "Follow-up: Product Demo Feedback",
    snippet: "Hi! Thank you for the excellent demo yesterday. Our team is very interested. I'm attaching some technical questions from our engineering team that need answers before we proceed.",
    receivedAt: "2025-10-02T07:15:00Z",
    priority: "high",
    hasActionItems: true,
    actionItems: [
      { text: "Answer technical questions from engineering team", deadline: "2025-10-03", priority: "high" },
    ],
    labels: ["Important", "Sales"],
    isSpam: false,
    isPromotional: false,
  },
  {
    id: "3",
    sender: {
      name: "Emily Davis",
      email: "e.davis@acmeindustries.com",
      company: "Acme Industries",
      title: "Director of IT",
    },
    subject: "Questions about integration capabilities",
    snippet: "Before our demo today, I wanted to ask about your API integration with Salesforce and how data syncing works in real-time scenarios.",
    receivedAt: "2025-10-02T06:45:00Z",
    priority: "medium",
    hasActionItems: true,
    actionItems: [
      { text: "Prepare integration documentation for demo", priority: "high" },
    ],
    labels: ["Work", "Pre-Demo"],
    isSpam: false,
    isPromotional: false,
  },
  {
    id: "4",
    sender: {
      name: "Robert Lee",
      email: "robert.lee@globalsolutions.com",
      company: "Global Solutions Inc",
      title: "CTO",
    },
    subject: "Contract Renewal Discussion",
    snippet: "Our contract is up for renewal next month. We're happy with the service but would like to discuss adding 50 more licenses and exploring the enterprise tier.",
    receivedAt: "2025-10-01T16:20:00Z",
    priority: "medium",
    hasActionItems: true,
    actionItems: [
      { text: "Prepare enterprise tier proposal", deadline: "2025-10-05", priority: "medium" },
      { text: "Calculate pricing for 50 additional licenses", priority: "medium" },
    ],
    labels: ["Sales", "Renewal"],
    isSpam: false,
    isPromotional: false,
  },
  {
    id: "5",
    sender: {
      name: "Team Notifications",
      email: "notifications@company.com",
      company: "Internal",
    },
    subject: "Daily Sales Report - October 1st",
    snippet: "Your daily sales metrics: 3 new leads, 2 demos scheduled, 1 contract signed. Total pipeline value: $125,000.",
    receivedAt: "2025-10-01T09:00:00Z",
    priority: "low",
    hasActionItems: false,
    labels: ["Reports", "Internal"],
    isSpam: false,
    isPromotional: false,
  },
];

const EmailList = () => {
  const formatEmailTime = (isoString: string) => {
    const date = parseISO(isoString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.round(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h ago`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const getPriorityIcon = (priority: Email["priority"]) => {
    if (priority === "high") {
      return <Flag className="w-4 h-4 text-destructive fill-destructive" />;
    }
    return null;
  };

  const getPriorityBadge = (priority: Email["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-warning text-warning">Medium</Badge>;
      default:
        return null;
    }
  };

  const filteredEmails = mockEmails.filter((email) => !email.isSpam && !email.isPromotional);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Recent Emails
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredEmails.length} unread emails (last 24h) • Spam & promotions filtered
          </p>
        </div>
        <Badge variant="outline" className="h-8">
          <AlertCircle className="w-3 h-3 mr-1" />
          Backend Required
        </Badge>
      </div>

      <div className="grid gap-4">
        {filteredEmails.map((email) => (
          <Card key={email.id} className={email.priority === "high" ? "border-l-4 border-l-destructive" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getPriorityIcon(email.priority)}
                    <CardTitle className="text-base truncate">{email.subject}</CardTitle>
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {email.sender.name}
                    </span>
                    {email.sender.company && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {email.sender.company}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatEmailTime(email.receivedAt)}
                    </span>
                  </CardDescription>
                </div>
                {getPriorityBadge(email.priority)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Email Snippet */}
              <div>
                <p className="text-sm text-muted-foreground">{email.snippet}</p>
              </div>

              {/* Sender Details */}
              {email.sender.title && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Contact Info</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span>{email.sender.email}</span>
                    <span>•</span>
                    <span>{email.sender.title}</span>
                  </div>
                </div>
              )}

              {/* Action Items */}
              {email.hasActionItems && email.actionItems && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      Detected Action Items ({email.actionItems.length})
                    </p>
                    <div className="space-y-2">
                      {email.actionItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 bg-accent/10 rounded-lg p-3 border border-accent/20"
                        >
                          <div className="flex-1">
                            <p className="text-sm">{item.text}</p>
                            {item.deadline && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Due: {format(parseISO(item.deadline), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={item.priority === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {item.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Labels */}
              {email.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {email.labels.map((label, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-sm">
        <p className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-warning" />
          <span>
            <strong>Note:</strong> Gmail API integration requires Cloud backend. Enable Cloud to
            fetch real emails with read-only OAuth 2.0 permissions, spam filtering, and AI-powered
            action item extraction.
          </span>
        </p>
      </div>
    </div>
  );
};

export default EmailList;
