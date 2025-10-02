import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Settings,
  Calendar,
  Mail,
  Target,
  Clock,
  Sparkles,
} from "lucide-react";
import { DailySummary } from "@/components/DailySummary";
import { MeetingCountdown } from "@/components/MeetingCountdown";
import { TaskCard } from "@/components/TaskCard";
import { ClientIntelligencePanel } from "@/components/ClientIntelligencePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { format } from "date-fns";

const IntelligentDashboard = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Mock data - will be replaced with real data
  const mockMeetings = [
    {
      id: "1",
      title: "Sales Strategy Review with Tech Corp",
      startTime: new Date(Date.now() + 30 * 60000).toISOString(),
      meetingLink: "https://meet.google.com/abc",
      location: undefined,
    },
    {
      id: "2",
      title: "Product Demo - Acme Industries",
      startTime: new Date(Date.now() + 120 * 60000).toISOString(),
      meetingLink: "https://zoom.us/j/123",
      location: undefined,
    },
  ];

  const mockTasks = [
    {
      description: "Schedule call to discuss ROI projections with John Smith",
      dueTime: new Date(Date.now() + 2 * 3600000).toISOString(),
      type: "Email" as const,
      priority: "critical" as const,
      details: "John requested this in his latest email regarding Q4 budget approval.",
      actionRequired: "Send calendar invite with 3 time slot options",
    },
    {
      description: "Prepare updated budget analysis for Tech Corp",
      priority: "high" as const,
      type: "Task" as const,
      details: "Include ROI projections and competitor analysis",
    },
    {
      description: "Answer technical questions from Acme engineering team",
      dueTime: new Date(Date.now() + 1 * 3600000).toISOString(),
      type: "Email" as const,
      priority: "high" as const,
    },
    {
      description: "Team standup meeting",
      dueTime: new Date(Date.now() + 4 * 3600000).toISOString(),
      type: "Meeting" as const,
      priority: "medium" as const,
    },
  ];

  const mockIntelligence = {
    company: "Tech Corp",
    attendee: { name: "John Smith", title: "VP of Sales" },
    companySnapshot: {
      industry: "Enterprise Software",
      size: "500-1000 employees",
      stage: "Growth",
    },
    financialHealth: {
      status: "Healthy",
      revenue: "$50M ARR",
    },
    recommendedApproach: {
      keyPainPoints: [
        "Scaling sales operations across multiple regions",
        "Need better visibility into sales pipeline",
        "Integration challenges with existing CRM",
      ],
      whatToPitch: [
        "Multi-region deployment capabilities",
        "Real-time analytics dashboard",
        "Seamless CRM integrations",
      ],
      valueProposition:
        "Our platform helps scale sales operations globally while providing real-time insights and seamless integrations with existing tools.",
    },
    talkingPoints: [
      "Reference their recent expansion into European markets",
      "Discuss similar success with enterprise clients in same vertical",
      "Mention our SOC 2 compliance for enterprise security requirements",
      "Prepare case study from similar-sized customer",
    ],
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const handleViewIntelligence = (meeting: any) => {
    setSelectedMeeting(meeting);
    setShowIntelligence(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                Sales Intelligence
              </h1>
              <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                AI-powered daily command center
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last updated: {format(lastUpdated, "h:mm a")}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Daily Summary */}
        <DailySummary
          meetingsCount={mockMeetings.length}
          emailsCount={15}
          upcomingMeeting={mockMeetings[0]}
          criticalTasks={2}
        />

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Tasks & Meetings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Meetings */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Meetings
                  <Badge variant="secondary" className="ml-auto">
                    {mockMeetings.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockMeetings.map((meeting) => (
                  <div key={meeting.id} className="space-y-2">
                    <MeetingCountdown
                      meeting={meeting}
                      onJoin={() => window.open(meeting.meetingLink, "_blank")}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleViewIntelligence(meeting)}
                    >
                      <Target className="h-4 w-4" />
                      View Client Intelligence
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Prioritized Tasks */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Prioritized Tasks
                  <Badge variant="destructive" className="ml-auto">
                    2 Critical
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTasks.map((task, idx) => (
                  <TaskCard key={idx} task={task} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Quick Actions & Insights */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  Check Recent Emails
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  View Full Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Sales Brief
                </Button>
              </CardContent>
            </Card>

            {/* Today's Insights */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="text-base">Today's Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="font-medium mb-1">📊 Meeting Trend</p>
                  <p className="text-muted-foreground text-xs">
                    30% more meetings than usual today
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="font-medium mb-1">⚡ High Priority</p>
                  <p className="text-muted-foreground text-xs">
                    2 urgent responses needed before EOD
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="font-medium mb-1">✅ On Track</p>
                  <p className="text-muted-foreground text-xs">
                    You're ahead of schedule for the week
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Slide-out Panels */}
      <ClientIntelligencePanel
        open={showIntelligence}
        onOpenChange={setShowIntelligence}
        intelligence={mockIntelligence}
      />

      <SettingsPanel open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
};

export default IntelligentDashboard;
