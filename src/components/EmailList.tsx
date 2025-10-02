import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Clock, User, RefreshCw, AlertCircle } from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock emails for demo
const mockEmails = [
  {
    id: "demo-1",
    sender_name: "Sarah Johnson",
    sender_email: "sarah.j@techcorp.com",
    subject: "Q4 Strategy Review - Preparation Materials",
    body_snippet: "Hi there, I wanted to share the preparation materials for our upcoming Q4 strategy review meeting. Please review the attached documents before our call...",
    received_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    priority: "high",
    labels: ["important", "work"],
  },
  {
    id: "demo-2",
    sender_name: "Mike Chen",
    sender_email: "mike.chen@acmecorp.com",
    subject: "Follow-up: Product Demo Feedback",
    body_snippet: "Thanks for the excellent product demo yesterday! Our team was really impressed with the analytics features. I'd like to schedule a follow-up call to discuss...",
    received_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    priority: "normal",
    labels: ["client", "demo"],
  },
  {
    id: "demo-3",
    sender_name: "LinkedIn Notifications",
    sender_email: "notifications@linkedin.com",
    subject: "You have 3 new connection requests",
    body_snippet: "John Smith, Emily Davis, and Robert Lee want to connect with you on LinkedIn. See who's trying to reach you and grow your professional network...",
    received_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_read: true,
    priority: "normal",
    labels: ["social"],
  },
];

const EmailList = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [hasConnection, setHasConnection] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchEmails();
  }, []);

  const checkAuthAndFetchEmails = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);

    if (session) {
      await checkEmailConnection();
      await fetchEmails();
    } else {
      setEmails(mockEmails);
      setLoading(false);
    }
  };

  const checkEmailConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('email_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setHasConnection(!!data && !error);
    } catch (error) {
      console.error('Error checking email connection:', error);
    }
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_emails')
        .select('*')
        .eq('user_id', user.id)
        .order('received_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncGmail = async () => {
    try {
      setSyncing(true);
      const { data, error } = await supabase.functions.invoke('sync-gmail');
      
      if (error) throw error;

      toast({
        title: "Emails synced",
        description: `Successfully synced ${data.count} emails`,
      });

      await fetchEmails();
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectGmail = () => {
    toast({
      title: "Gmail Connection",
      description: "Please connect your Gmail account in Settings to view your emails.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Recent Emails
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAuthenticated ? "Your latest emails from Gmail" : "Demo emails • Sign in to connect Gmail"}
          </p>
        </div>
        {isAuthenticated ? (
          hasConnection && (
            <Button
              onClick={syncGmail}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Gmail'}
            </Button>
          )
        ) : (
          <Badge variant="outline" className="h-8">
            <AlertCircle className="w-3 h-3 mr-1" />
            Demo Mode
          </Badge>
        )}
      </div>

      {isAuthenticated && !hasConnection && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              Gmail Not Connected
            </CardTitle>
            <CardDescription>
              Connect your Gmail account to see your emails here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleConnectGmail}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Connect Gmail
            </Button>
          </CardContent>
        </Card>
      )}

      {!isAuthenticated && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Demo Mode
            </CardTitle>
            <CardDescription>
              Sign in to connect your Gmail account and see your real emails.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Loading emails...
          </CardContent>
        </Card>
      ) : emails.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No emails found. Click "Sync Gmail" to fetch your emails.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {emails.map((email) => (
            <Card key={email.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{email.subject || '(No Subject)'}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {email.sender_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(parseISO(email.received_at), "MMM d, h:mm a")}
                      </span>
                    </CardDescription>
                  </div>
                  {!email.is_read && (
                    <Badge variant="default">New</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{email.body_snippet}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">From</p>
                  <div className="text-sm">
                    <span>{email.sender_email}</span>
                  </div>
                </div>

                {email.labels && email.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {email.labels.slice(0, 5).map((label: string, idx: number) => (
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
      )}
    </div>
  );
};

export default EmailList;
