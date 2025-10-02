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

export const SalesIntelligenceEngine = ({ 
  calendarEvents, 
  attendeeIntelligence,
  companyResearch 
}: SalesIntelligenceEngineProps) => {
  const [intelligence, setIntelligence] = useState<SalesIntelligence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateIntelligence = async () => {
    setIsLoading(true);
    try {
      console.log('Generating sales intelligence...');

      // Match meetings with attendees and company research
      const intelligencePromises = calendarEvents.map(async (meeting) => {
        if (!meeting.attendees || meeting.attendees.length === 0) return null;

        // For each external attendee in the meeting
        const attendeePromises = meeting.attendees.map(async (meetingAttendee: any) => {
          const attendeeInfo = attendeeIntelligence.find(
            (a: any) => a.email === meetingAttendee.email
          );

          if (!attendeeInfo || !attendeeInfo.companyName) return null;

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sales-intelligence`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                meeting: {
                  startTime: meeting.startTime,
                  duration: meeting.duration,
                  title: meeting.title
                },
                attendee: attendeeInfo,
                companyResearch: companyResearch || {
                  companyName: attendeeInfo.companyName,
                  profile: { industry: attendeeInfo.companyIndustry }
                }
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate intelligence');
          }

          return await response.json();
        });

        return Promise.all(attendeePromises);
      });

      const results = await Promise.all(intelligencePromises);
      const flatResults = results.flat().filter(Boolean) as SalesIntelligence[];

      setIntelligence(flatResults);
      
      toast({
        title: "Sales Intelligence Generated",
        description: `Created ${flatResults.length} intelligence briefs`,
      });
    } catch (error) {
      console.error('Error generating sales intelligence:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate intelligence",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
