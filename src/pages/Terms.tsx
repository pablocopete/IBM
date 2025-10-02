import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, AlertCircle } from "lucide-react";

const Terms = () => {
  const lastUpdated = "January 2, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
            </div>
            <CardDescription>
              Last updated: {lastUpdated}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Agreement */}
        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing or using our Sales Intelligence application, you agree to be bound by these 
              Terms of Service. If you disagree with any part of these terms, you may not access the service.
            </p>
          </CardContent>
        </Card>

        {/* Use of Service */}
        <Card>
          <CardHeader>
            <CardTitle>Use of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Permitted Use</h3>
              <p className="text-muted-foreground mb-2">You may use our service to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Manage your calendar and email data</li>
                <li>Generate AI-powered sales intelligence</li>
                <li>Organize and prioritize your tasks</li>
                <li>Access meeting insights and recommendations</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Prohibited Activities
              </h3>
              <p className="text-muted-foreground mb-2">You must not:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Share your account credentials with others</li>
                <li>Reverse engineer or decompile our software</li>
                <li>Use automated systems to scrape or data mine</li>
                <li>Upload malware or malicious code</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* API and Integration */}
        <Card>
          <CardHeader>
            <CardTitle>API Access and Third-Party Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our service integrates with third-party APIs including Google Calendar and Gmail.
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>You grant us permission to access your data through OAuth 2.0</li>
              <li>We use read-only access to your emails and calendar</li>
              <li>You can revoke API permissions at any time in Settings</li>
              <li>We comply with third-party API terms and rate limits</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data and Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data and Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your use of our service is also governed by our Privacy Policy. We implement 
              appropriate security measures to protect your data and comply with GDPR, CCPA, 
              and other applicable privacy regulations.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The service and its original content, features, and functionality are owned by us 
              and are protected by international copyright, trademark, patent, trade secret, and 
              other intellectual property laws.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              To the maximum extent permitted by law, we shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your use or inability to use the service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any bugs, viruses, or the like transmitted through the service</li>
              <li>Any errors or omissions in any content</li>
            </ul>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Service Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. 
              We may modify, suspend, or discontinue the service at any time without notice. 
              We are not liable for any modification, suspension, or discontinuance of the service.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason, including if you breach these Terms. You may also delete your account 
              at any time through Settings.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify you of any 
              changes by posting the new Terms of Service on this page and updating the "Last updated" 
              date. Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
              without regard to its conflict of law provisions.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms, contact us:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: legal@example.com</li>
              <li>Address: [Your Company Address]</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
