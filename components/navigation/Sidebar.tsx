"use client";

import { SessionNavBar } from "@/components/ui/sidebar";

export function Sidebar() {
  return (
    <>
      {/* This placeholder takes up space so content doesn't overlap with the sidebar */}
      <div className="w-[3.05rem] flex-shrink-0">
        {/* Empty div that reserves space for the collapsed sidebar */}
      </div>
      <SessionNavBar />
    </>
  );
}
