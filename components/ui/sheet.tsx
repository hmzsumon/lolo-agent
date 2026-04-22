"use client";
/* ────────── shadcn/ui Sheet (bottom drawer ready) ────────── */

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

/* tiny util */
function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

type Side = "top" | "bottom" | "left" | "right";

const sideClass: Record<Side, string> = {
  top: "inset-x-0 top-0 border-b",
  bottom: "inset-x-0 bottom-0 border-t",
  left: "inset-y-0 left-0 h-full w-3/4 max-w-md border-r",
  right: "inset-y-0 right-0 h-full w-3/4 max-w-md border-l",
};

const transitionClass: Record<Side, string> = {
  top: "data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
  bottom:
    "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  left: "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  right:
    "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
};

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: Side;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid gap-4 bg-[#0E1014] text-white shadow-2xl border border-white/10 p-4",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        sideClass[side],
        transitionClass[side],
        side === "bottom" || side === "top" ? "rounded-t-2xl" : "",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-1 text-white/80", className)}
    {...props}
  />
);

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
);

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-sm font-medium text-white", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-white/60", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
