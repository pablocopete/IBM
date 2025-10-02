import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Database, Mail, Download } from "lucide-react";

const Privacy = () => {
  const lastUpdated = "January 2, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            </div>
            <CardDescription>
              Last updated: {lastUpdated}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Our Commitment to Your Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our Sales Intelligence application.
            </p>
            <p className="text-muted-foreground">
              This policy complies with GDPR (General Data Protection Regulation), CCPA (California Consumer Privacy Act), 
              and CAN-SPAM Act requirements.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Email address and name (when you create an account)</li>
                <li>Profile information you provide</li>
                <li>Communication preferences</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Calendar and Email Data</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Calendar events and meeting details (with your explicit consent via OAuth)</li>
                <li>Email content for intelligence gathering (read-only access)</li>
                <li>Attendee information from your meetings</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Usage Information</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Log data and analytics</li>
                <li>Device information and IP address</li>
                <li>How you interact with our services</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide and maintain our services</li>
              <li>To generate AI-powered insights and recommendations</li>
              <li>To improve and personalize your experience</li>
              <li>To communicate with you about service updates</li>
              <li>To ensure security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>AES-256 encryption at rest</li>
              <li>TLS 1.3 encryption in transit</li>
              <li>OAuth 2.0 for secure API access</li>
              <li>Regular security audits and monitoring</li>
              <li>Row-level security policies on all database tables</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights (GDPR/CCPA) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Under GDPR and CCPA, you have the following rights:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">Right to Access</h3>
                <p className="text-sm text-muted-foreground">
                  You can request a copy of all personal data we hold about you.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Right to Rectification</h3>
                <p className="text-sm text-muted-foreground">
                  You can correct any inaccurate or incomplete personal data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Right to Erasure</h3>
                <p className="text-sm text-muted-foreground">
                  You can request deletion of your personal data at any time.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Right to Data Portability</h3>
                <p className="text-sm text-muted-foreground">
                  You can export your data in a machine-readable format.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Right to Withdraw Consent</h3>
                <p className="text-sm text-muted-foreground">
                  You can revoke API permissions and consent at any time.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              To exercise these rights, visit your Privacy Settings or contact us at privacy@example.com
            </p>
          </CardContent>
        </Card>

        {/* Email Communications (CAN-SPAM) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Communications (CAN-SPAM Compliance)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We comply with the CAN-SPAM Act for all email communications:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>We never send unsolicited commercial emails</li>
              <li>All emails include a clear unsubscribe link</li>
              <li>We honor opt-out requests within 10 business days</li>
              <li>Our physical business address is included in emails</li>
              <li>We don't use deceptive subject lines or headers</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              You can manage your email preferences in Settings.
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We retain your personal data only for as long as necessary to provide our services 
              and comply with legal obligations. You can request deletion at any time through 
              your Privacy Settings.
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
              If you have questions about this Privacy Policy or want to exercise your rights, contact us:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: privacy@example.com</li>
              <li>Data Protection Officer: dpo@example.com</li>
              <li>Address: [Your Company Address]</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
