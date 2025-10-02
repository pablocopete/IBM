import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Clock, User, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const EmailList = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [hasConnection, setHasConnection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkEmailConnection();
    fetchEmails();
  }, []);

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

  const connectGmail = () => {
    toast({
      title: "Gmail Connection",
      description: "Please connect your Gmail account in Settings to view your emails.",
    });
  };

  if (!hasConnection) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Connect Your Email</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Gmail account to view and analyze your emails
              </p>
              <Button onClick={connectGmail}>
                Connect Gmail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Your Emails
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {emails.length} emails loaded
          </p>
        </div>
        <Button
          onClick={syncGmail}
          disabled={syncing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Gmail'}
        </Button>
      </div>

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
