"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full flex-col overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg backdrop-blur-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full before:absolute before:inset-0 before:-z-10 before:bg-black/20",
  {
    variants: {
      variant: {
        default: "text-white/90",
        destructive: "destructive group border-red-500/20 text-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const timerRef = React.useRef<number>();

  React.useEffect(() => {
    if (!isOpen) {
      props.onOpenChange?.(false);
      return;
    }

    timerRef.current = window.setTimeout(() => setIsOpen(false), 5000);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen, props]);

  return (
    <ToastPrimitives.Root
      ref={ref}
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">{props.children}</div>
          <ToastPrimitives.Close
            className="rounded-md p-1.5 text-white/40 opacity-0 transition-opacity hover:bg-white/5 hover:text-white focus:opacity-100 focus:outline-none group-hover:opacity-100"
            onClick={() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
              }
              setIsOpen(false);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </ToastPrimitives.Close>
        </div>
        {isOpen && (
          <div className="toast-progress absolute -bottom-4 -left-4 -right-4 h-[2px] origin-left bg-white/5">
            <div className="h-full w-full animate-progress-bar bg-white/20" />
          </div>
        )}
      </div>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, onClick, ...props }, ref) => {
  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        "mt-2 inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium tracking-tight transition-colors hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={(e) => {
        // Execute the undo action first
        onClick?.(e);
        // Then immediately dismiss the toast using our custom dismiss function
        const { dismiss } = props as {
          dismiss?: (immediate?: boolean) => void;
        };
        if (dismiss) {
          dismiss(true);
        }
      }}
      {...props}
    />
  );
});
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-sm font-semibold tracking-tight text-white/90",
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      "line-clamp-2 text-sm font-medium leading-relaxed text-white/60",
      className
    )}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "rounded-md p-2 text-white/50 opacity-0 transition-opacity hover:bg-white/5 hover:text-white focus:opacity-100 focus:outline-none group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
};
