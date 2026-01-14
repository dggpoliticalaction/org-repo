import { Providers } from "@/components/Providers";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import "@/styles/globals.css";

export interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps): React.ReactNode => {
  return (
    <html suppressHydrationWarning>
      <body className="flex items-center justify-center h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;