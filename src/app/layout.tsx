import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/providers/toast-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Poppins } from "next/font/google";
import { AuthBootstrap } from "@/components/auth/auth-bootstrap";

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
                <QueryProvider>
                    <AuthBootstrap />
                        {children}
                    <ToastProvider />
                </QueryProvider>
            </body>
        </html>
    );
}
