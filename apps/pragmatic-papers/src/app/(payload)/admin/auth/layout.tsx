import { Logo } from "@/components/Logo";
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
      <body className="flex flex-col items-center justify-around h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <Providers>
            <div className="flex items-center justify-center">
              <Logo love />
            </div>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;