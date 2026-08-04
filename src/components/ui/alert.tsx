import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid grid-cols-[0_1fr] has-[>svg]:grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive [&>svg]:text-destructive",
        warning:
          "border-warning/40 bg-warning/10 text-warning-foreground [&>svg]:text-warning",
        success:
          "border-success/40 bg-success/10 text-success-foreground [&>svg]:text-success",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn("col-start-2 font-medium leading-none tracking-tight", className)} {...props} />
  );
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("col-start-2 text-sm text-muted-foreground [&_p]:leading-relaxed", className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription };
