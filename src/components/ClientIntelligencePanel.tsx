import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Target,
  Briefcase,
  Calendar,
  Lightbulb,
} from "lucide-react";

interface ClientIntelligencePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intelligence?: {
    company: string;
    attendee: { name: string; title?: string };
    companySnapshot: {
      industry: string;
      size: string;
      stage: string;
    };
    financialHealth: {
      status: string;
      revenue?: string;
    };
    recommendedApproach: {
      keyPainPoints: string[];
      whatToPitch: string[];
      valueProposition: string;
    };
    talkingPoints: string[];
  };
}

export const ClientIntelligencePanel = ({
  open,
  onOpenChange,
  intelligence,
}: ClientIntelligencePanelProps) => {
  if (!intelligence) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5" />
            {intelligence.company}
          </SheetTitle>
          <SheetDescription>
            Meeting with {intelligence.attendee.name}
            {intelligence.attendee.title && `, ${intelligence.attendee.title}`}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Company Snapshot */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Company Snapshot
              </h3>
              <div className="space-y-2 pl-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Industry:</span>
                  <span className="font-medium">{intelligence.companySnapshot.industry}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{intelligence.companySnapshot.size}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stage:</span>
                  <Badge>{intelligence.companySnapshot.stage}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Financial Health */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Health
              </h3>
              <div className="space-y-2 pl-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary">{intelligence.financialHealth.status}</Badge>
                </div>
                {intelligence.financialHealth.revenue && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium">{intelligence.financialHealth.revenue}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Key Pain Points */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
                <Target className="h-4 w-4" />
                Key Pain Points
              </h3>
              <ul className="space-y-2 pl-6">
                {intelligence.recommendedApproach.keyPainPoints.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground list-disc">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* What to Pitch */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                What to Pitch
              </h3>
              <ul className="space-y-2 pl-6">
                {intelligence.recommendedApproach.whatToPitch.map((pitch, i) => (
                  <li key={i} className="text-sm list-disc">
                    {pitch}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Value Proposition */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Value Proposition</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {intelligence.recommendedApproach.valueProposition}
              </p>
            </div>

            <Separator />

            {/* Talking Points */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Talking Points
              </h3>
              <ul className="space-y-2 pl-6">
                {intelligence.talkingPoints.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground list-disc">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
