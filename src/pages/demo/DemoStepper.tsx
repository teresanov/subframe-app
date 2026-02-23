"use client";

import React from "react";
import { FeatherCheck } from "@subframe/core";

export type StepDef = {
  id: number;
  title: string;
  desc: string;
  highlight?: string;
};

type Props = {
  steps: StepDef[];
  currentStep: number;
  description: React.ReactNode;
};

export function DemoStepper({ steps, currentStep, description }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-col gap-0" aria-label="Pasos de la demo">
        {steps.map((s, idx) => {
          const isCompleted = s.id < currentStep;
          const isCurrent = s.id === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <div key={s.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-caption-bold font-caption-bold
                    ${isCompleted ? "border-brand-600 bg-brand-600 text-white" : ""}
                    ${isCurrent ? "border-brand-600 bg-brand-50 text-brand-700" : ""}
                    ${!isCompleted && !isCurrent ? "border-neutral-300 bg-white text-neutral-500" : ""}
                  `}
                >
                  {isCompleted ? (
                    <FeatherCheck className="h-4 w-4" />
                  ) : (
                    <span>{s.id}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 min-h-4 flex-shrink-0 ${
                      isCompleted ? "bg-brand-600" : "bg-neutral-200"
                    }`}
                    style={{ height: "24px" }}
                  />
                )}
              </div>
              <div className={`flex-1 ${isLast ? "pb-0" : "pb-2"}`}>
                <span
                  className={`text-body-bold font-body-bold ${
                    isCurrent ? "text-brand-700" : isCompleted ? "text-neutral-700" : "text-neutral-500"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            </div>
          );
        })}
      </nav>
      {description != null && (
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-border">
          {description}
        </div>
      )}
    </div>
  );
}
