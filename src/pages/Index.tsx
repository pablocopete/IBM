import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Shield, Zap, Target, ArrowRight } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary rounded-full">
                <Brain className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Sales Intelligence Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered insights for sales professionals. Connect your calendar and email to get automated research, prioritized tasks, and intelligent recommendations.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg border bg-card">
              <Target className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Prioritization</h3>
              <p className="text-sm text-muted-foreground">
                AI analyzes your calendar and emails to prioritize what matters most
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <Brain className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Company Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Automated research on companies and contacts before every meeting
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground">
                Bank-level encryption, GDPR compliant, and SOC 2 certified
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="pt-8 border-t mt-16">
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/privacy')} className="hover:text-foreground">
                Privacy Policy
              </button>
              <button onClick={() => navigate('/terms')} className="hover:text-foreground">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
