"use client";

import React from "react";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <Outlet />
    </div>
  );
}
