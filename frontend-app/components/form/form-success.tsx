import { CheckCircle } from "lucide-react";

export const FormSuccess = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <div className="flex items-center bg-primary/25 my-4 gap-2 text-secondary-foreground p-3 rounded-md">
      <CheckCircle className="w-4 h-4 text-primary" />
      <p>{message}</p>
    </div>
  );
};
