import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Mail,
  Bell,
  RefreshCw,
  Shield,
  Zap,
  Download,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsPanel = ({ open, onOpenChange }: SettingsPanelProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDataExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-data-export');
      
      if (error) throw error;

      // Download the data as JSON
      const dataStr = JSON.stringify(data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataDeletion = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('request-data-deletion');
      
      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Settings & Preferences</SheetTitle>
          <SheetDescription>
            Manage your integrations and notification preferences
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Integrations */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Integrations</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Google Calendar</p>
                      <p className="text-xs text-muted-foreground">Sync your meetings</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Gmail</p>
                      <p className="text-xs text-muted-foreground">Read your emails</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
                <Separator />
                <Button variant="outline" className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reconnect Services
                </Button>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="meeting-reminders" className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Meeting Reminders</span>
                    <span className="text-xs text-muted-foreground">
                      Get notified 15 minutes before meetings
                    </span>
                  </Label>
                  <Switch id="meeting-reminders" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="urgent-emails" className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Urgent Emails</span>
                    <span className="text-xs text-muted-foreground">
                      Alert for high-priority emails
                    </span>
                  </Label>
                  <Switch id="urgent-emails" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-summary" className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Daily Summary</span>
                    <span className="text-xs text-muted-foreground">
                      Morning overview email
                    </span>
                  </Label>
                  <Switch id="daily-summary" />
                </div>
              </div>
            </div>

            <Separator />

            {/* AI Features */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-research" className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Auto Research</span>
                    <span className="text-xs text-muted-foreground">
                      Automatically research meeting attendees
                    </span>
                  </Label>
                  <Switch id="auto-research" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-priority" className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Task Prioritization</span>
                    <span className="text-xs text-muted-foreground">
                      AI-powered task ranking
                    </span>
                  </Label>
                  <Switch id="task-priority" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="sales-intel" className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Sales Intelligence</span>
                    <span className="text-xs text-muted-foreground">
                      Generate meeting briefs
                    </span>
                  </Label>
                  <Switch id="sales-intel" defaultChecked />
                </div>
              </div>
            </div>

            <Separator />

            {/* Privacy & Data Rights (GDPR/CCPA) */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy & Data Rights
              </h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => window.open('/privacy', '_blank')}
                >
                  <Eye className="h-4 w-4" />
                  Privacy Policy
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => window.open('/terms', '_blank')}
                >
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={handleDataExport}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export My Data (GDPR)"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete My Account
                </Button>
              </div>
            </div>

            <Separator />

            {/* Security */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security & Permissions
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  View Consent History
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive">
                  Revoke All API Permissions
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action cannot be undone. This will permanently delete your account and 
                remove all your data from our servers.
              </p>
              <p className="font-semibold">This includes:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>All calendar and email intelligence data</li>
                <li>Task prioritization history</li>
                <li>Meeting insights and research</li>
                <li>API integrations and permissions</li>
                <li>All consent records and preferences</li>
              </ul>
              <p className="text-sm mt-4">
                Consider exporting your data before deletion if you want to keep a copy.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDataDeletion}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
};
