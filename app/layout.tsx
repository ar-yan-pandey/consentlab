import type { Metadata } from "next";
import "./globals.css";
import ToastContainer from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "ConsentLab - Understand. Trust. Consent.",
  description: "A digital bridge that simplifies, secures, and personalizes medical consent for every Indian patient.",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
