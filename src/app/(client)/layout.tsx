"use client";

import { ClientSidebar, HeaderSidebar } from "@/features/client/navigation";
import React from 'react'
import './style.css'

export default function ClientLayout({
    children,
} : {
    children: React.ReactNode;
}) {
    return (
        <div className='min-h-screen'>
            <HeaderSidebar />
            <div className='flex h-[calc(100vh-64px)]'>
                <ClientSidebar />
                <div className='p-4 w-full overflow-auto no-scrollbar'>
                    {children}
                </div>
            </div>
        </div>
    )
}
