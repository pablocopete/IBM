import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Lock,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Mail,
} from "lucide-react";

const Dashboard = () => {
  // Mock data - will be replaced with real data when Cloud is connected
  const sessionTimeRemaining = 28; // minutes
  const rateLimitUsed = 47; // requests
  const rateLimitMax = 100;

  const auditLogs = [
    { id: 1, action: "OAuth Token Refreshed", service: "Google Calendar", timestamp: "2 mins ago", status: "success" },
    { id: 2, action: "API Request", service: "Gmail API", timestamp: "5 mins ago", status: "success" },
    { id: 3, action: "Rate Limit Check", service: "System", timestamp: "8 mins ago", status: "success" },
    { id: 4, action: "Session Validation", service: "Auth", timestamp: "12 mins ago", status: "success" },
    { id: 5, action: "Failed Login Attempt", service: "Auth", timestamp: "1 hour ago", status: "warning" },
  ];

  const securityStatus = [
    { label: "OAuth 2.0", status: "active", icon: Lock },
    { label: "Token Encryption", status: "active", icon: Shield },
    { label: "Rate Limiting", status: "active", icon: Activity },
    { label: "Session Timeout", status: "active", icon: Clock },
    { label: "CORS Policy", status: "active", icon: CheckCircle2 },
    { label: "CSP Headers", status: "active", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Security Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Authentication & Security Module Overview
            </p>
          </div>
          <Badge variant="outline" className="h-8 text-sm px-4">
            <Shield className="w-4 h-4 mr-2" />
            All Systems Secure
          </Badge>
        </div>

        {/* Top Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Session Timeout</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionTimeRemaining} min</div>
              <Progress value={(sessionTimeRemaining / 30) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Auto-logout in {sessionTimeRemaining} minutes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rateLimitUsed}/{rateLimitMax}</div>
              <Progress value={(rateLimitUsed / rateLimitMax) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Requests used this hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">OAuth Services</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2/2</div>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Calendar
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Mail className="w-3 h-3" />
                  Gmail
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                All connections active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98/100</div>
              <Progress value={98} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Excellent security posture
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="security" className="space-y-4">
          <TabsList>
            <TabsTrigger value="security">Security Status</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="connections">OAuth Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Features Status</CardTitle>
                <CardDescription>
                  Real-time monitoring of all security components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {securityStatus.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-success" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <Badge variant="outline" className="text-success border-success">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>
                  Encryption and storage security measures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Token Encryption at Rest</span>
                  <Badge className="bg-success">AES-256</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data in Transit</span>
                  <Badge className="bg-success">TLS 1.3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">HTTPS Enforcement</span>
                  <Badge className="bg-success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CORS Policy</span>
                  <Badge className="bg-success">Restricted</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Audit Trail</CardTitle>
                <CardDescription>
                  Complete log of all authentication and data access attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-1">
                        {log.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : log.status === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{log.action}</p>
                          <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.service}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>OAuth 2.0 Connections</CardTitle>
                <CardDescription>
                  Manage your Google Calendar and Gmail API access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Google Calendar</p>
                        <p className="text-sm text-muted-foreground">Read and write access</p>
                      </div>
                    </div>
                    <Badge className="bg-success">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Token expires in:</span>
                    <span className="font-medium">6 days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last accessed:</span>
                    <span className="font-medium">2 minutes ago</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Gmail API</p>
                        <p className="text-sm text-muted-foreground">Read-only access</p>
                      </div>
                    </div>
                    <Badge className="bg-success">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Token expires in:</span>
                    <span className="font-medium">5 days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last accessed:</span>
                    <span className="font-medium">5 minutes ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
