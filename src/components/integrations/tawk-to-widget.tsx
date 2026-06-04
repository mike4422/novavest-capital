"use client";

import Script from "next/script";

export function TawkToWidget() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_TO_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_TO_WIDGET_ID || "default";

  if (!propertyId) return null;

  return (
    <Script
      id="tawk-to-widget"
      strategy="afterInteractive"
      src={`https://embed.tawk.to/${propertyId}/${widgetId}`}
    />
  );
}
