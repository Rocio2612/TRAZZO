import { LucideIcon } from "lucide-react";

interface PagePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  sprint: string;
}

export function PagePlaceholder({
  icon: Icon,
  title,
  description,
  sprint,
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-3">{description}</p>
      <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-3 py-1">
        {sprint}
      </span>
    </div>
  );
}
