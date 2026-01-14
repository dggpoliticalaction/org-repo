import { Providers } from "@/providers";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import "@/styles/globals.css";

export interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <html suppressHydrationWarning>
      <body className="flex items-center justify-center h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          {/* <Providers> */}
            {children}
            {/* </Providers> */}
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;