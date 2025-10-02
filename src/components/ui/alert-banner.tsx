import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Clock } from "lucide-react";

interface RateLimitAlertProps {
  resetIn: number; // seconds
}

export function RateLimitAlert({ resetIn }: RateLimitAlertProps) {
  const minutes = Math.ceil(resetIn / 60);
  
  return (
    <Alert variant="destructive" className="mb-4">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Rate Limit Exceeded</AlertTitle>
      <AlertDescription className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Too many requests. Please wait {minutes} minute{minutes > 1 ? 's' : ''} before trying again.
      </AlertDescription>
    </Alert>
  );
}

interface SecurityAlertProps {
  message: string;
}

export function SecurityAlert({ message }: SecurityAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Security Warning</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
