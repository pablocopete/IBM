import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Calendar, Mail, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: () => void;
}

export const ConsentDialog = ({ open, onOpenChange, onConsent }: ConsentDialogProps) => {
  const [consents, setConsents] = useState({
    calendarAccess: false,
    emailAccess: false,
    dataProcessing: false,
    termsAccepted: false,
  });
  const { toast } = useToast();

  const allConsented = Object.values(consents).every(Boolean);

  const handleSubmit = async () => {
    if (!allConsented) {
      toast({
        title: "Consent Required",
        description: "Please accept all required consents to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Record consents
      const consentRecords = [
        { user_id: user.id, consent_type: "calendar_access", consent_given: true },
        { user_id: user.id, consent_type: "email_access", consent_given: true },
        { user_id: user.id, consent_type: "data_processing", consent_given: true },
        { user_id: user.id, consent_type: "terms_of_service", consent_given: true },
      ];

      const { error } = await supabase
        .from("user_consents")
        .insert(consentRecords);

      if (error) throw error;

      toast({
        title: "Consent Recorded",
        description: "Your preferences have been saved.",
      });

      onConsent();
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording consent:", error);
      toast({
        title: "Error",
        description: "Failed to record your consent. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Your Privacy & Consent
          </DialogTitle>
          <DialogDescription>
            We need your explicit consent to access your data and provide our services.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6">
            {/* Calendar Access */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="calendar"
                checked={consents.calendarAccess}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, calendarAccess: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="calendar" className="flex items-center gap-2 font-semibold cursor-pointer">
                  <Calendar className="h-4 w-4 text-primary" />
                  Calendar Access
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I consent to providing read-only access to my Google Calendar for meeting 
                  intelligence and scheduling features. This access uses OAuth 2.0 and can be 
                  revoked at any time.
                </p>
              </div>
            </div>

            {/* Email Access */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="email"
                checked={consents.emailAccess}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, emailAccess: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="email" className="flex items-center gap-2 font-semibold cursor-pointer">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Email Access
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I consent to providing read-only access to my Gmail for email intelligence 
                  and task prioritization. No emails will be sent on my behalf without explicit permission.
                </p>
              </div>
            </div>

            {/* Data Processing */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="processing"
                checked={consents.dataProcessing}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, dataProcessing: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="processing" className="flex items-center gap-2 font-semibold cursor-pointer">
                  <Database className="h-4 w-4 text-purple-500" />
                  Data Processing & AI Analysis
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I consent to processing my calendar and email data using AI to generate 
                  insights, recommendations, and intelligence. My data will be encrypted and 
                  handled according to the Privacy Policy.
                </p>
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={consents.termsAccepted}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, termsAccepted: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="terms" className="font-semibold cursor-pointer">
                  Terms of Service & Privacy Policy
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I have read and agree to the{" "}
                  <a href="/terms" target="_blank" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  . I understand my rights under GDPR and CCPA, including the right to access, 
                  export, and delete my data at any time.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Your Rights</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ You can withdraw consent at any time in Settings</li>
                <li>✓ You can export all your data</li>
                <li>✓ You can request deletion of your data</li>
                <li>✓ We will never sell your personal data</li>
                <li>✓ Your data is encrypted and secure</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!allConsented}>
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
