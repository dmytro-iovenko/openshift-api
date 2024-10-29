import React from "react";

/**
 * MainLayout wraps the application layout.
 * @param {React.PropsWithChildren} props - Children components to render inside the layout.
 * @returns {JSX.Element} The layout containing children components.
 */
const MainLayout: React.FC<React.PropsWithChildren> = ({ children }: React.PropsWithChildren): JSX.Element => (
  <div>
    <h1>My Application</h1>
    {children}
  </div>
);

export default MainLayout;
