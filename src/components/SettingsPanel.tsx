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
  Calendar,
  Mail,
  Bell,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsPanel = ({ open, onOpenChange }: SettingsPanelProps) => {
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

            {/* Security */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Manage Data Access
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive">
                  Revoke All Permissions
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
