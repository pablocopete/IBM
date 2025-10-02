import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Target, DollarSign, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Building2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SalesIntelligence {
  meeting: {
    startTime: string;
    duration: string;
  };
  attendee: {
    name: string;
    title?: string;
    email: string;
  };
  company: string;
  companySnapshot: {
    industry: string;
    size: string;
    stage: "Startup" | "Growth" | "Enterprise" | "Mature";
    recentNews?: string;
  };
  financialHealth: {
    status: "Healthy" | "Growing" | "Stable" | "Concerning";
    latestFunding?: string;
    revenue?: string;
    indicators?: string;
  };
  recommendedApproach: {
    keyPainPoints: string[];
    whatToPitch: string[];
    valueProposition: string;
    budgetExpectation?: string;
    decisionMakerInfluence?: "High" | "Medium" | "Low";
  };
  talkingPoints: string[];
  generatedAt?: string;
  error?: string;
}

interface SalesIntelligenceEngineProps {
  calendarEvents: any[];
  attendeeIntelligence: any[];
  companyResearch: any;
}

// Mock sales intelligence data
const mockIntelligence: SalesIntelligence[] = [
  {
    meeting: {
      startTime: "2025-10-02T09:00:00Z",
      duration: "60 minutes"
    },
    attendee: {
      name: "John Smith",
      title: "VP of Sales",
      email: "john.smith@techcorp.com"
    },
    company: "Tech Corp",
    companySnapshot: {
      industry: "Enterprise Software & SaaS",
      size: "500-1000 employees",
      stage: "Growth",
      recentNews: "Secured $50M Series C funding, launched AI-powered analytics platform, expanding to APAC markets"
    },
    financialHealth: {
      status: "Growing",
      latestFunding: "$85M total raised (Series C: $50M led by Sequoia Capital)",
      revenue: "$25M ARR (estimated)",
      indicators: "35% YoY growth, recently hired 50+ employees, expanding into 3 new countries"
    },
    recommendedApproach: {
      keyPainPoints: [
        "Scaling sales operations across multiple regions simultaneously",
        "Need for unified sales intelligence platform to manage distributed teams",
        "Manual data entry and reporting reducing team productivity by 40%",
        "Difficulty tracking multi-touch attribution across global markets"
      ],
      whatToPitch: [
        "Multi-region sales automation with localized workflows",
        "AI-powered lead scoring and territory optimization",
        "Seamless CRM integration with real-time sync",
        "Automated reporting and analytics dashboards",
        "Mobile-first design for field sales teams"
      ],
      valueProposition: "Help Tech Corp scale sales operations 3x faster while reducing manual administrative work by 60%, enabling their team to focus on high-value selling activities during their rapid international expansion.",
      budgetExpectation: "$150K-$250K annually",
      decisionMakerInfluence: "High"
    },
    talkingPoints: [
      "Reference their recent APAC expansion - share how we helped SimilarTech scale to 5 countries in 6 months",
      "Discuss their AI analytics launch - position our AI lead scoring as complementary to their product strategy",
      "Emphasize proven ROI: customers see 40% increase in sales productivity within first 90 days",
      "Ask about their current tech stack (likely Salesforce) and highlight our seamless integration",
      "VP of Sales has budget authority - focus on strategic value and competitive advantage",
      "Mention our enterprise security certifications (SOC 2, GDPR) given their growth stage"
    ],
    generatedAt: new Date().toISOString()
  },
  {
    meeting: {
      startTime: "2025-10-02T11:30:00Z",
      duration: "30 minutes"
    },
    attendee: {
      name: "Emily Davis",
      title: "Director of IT",
      email: "e.davis@acmeindustries.com"
    },
    company: "Acme Industries",
    companySnapshot: {
      industry: "Manufacturing & Industrial Equipment",
      size: "200-500 employees",
      stage: "Mature",
      recentNews: "Opened new $20M manufacturing facility in Texas, investing in digital transformation, secured major automotive partnerships"
    },
    financialHealth: {
      status: "Stable",
      latestFunding: "Bootstrapped / Profitable (Est. $50M+ revenue)",
      revenue: "$50M+ annually (estimated)",
      indicators: "Consistent 8-12% growth over 10+ years, investing $5M in new facilities, 95%+ customer retention rate"
    },
    recommendedApproach: {
      keyPainPoints: [
        "Legacy systems (likely AS/400 or old ERP) limiting digital transformation initiatives",
        "Sales team using outdated tools (Excel, paper orders) causing order errors",
        "Difficult to track customer engagement across field sales touchpoints",
        "IT concerns about system integration and change management",
        "Need for mobile solutions for field sales representatives"
      ],
      whatToPitch: [
        "Easy integration with existing ERP systems (SAP, Oracle, legacy systems)",
        "Phased implementation approach to minimize disruption",
        "Mobile-first design optimized for field sales teams",
        "Real-time order tracking and inventory visibility",
        "Dedicated implementation support and training",
        "On-premise or hybrid deployment options for security requirements"
      ],
      valueProposition: "Modernize Acme's sales operations without disrupting existing workflows, reducing order errors by 80% and improving field sales efficiency by 50% through mobile-first tools that integrate seamlessly with their legacy systems.",
      budgetExpectation: "$50K-$100K annually",
      decisionMakerInfluence: "Medium"
    },
    talkingPoints: [
      "Highlight manufacturing industry expertise - share case study from GlobalManuf (similar profile)",
      "Emphasize security, reliability, and proven track record with conservative IT organizations",
      "Discuss phased implementation approach - pilot with 10-20 users, then scale",
      "Focus on ROI metrics that resonate with CFOs: reduced errors, faster order processing, lower costs",
      "IT Director influences decision but CFO likely needs to approve - prepare financial justification",
      "Ask about their ERP system and current pain points with sales-to-order process",
      "Mention our 99.9% uptime SLA and dedicated customer success manager"
    ],
    generatedAt: new Date().toISOString()
  }
];

