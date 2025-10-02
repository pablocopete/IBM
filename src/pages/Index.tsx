import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Lock, Activity, Globe, Eye, FileCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-20">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl shadow-xl">
              <Shield className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Intelligent Orchestrator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered agent that analyzes calendar, emails, and prioritizes tasks with sales intelligence
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 h-12">
                Get Started
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 h-12">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card p-6 rounded-xl border-2 shadow-lg hover:shadow-xl transition-shadow">
            <Lock className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">OAuth 2.0 Security</h3>
            <p className="text-muted-foreground">
              Secure token storage with 256-bit encryption at rest and TLS 1.3 in transit
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border-2 shadow-lg hover:shadow-xl transition-shadow">
            <Activity className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Rate Limiting</h3>
            <p className="text-muted-foreground">
              Intelligent rate limiting at 100 requests per user per hour with monitoring
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border-2 shadow-lg hover:shadow-xl transition-shadow">
            <Eye className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Audit Trail</h3>
            <p className="text-muted-foreground">
              Complete logging of all data access attempts for security compliance
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border-2 shadow-lg hover:shadow-xl transition-shadow">
            <Globe className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">CORS Protection</h3>
            <p className="text-muted-foreground">
              Restricted API access with Content Security Policy headers enabled
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border-2 shadow-lg hover:shadow-xl transition-shadow">
            <Shield className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Session Security</h3>
            <p className="text-muted-foreground">
              30-minute timeout with automatic logout for enhanced protection
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border-2 shadow-lg hover:shadow-xl transition-shadow">
            <FileCheck className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Input Validation</h3>
            <p className="text-muted-foreground">
              Comprehensive validation and sanitization on all user inputs
            </p>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-card border-2 rounded-xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Technical Specifications</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-primary">Authentication</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• OAuth 2.0 Protocol</li>
                  <li>• Google Calendar API</li>
                  <li>• Gmail API Integration</li>
                  <li>• Token Auto-Refresh</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">Security</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• AES-256 Encryption</li>
                  <li>• TLS 1.3 Transport</li>
                  <li>• CSP Headers</li>
                  <li>• HTTPS Only</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">Monitoring</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Real-time Rate Limiting</li>
                  <li>• Session Tracking</li>
                  <li>• Access Audit Logs</li>
                  <li>• Security Alerts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">Compliance</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Input Validation (Zod)</li>
                  <li>• CORS Restrictions</li>
                  <li>• Environment Variables</li>
                  <li>• No Hardcoded Secrets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Notice */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-warning/10 border-2 border-warning/20 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This is the frontend interface. Enable Lovable Cloud to activate backend security features including OAuth token storage, rate limiting, audit logging, and encrypted session management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
