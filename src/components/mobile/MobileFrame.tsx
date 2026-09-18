import React from "react";
import { cn } from "@/lib/utils";

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileFrame({ children, className }: MobileFrameProps) {
  return (
    <div className="w-full min-h-screen flex justify-center bg-slate-200/80 sm:py-0 md:py-6">
      <main
        className={cn(
          "w-full max-w-[430px] min-h-screen sm:min-h-[92vh] sm:my-auto bg-slate-50 flex flex-col relative",
          "sm:rounded-[2rem] sm:shadow-2xl sm:border-[6px] sm:border-slate-800/90 sm:ring-1 sm:ring-black/10 overflow-hidden",
          className
        )}
      >
        {/* Mobile Speaker/Camera bar for realistic preview on desktop */}
        <div className="hidden sm:flex justify-center items-center h-4 w-full bg-slate-900 absolute top-0 left-0 z-50 rounded-t-xl">
          <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Content container */}
        <div className="flex-1 flex flex-col sm:pt-3">{children}</div>
      </main>
    </div>
  );
}
