import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Building2, 
  DollarSign, 
  Newspaper, 
  AlertTriangle, 
  Target,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CompanyResearch {
  companyName: string;
  companyDomain: string;
  profile?: {
    size?: string;
    headcount?: string;
    industry?: string;
    sector?: string;
    founded?: string;
    headquarters?: string;
    products?: string[];
    businessModel?: string;
  };
  financial?: {
    revenue?: string;
    fundingRounds?: string[];
    investors?: string[];
    stockSymbol?: string;
    marketCap?: string;
    growthIndicators?: string[];
    recentAcquisitions?: string[];
    partnerships?: string[];
  };
  recentNews?: Array<{
    headline: string;
    date?: string;
    summary?: string;
    source?: string;
  }>;
  painPoints?: {
    industryChallenges?: string[];
    technologyGaps?: string[];
    scalingIssues?: string[];
    competitivePressures?: string[];
  };
  strategicInsights?: {
    keyCompetitors?: string[];
    marketPosition?: string;
    opportunities?: string[];
    risks?: string[];
  };
  confidence?: "high" | "medium" | "low";
  researchedAt?: string;
  error?: string;
}

interface CompanyResearchProps {
  companyName: string;
  companyDomain: string;
}

export const CompanyResearch = ({ companyName, companyDomain }: CompanyResearchProps) => {
  const [research, setResearch] = useState<CompanyResearch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const conductResearch = async () => {
    setIsLoading(true);
    try {
      console.log(`Researching ${companyName}...`);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-company`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyName, companyDomain }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to research company');
      }

      const data = await response.json();
      setResearch(data);
      
      toast({
        title: "Research Complete",
        description: `Comprehensive analysis of ${companyName} completed`,
      });
    } catch (error) {
      console.error('Error researching company:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to research company",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      high: { variant: "default", label: "High Confidence" },
      medium: { variant: "secondary", label: "Medium Confidence" },
      low: { variant: "outline", label: "Low Confidence" },
    };
    
    const config = confidence ? variants[confidence] : variants.low;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {companyName}
              </CardTitle>
              <CardDescription className="mt-2">
                {companyDomain}
              </CardDescription>
            </div>
            {!research && (
              <Button onClick={conductResearch} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  "Research Company"
                )}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {research && !research.error && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>Company Intelligence Report</CardTitle>
              <div className="flex items-center gap-2">
                {getConfidenceBadge(research.confidence)}
                {research.researchedAt && (
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(research.researchedAt), "MMM dd, yyyy")}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="painpoints">Pain Points</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4">
                {research.profile && (
                  <div className="grid gap-4">
                    {research.profile.industry && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">Industry</p>
                          <p className="text-sm text-muted-foreground">
                            {research.profile.industry}
                            {research.profile.sector && ` - ${research.profile.sector}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {research.profile.headcount && (
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">Company Size</p>
                          <p className="text-sm text-muted-foreground">
                            {research.profile.headcount} employees
                            {research.profile.size && ` (${research.profile.size})`}
                          </p>
                        </div>
                      </div>
                    )}

                    {research.profile.founded && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">Founded</p>
                          <p className="text-sm text-muted-foreground">{research.profile.founded}</p>
                        </div>
                      </div>
                    )}

                    {research.profile.headquarters && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">Headquarters</p>
                          <p className="text-sm text-muted-foreground">{research.profile.headquarters}</p>
                        </div>
                      </div>
                    )}

                    {research.profile.businessModel && (
                      <div>
                        <p className="font-semibold mb-1">Business Model</p>
                        <p className="text-sm text-muted-foreground">{research.profile.businessModel}</p>
                      </div>
                    )}

                    {research.profile.products && research.profile.products.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Products & Services</p>
                        <ul className="space-y-1">
                          {research.profile.products.map((product, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {product}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-4">
                {research.financial && (
                  <div className="space-y-4">
                    {research.financial.revenue && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">Revenue</p>
                          <p className="text-sm text-muted-foreground">{research.financial.revenue}</p>
                        </div>
                      </div>
                    )}

                    {research.financial.stockSymbol && (
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">Stock</p>
                          <p className="text-sm text-muted-foreground">
                            {research.financial.stockSymbol}
                            {research.financial.marketCap && ` - ${research.financial.marketCap}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {research.financial.fundingRounds && research.financial.fundingRounds.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Funding Rounds</p>
                        <ul className="space-y-1">
                          {research.financial.fundingRounds.map((round, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {round}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {research.financial.investors && research.financial.investors.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Key Investors</p>
                        <div className="flex flex-wrap gap-2">
                          {research.financial.investors.map((investor, i) => (
                            <Badge key={i} variant="secondary">{investor}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {research.financial.growthIndicators && research.financial.growthIndicators.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Growth Indicators</p>
                        <ul className="space-y-1">
                          {research.financial.growthIndicators.map((indicator, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {research.financial.partnerships && research.financial.partnerships.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Recent Partnerships</p>
                        <ul className="space-y-1">
                          {research.financial.partnerships.map((partnership, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {partnership}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* News Tab */}
              <TabsContent value="news" className="space-y-4">
                {research.recentNews && research.recentNews.length > 0 ? (
                  research.recentNews.map((news, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{news.headline}</CardTitle>
                          {news.date && (
                            <Badge variant="outline" className="shrink-0">
                              {news.date}
                            </Badge>
                          )}
                        </div>
                        {news.source && (
                          <CardDescription>{news.source}</CardDescription>
                        )}
                      </CardHeader>
                      {news.summary && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{news.summary}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent news available</p>
                )}
              </TabsContent>

              {/* Pain Points Tab */}
              <TabsContent value="painpoints" className="space-y-4">
                {research.painPoints && (
                  <div className="space-y-4">
                    {research.painPoints.industryChallenges && research.painPoints.industryChallenges.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Industry Challenges
                        </h4>
                        <ul className="space-y-1">
                          {research.painPoints.industryChallenges.map((challenge, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {research.painPoints.technologyGaps && research.painPoints.technologyGaps.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          Technology Gaps
                        </h4>
                        <ul className="space-y-1">
                          {research.painPoints.technologyGaps.map((gap, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {research.painPoints.scalingIssues && research.painPoints.scalingIssues.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          Scaling Issues
                        </h4>
                        <ul className="space-y-1">
                          {research.painPoints.scalingIssues.map((issue, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {research.painPoints.competitivePressures && research.painPoints.competitivePressures.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-red-500" />
                          Competitive Pressures
                        </h4>
                        <ul className="space-y-1">
                          {research.painPoints.competitivePressures.map((pressure, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {pressure}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Strategic Insights Tab */}
              <TabsContent value="insights" className="space-y-4">
                {research.strategicInsights && (
                  <div className="space-y-4">
                    {research.strategicInsights.marketPosition && (
                      <div>
                        <h4 className="font-semibold mb-2">Market Position</h4>
                        <p className="text-sm text-muted-foreground">{research.strategicInsights.marketPosition}</p>
                      </div>
                    )}

                    {research.strategicInsights.keyCompetitors && research.strategicInsights.keyCompetitors.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Key Competitors</h4>
                        <div className="flex flex-wrap gap-2">
                          {research.strategicInsights.keyCompetitors.map((competitor, i) => (
                            <Badge key={i} variant="outline">{competitor}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {research.strategicInsights.opportunities && research.strategicInsights.opportunities.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">Growth Opportunities</h4>
                        <ul className="space-y-1">
                          {research.strategicInsights.opportunities.map((opp, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {research.strategicInsights.risks && research.strategicInsights.risks.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">Risk Factors</h4>
                        <ul className="space-y-1">
                          {research.strategicInsights.risks.map((risk, i) => (
                            <li key={i} className="text-sm text-muted-foreground list-disc ml-5">
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {research?.error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{research.error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