export const SalesIntelligenceEngine = ({ 
  calendarEvents, 
  attendeeIntelligence,
  companyResearch 
}: SalesIntelligenceEngineProps) => {
  const [intelligence, setIntelligence] = useState<SalesIntelligence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [partialFailure, setPartialFailure] = useState(false);
  const { toast } = useToast();

  const generateIntelligence = async () => {
    setIsLoading(true);
    setPartialFailure(false);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Use mock data
    setIntelligence(mockIntelligence);
    
    toast({
      title: "Sales Intelligence Generated",
      description: `Created ${mockIntelligence.length} comprehensive sales briefs with mock data`,
    });

    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Healthy: "text-green-600 dark:text-green-400",
      Growing: "text-blue-600 dark:text-blue-400",
      Stable: "text-yellow-600 dark:text-yellow-400",
      Concerning: "text-red-600 dark:text-red-400",
    };
    return colors[status] || "text-gray-600";
  };

  const getInfluenceBadge = (influence?: string) => {
    const variants: Record<string, any> = {
      High: "default",
      Medium: "secondary",
      Low: "outline",
    };
    return influence ? (
      <Badge variant={variants[influence]}>{influence} Influence</Badge>
    ) : null;
  };

  return (
    <div className="space-y-6">
      {partialFailure && intelligence.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <p className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span>Some intelligence data is incomplete. Showing available information.</span>
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sales Intelligence Engine
          </CardTitle>
          <CardDescription>
            AI-powered "What to Sell" recommendations based on comprehensive client analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateIntelligence} 
            disabled={isLoading || attendeeIntelligence.length === 0} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Intelligence...
              </>
            ) : (
              "Generate Sales Intelligence"
            )}
          </Button>
          {attendeeIntelligence.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please analyze meeting attendees first
            </p>
          )}
        </CardContent>
      </Card>

      {intelligence.length > 0 && (
        <div className="space-y-6">
          {intelligence.map((brief, idx) => (
            <Card key={idx} className="overflow-hidden border-2">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">🎯 CLIENT INTELLIGENCE BRIEF</CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {format(new Date(brief.meeting.startTime), "PPp")} - {brief.meeting.duration}
                        </div>
                      </CardDescription>
                    </div>
                    {brief.generatedAt && (
                      <Badge variant="outline">
                        {format(new Date(brief.generatedAt), "MMM dd, yyyy")}
                      </Badge>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{brief.company}</p>
                      <p className="text-sm text-muted-foreground">
                        Meeting with {brief.attendee.name}
                        {brief.attendee.title && `, ${brief.attendee.title}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Company Snapshot */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    📊 COMPANY SNAPSHOT
                  </h3>
                  <div className="grid gap-2 pl-7">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-[100px]">Industry:</span>
                      <span className="font-medium">{brief.companySnapshot.industry}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-[100px]">Size:</span>
                      <span className="font-medium">{brief.companySnapshot.size}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-[100px]">Stage:</span>
                      <Badge>{brief.companySnapshot.stage}</Badge>
                    </div>
                    {brief.companySnapshot.recentNews && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-[100px]">Recent News:</span>
                        <span className="text-sm">{brief.companySnapshot.recentNews}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Financial Health */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    💰 FINANCIAL HEALTH
                  </h3>
                  <div className="grid gap-2 pl-7">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-[120px]">Status:</span>
                      <span className={`font-semibold ${getStatusColor(brief.financialHealth.status)}`}>
                        {brief.financialHealth.status}
                      </span>
                    </div>
                    {brief.financialHealth.latestFunding && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-[120px]">Latest Funding:</span>
                        <span className="font-medium">{brief.financialHealth.latestFunding}</span>
                      </div>
                    )}
                    {brief.financialHealth.revenue && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-[120px]">Revenue:</span>
                        <span className="font-medium">{brief.financialHealth.revenue}</span>
                      </div>
                    )}
                    {brief.financialHealth.indicators && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-[120px]">Indicators:</span>
                        <span className="text-sm">{brief.financialHealth.indicators}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Recommended Approach */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    🎯 RECOMMENDED APPROACH
                  </h3>
                  <div className="space-y-4 pl-7">
                    {/* Key Pain Points */}
                    <div>
                      <h4 className="font-semibold mb-2 text-destructive">Key Pain Points:</h4>
                      <ul className="space-y-1">
                        {brief.recommendedApproach.keyPainPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* What to Pitch */}
                    <div>
                      <h4 className="font-semibold mb-2 text-primary">What to Pitch:</h4>
                      <ul className="space-y-1">
                        {brief.recommendedApproach.whatToPitch.map((pitch, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{pitch}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Value Proposition */}
                    <div>
                      <h4 className="font-semibold mb-2">Value Proposition:</h4>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {brief.recommendedApproach.valueProposition}
                      </p>
                    </div>

                    {/* Budget & Influence */}
                    <div className="flex gap-4 flex-wrap">
                      {brief.recommendedApproach.budgetExpectation && (
                        <div>
                          <span className="text-muted-foreground text-sm">Budget Expectation: </span>
                          <Badge variant="outline">{brief.recommendedApproach.budgetExpectation}</Badge>
                        </div>
                      )}
                      {brief.recommendedApproach.decisionMakerInfluence && (
                        <div>
                          <span className="text-muted-foreground text-sm">Decision Maker: </span>
                          {getInfluenceBadge(brief.recommendedApproach.decisionMakerInfluence)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Talking Points */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    💡 TALKING POINTS
                  </h3>
                  <ul className="space-y-2 pl-7">
                    {brief.talkingPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
