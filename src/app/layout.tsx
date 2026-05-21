import type { Metadata } from "next";
import "./globals.css";

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
            <body>{children}</body>
        </html>
    );
}