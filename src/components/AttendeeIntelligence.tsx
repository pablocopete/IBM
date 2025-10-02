import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Building2, Briefcase, Calendar, TrendingUp, ExternalLink, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CompanyResearch } from "./CompanyResearch";
import { attendeeSchema, validateBatch } from "@/lib/validation";

interface AttendeeData {
  name: string;
  email: string;
  emailDomain?: string;
  jobTitle?: string;
  role?: string;
  yearsAtCompany?: string;
  professionalBackground?: string;
  recentActivities?: string[];
  companyName?: string;
  companyIndustry?: string;
  linkedInUrl?: string;
  confidence?: "high" | "medium" | "low";
  error?: string;
}

interface AttendeeIntelligenceProps {
  calendarEvents: any[];
}

export const AttendeeIntelligence = ({ calendarEvents }: AttendeeIntelligenceProps) => {
  const [intelligence, setIntelligence] = useState<AttendeeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; severity: 'warning' | 'error' } | null>(null);
  const { toast } = useToast();

  const analyzeAttendees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Extract all unique external attendees (not from common domains)
      const internalDomains = ['company.com', 'gmail.com', 'yahoo.com', 'hotmail.com'];
      const allAttendees: { name: string; email: string }[] = [];
      
      calendarEvents.forEach(event => {
        if (event.attendees) {
          event.attendees.forEach((attendee: { name: string; email: string }) => {
            const domain = attendee.email.split('@')[1];
            if (!internalDomains.includes(domain) && 
                !allAttendees.some(a => a.email === attendee.email)) {
              allAttendees.push(attendee);
            }
          });
        }
      });

      // Validate attendees before sending
      try {
        validateBatch(attendeeSchema, allAttendees, 50);
      } catch (validationError) {
        setError({
          message: 'Invalid attendee data format',
          severity: 'error',
        });
        toast({
          title: "Validation Error",
          description: validationError instanceof Error ? validationError.message : "Invalid attendee data",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (allAttendees.length === 0) {
        setError({
          message: 'No external attendees found in calendar events',
          severity: 'warning',
        });
        setIsLoading(false);
        return;
      }

      console.log('Analyzing attendees:', allAttendees);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-attendees`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ attendees: allAttendees }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle rate limiting gracefully
        if (response.status === 429) {
          setError({
            message: 'Rate limit reached. Please wait a moment before trying again.',
            severity: 'warning',
          });
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please wait before trying again.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to analyze attendees');
      }

      const data = await response.json();
      setIntelligence(data.attendees);
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${data.attendees.length} meeting attendees`,
      });
    } catch (error) {
      console.error('Error analyzing attendees:', error);
      
      // Set graceful error state
      setError({
        message: 'Unable to fetch complete attendee intelligence. Basic information displayed.',
        severity: 'warning',
      });
      
      toast({
        title: "Partial Analysis Available",
        description: "Some attendee data unavailable. Showing available information.",
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
      {error && (
        <div className={`border rounded-lg p-4 ${
          error.severity === 'warning' 
            ? 'bg-warning/10 border-warning/20' 
            : 'bg-destructive/10 border-destructive/20'
        }`}>
          <p className="flex items-center gap-2 text-sm">
            <AlertCircle className={`w-4 h-4 ${
              error.severity === 'warning' ? 'text-warning' : 'text-destructive'
            }`} />
            <span>{error.message}</span>
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Meeting Attendee Intelligence
          </CardTitle>
          <CardDescription>
            AI-powered research on external meeting participants and their companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={analyzeAttendees} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching Attendees...
              </>
            ) : (
              "Analyze Meeting Attendees"
            )}
          </Button>
        </CardContent>
      </Card>

      {intelligence.length > 0 && (
        <div className="space-y-4">
          {intelligence.map((attendee, idx) => (
            <Card key={idx} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {attendee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{attendee.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{attendee.email}</span>
                        {attendee.linkedInUrl && (
                          <a 
                            href={attendee.linkedInUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            LinkedIn
                          </a>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  {getConfidenceBadge(attendee.confidence)}
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                {attendee.error ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{attendee.error}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Professional Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          Position
                        </div>
                        <div className="pl-6">
                          <p className="font-semibold">{attendee.jobTitle || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{attendee.role || 'Role not specified'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          Company
                        </div>
                        <div className="pl-6">
                          <p className="font-semibold">{attendee.companyName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {attendee.companyIndustry || attendee.emailDomain}
                          </p>
                        </div>
                      </div>

                      {attendee.yearsAtCompany && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Tenure
                          </div>
                          <div className="pl-6">
                            <p>{attendee.yearsAtCompany}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {attendee.professionalBackground && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Professional Background</h4>
                          <p className="text-sm text-muted-foreground">{attendee.professionalBackground}</p>
                        </div>
                      </>
                    )}

                    {attendee.recentActivities && attendee.recentActivities.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            Recent Activities
                          </div>
                          <ul className="space-y-1 pl-6">
                            {attendee.recentActivities.map((activity, i) => (
                              <li key={i} className="text-sm text-muted-foreground list-disc">
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    {/* Company Research Section */}
                    {attendee.companyName && attendee.emailDomain && (
                      <>
                        <Separator />
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="company-research">
                            <AccordionTrigger>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Deep Dive: {attendee.companyName} Research
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <CompanyResearch 
                                companyName={attendee.companyName}
                                companyDomain={attendee.emailDomain}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
