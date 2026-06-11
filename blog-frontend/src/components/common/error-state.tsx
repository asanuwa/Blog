import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";

type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
}: ErrorStateProps) {
  return (
    <EmptyState
      title={title}
      description={message}
      icon={<AlertCircle className="size-6" aria-hidden="true" />}
      role="alert"
    />
  );
}
