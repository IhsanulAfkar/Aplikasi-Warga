import React from "react";
import { cn } from "@/lib/utils";
import { FloatingAIChat } from "../chat";

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}
export function MobileFrame({ children, className }: MobileFrameProps) {
  return (
    <div className="w-full min-h-screen flex overflow-y-auto justify-center bg-slate-200/80 py-0">
      <main
        className={cn(
          "w-full max-w-md min-h-screen sm:my-auto bg-slate-50 flex flex-col relative",
          "sm:rounded-xl sm:shadow-2xl overflow-hidden",
          className
        )}
      >


        {/* Scrollable content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto sm:pt-3">
          {children}
        </div>
      </main>
    </div>
  );
}
