import { Providers } from "@/components/Providers";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

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