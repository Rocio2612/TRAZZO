import { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface PagePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  sprint?: string;
}

export function PagePlaceholder({
  icon: Icon,
  title,
  description,
  sprint = 'próximo sprint',
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-muted/30 p-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-8" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <Badge variant="secondary">Próximamente</Badge>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>

      <p className="text-xs text-muted-foreground">
        Esta sección se implementará en el {sprint}.
      </p>
    </div>
  );
}