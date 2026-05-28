"use client";

import ClientSidebar from '@/components/client/client-sidebar'
import HeaderSidebar from '@/components/client/header-sidebar'
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