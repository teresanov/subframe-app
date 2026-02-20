"use client";
/*
 * Documentation:
 * Side_bar — https://app.subframe.com/fd4b193724a6/library?component=Side_bar_8ee1dfcc-81e4-4d0e-8b72-f727f00653ee
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface Side_BarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  homeItem?: React.ReactNode;
  ordersSectionTitle?: React.ReactNode;
  ordersItems?: React.ReactNode;
  suppliersSectionTitle?: React.ReactNode;
  suppliersItems?: React.ReactNode;
  inventorySectionTitle?: React.ReactNode;
  inventoryItems?: React.ReactNode;
  reportsSectionTitle?: React.ReactNode;
  reportsItems?: React.ReactNode;
  className?: string;
}

const Side_BarRoot = React.forwardRef<HTMLDivElement, Side_BarRootProps>(
  function Side_BarRoot(
    {
      homeItem,
      ordersSectionTitle,
      ordersItems,
      suppliersSectionTitle,
      suppliersItems,
      inventorySectionTitle,
      inventoryItems,
      reportsSectionTitle,
      reportsItems,
      className,
      ...otherProps
    }: Side_BarRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex h-full w-full flex-col items-start px-4 py-4 overflow-auto",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {homeItem ? (
          <div className="flex w-full flex-col items-start gap-1">
            {homeItem}
          </div>
        ) : null}
        <div className="flex w-full flex-col items-start gap-1 pt-6">
          <div className="flex w-full flex-col items-start gap-4 px-3 py-1">
            {ordersSectionTitle ? (
              <span className="w-full text-caption-bold font-caption-bold text-subtext-color">
                {ordersSectionTitle}
              </span>
            ) : null}
          </div>
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-1">
            {ordersItems ? (
              <div className="flex w-full flex-col items-start gap-1">
                {ordersItems}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-1 pt-6">
          <div className="flex w-full flex-col items-start gap-4 px-3 py-1">
            {suppliersSectionTitle ? (
              <span className="w-full text-caption-bold font-caption-bold text-subtext-color">
                {suppliersSectionTitle}
              </span>
            ) : null}
          </div>
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-1">
            {suppliersItems ? (
              <div className="flex w-full flex-col items-start gap-1">
                {suppliersItems}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-1 pt-6">
          <div className="flex w-full flex-col items-start gap-4 px-3 py-1">
            {inventorySectionTitle ? (
              <span className="w-full text-caption-bold font-caption-bold text-subtext-color">
                {inventorySectionTitle}
              </span>
            ) : null}
          </div>
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-1">
            {inventoryItems ? (
              <div className="flex w-full flex-col items-start gap-1">
                {inventoryItems}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-1 pt-6">
          <div className="flex w-full flex-col items-start gap-4 px-3 py-1">
            {reportsSectionTitle ? (
              <span className="w-full text-caption-bold font-caption-bold text-subtext-color">
                {reportsSectionTitle}
              </span>
            ) : null}
          </div>
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-1">
            {reportsItems ? (
              <div className="flex w-full flex-col items-start gap-1">
                {reportsItems}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

export const Side_Bar = Side_BarRoot;
