import React from "react";

/**
 * MainLayout component to wrap the main application content.
 * @param {React.PropsWithChildren} props - Children components to render inside the layout.
 * @returns {JSX.Element} The layout containing children components.
 */
const MainLayout: React.FC<React.PropsWithChildren> = ({ children }: React.PropsWithChildren): JSX.Element => (
  <div>
    {children}
  </div>
);

export default MainLayout;
