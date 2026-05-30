// Client provider that gets registered into admin.components.providers — its
// only job is to import the CoopBank brand CSS into the admin's React tree,
// because Payload's RootLayout builds its own document and silently drops
// CSS imports from the (payload) route-group layout.
"use client";
import "./brand.css";
import React from "react";

const BrandStyles: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default BrandStyles;
