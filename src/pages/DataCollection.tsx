import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Mail } from "lucide-react";
import CalendarEvents from "@/components/CalendarEvents";
import EmailList from "@/components/EmailList";

const DataCollection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Data Collection Module</h1>
          <p className="text-muted-foreground mt-2">
            Calendar events and email analysis from Google APIs
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail className="w-4 h-4" />
              Emails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarEvents />
          </TabsContent>

          <TabsContent value="emails">
            <EmailList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataCollection;
