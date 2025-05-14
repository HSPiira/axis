import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui";
// import { AuthProvider } from "@/components/auth/session-provider";
import { Inter } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-montserrat',
});

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "careAxis - Modern Counseling Platform",
  description: "Your confidential, modern counseling platform",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className={`${montserrat.variable} min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}