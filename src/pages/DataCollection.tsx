import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Mail, Zap, Users, Target } from "lucide-react";
import CalendarEvents from "@/components/CalendarEvents";
import EmailList from "@/components/EmailList";
import { PrioritizedAgenda } from "@/components/PrioritizedAgenda";
import { AttendeeIntelligence } from "@/components/AttendeeIntelligence";
import { SalesIntelligenceEngine } from "@/components/SalesIntelligenceEngine";

const DataCollection = () => {
  const [attendeeIntelligence, setAttendeeIntelligence] = useState<any[]>([]);
  const [companyResearch, setCompanyResearch] = useState<any>(null);

  const mockCalendarEvents = [
    {
      id: "1",
      title: "Q4 Strategy Meeting",
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      duration: "1 hour",
      attendees: [
        { name: "Sarah Johnson", email: "sarah@company.com" },
        { name: "Mike Chen", email: "mike@company.com" }
      ],
      description: "Quarterly planning and budget review",
      location: "Conference Room A",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      timezone: "America/New_York",
      priority: "high"
    },
    {
      id: "2",
      title: "Client Demo - TechCorp",
      startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      duration: "1 hour",
      attendees: [
        { name: "John Smith", email: "john@techcorp.com" },
        { name: "Emily Davis", email: "emily@techcorp.com" }
      ],
      description: "Product demonstration for potential client",
      location: "Virtual",
      meetingLink: "https://zoom.us/j/123456789",
      timezone: "America/Los_Angeles",
      priority: "critical"
    }
  ];

  const mockEmails = [
    {
      id: "1",
      sender: {
        name: "David Chen",
        email: "david@techcorp.com",
        avatar: "DC"
      },
      subject: "URGENT: Security Incident Report",
      snippet: "We've detected unusual activity on the production servers...",
      receivedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      priority: "urgent",
      actionItems: ["Review security logs", "Schedule emergency meeting"],
      labels: ["Security", "Critical"],
      isSpam: false,
      isPromotional: false
    },
    {
      id: "2",
      sender: {
        name: "Sarah Johnson",
        email: "sarah@company.com",
        avatar: "SJ"
      },
      subject: "Follow-up: Q4 Budget Proposal",
      snippet: "As discussed in our last meeting, here are the updated figures...",
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      priority: "high",
      actionItems: ["Review budget", "Provide feedback by Friday"],
      labels: ["Finance", "Action Required"],
      isSpam: false,
      isPromotional: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Data Collection Module</h1>
          <p className="text-muted-foreground mt-2">
            Calendar events and email analysis from Google APIs
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail className="w-4 h-4" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="prioritized" className="gap-2">
              <Zap className="w-4 h-4" />
              Prioritized
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2">
              <Users className="w-4 h-4" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <Target className="w-4 h-4" />
              Sales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarEvents />
          </TabsContent>

          <TabsContent value="emails">
            <EmailList />
          </TabsContent>

          <TabsContent value="prioritized">
            <PrioritizedAgenda 
              calendarEvents={mockCalendarEvents}
              emails={mockEmails}
            />
          </TabsContent>

          <TabsContent value="intelligence">
            <AttendeeIntelligence calendarEvents={mockCalendarEvents} />
          </TabsContent>

          <TabsContent value="sales">
            <SalesIntelligenceEngine 
              calendarEvents={mockCalendarEvents}
              attendeeIntelligence={attendeeIntelligence}
              companyResearch={companyResearch}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataCollection;
