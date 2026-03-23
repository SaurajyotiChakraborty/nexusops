import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TokenSyncer } from "@/components/auth/token-syncer";
import { LayoutProvider } from "@/components/layout/layout-context";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProfileProvider } from "@/components/auth/user-profile-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexusOps Cloud - AI-Powered Hosting Platform",
  description: "Next-generation hosting platform with AI Ops, visual infrastructure intelligence, and developer-first automation. Deploy with one click, observe visually in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <TokenSyncer />
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LayoutProvider>
              <UserProfileProvider>
                {children}
              </UserProfileProvider>
            </LayoutProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
