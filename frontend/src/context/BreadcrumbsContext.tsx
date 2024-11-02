import React, { createContext, useContext, useState } from "react";

/**
 * Represents a breadcrumb item.
 */
interface Breadcrumb {
  label: string;
  path?: string;
}

/**
 * Represents the breadcrumbs context type.
 */
interface BreadcrumbsContextType {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

/**
 * Represents the breadcrumbs context.
 */
const BreadcrumbsContext = createContext<BreadcrumbsContextType | undefined>(undefined);

/**
 * Represents the breadcrumbs provider component.
 */
export const BreadcrumbsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  return <BreadcrumbsContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>{children}</BreadcrumbsContext.Provider>;
};

/**
 * Represents the useBreadcrumbs hook.
 * @returns {BreadcrumbsContextType} The breadcrumbs context.
 */
export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbsContext);
  if (!context) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbsProvider");
  }
  return context;
};
