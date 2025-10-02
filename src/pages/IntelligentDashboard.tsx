import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Settings,
  LogOut,
  Calendar,
  Mail,
  Target,
  Sparkles,
  Brain,
  Building2,
  Users,
} from "lucide-react";
// Component imports
import { DailySummary } from "@/components/DailySummary";
import CalendarEvents from "@/components/CalendarEvents";
import EmailList from "@/components/EmailList";
import { PrioritizedAgenda } from "@/components/PrioritizedAgenda";
import { CompanyResearch } from "@/components/CompanyResearch";
import { AttendeeIntelligence } from "@/components/AttendeeIntelligence";
import { SalesIntelligenceEngine } from "@/components/SalesIntelligenceEngine";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ConsentDialog } from "@/components/ConsentDialog";

// Supabase & utilities
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEMO_MODE = true;

const IntelligentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Data state
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [emails, setEmails] = useState([]);
  const [attendeeIntelligence, setAttendeeIntelligence] = useState<any[]>([]);
  const [companyResearch, setCompanyResearch] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (DEMO_MODE) {
        setUserEmail("demo@lovable.app");
        setShowConsent(false);
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUserEmail(session.user.email || "");
      
      // Check if user has given consent
      const { data: consents } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('consent_type', 'data_collection')
        .eq('consent_given', true)
        .is('revoked_at', null);

      if (!consents || consents.length === 0) {
        setShowConsent(true);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast({
      title: "Refreshing",
      description: "Updating all data sources...",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <ConsentDialog 
        open={DEMO_MODE ? false : showConsent} 
        onOpenChange={setShowConsent}
        onConsent={() => {
          setShowConsent(false);
          toast({
            title: "Consent Saved",
            description: "Your preferences have been recorded",
          });
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <Brain className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  Sales Intelligence Hub
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {userEmail} • AI-powered command center
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Daily Summary */}
          <DailySummary 
            meetingsCount={calendarEvents.length}
            emailsCount={emails.length}
            criticalTasks={0}
          />

          {/* Main Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <Target className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="intelligence">
                <Sparkles className="h-4 w-4 mr-2" />
                Sales Intelligence
              </TabsTrigger>
              <TabsTrigger value="research">
                <Brain className="h-4 w-4 mr-2" />
                Research
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Quick Stats Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Today's Meetings
                      </span>
                      <Badge variant="secondary">{calendarEvents.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold mb-1">{calendarEvents.length}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Scheduled events for today
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const tabs = document.querySelector('[role="tablist"]');
                        const intelligenceTab = tabs?.querySelector('[value="intelligence"]') as HTMLElement;
                        intelligenceTab?.click();
                      }}
                    >
                      View Calendar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-500" />
                        Recent Emails
                      </span>
                      <Badge variant="secondary">{emails.length || 5}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold mb-1">{emails.length || 5}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Unread messages (last 24h)
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const tabs = document.querySelector('[role="tablist"]');
                        const intelligenceTab = tabs?.querySelector('[value="intelligence"]') as HTMLElement;
                        intelligenceTab?.click();
                      }}
                    >
                      View Emails
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        AI Insights
                      </span>
                      <Badge variant="secondary">Ready</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold mb-1">2</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Sales intelligence briefs available
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const tabs = document.querySelector('[role="tablist"]');
                        const intelligenceTab = tabs?.querySelector('[value="intelligence"]') as HTMLElement;
                        intelligenceTab?.click();
                      }}
                    >
                      Generate Intelligence
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto py-3"
                      onClick={() => {
                        const tabs = document.querySelector('[role="tablist"]');
                        const intelligenceTab = tabs?.querySelector('[value="intelligence"]') as HTMLElement;
                        intelligenceTab?.click();
                      }}
                    >
                      <div className="text-left">
                        <div className="font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Generate Sales Intelligence
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          AI-powered insights for your meetings
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto py-3"
                      onClick={() => {
                        const tabs = document.querySelector('[role="tablist"]');
                        const researchTab = tabs?.querySelector('[value="research"]') as HTMLElement;
                        researchTab?.click();
                      }}
                    >
                      <div className="text-left">
                        <div className="font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Research Attendees
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Deep dive into meeting participants
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales Intelligence Tab */}
            <TabsContent value="intelligence" className="space-y-4">
              {/* Calendar and Emails in Intelligence Tab */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Calendar Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CalendarEvents />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Recent Emails
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmailList />
                  </CardContent>
                </Card>
              </div>

              <SalesIntelligenceEngine
                calendarEvents={calendarEvents}
                attendeeIntelligence={attendeeIntelligence}
                companyResearch={companyResearch}
              />
            </TabsContent>

            {/* Research Tab */}
            <TabsContent value="research" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Attendee Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AttendeeIntelligence calendarEvents={calendarEvents} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Research
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Company research is automatically generated in the Sales Intelligence tab when analyzing meetings with company representatives.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const tabs = document.querySelector('[role="tablist"]');
                      const intelligenceTab = tabs?.querySelector('[value="intelligence"]') as HTMLElement;
                      intelligenceTab?.click();
                    }}
                  >
                    Go to Sales Intelligence
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Settings Panel */}
        <SettingsPanel open={showSettings} onOpenChange={setShowSettings} />
      </div>
    </>
  );
};

export default IntelligentDashboard;
