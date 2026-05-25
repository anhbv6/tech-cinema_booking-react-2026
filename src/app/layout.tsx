import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/providers/toast-provider";
import { SessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
    title: "Tech Cinema Booking",
    description: "Movie ticket booking platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className={poppins.className}>
                <SessionProvider>
                    <QueryProvider>
                        {children}
                        <ToastProvider />    
                    </QueryProvider>
                </SessionProvider>
            </body>
        </html>
    );
}