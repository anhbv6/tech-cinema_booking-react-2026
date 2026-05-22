import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/providers/toast-provider";
import { SessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";

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
            <body>
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