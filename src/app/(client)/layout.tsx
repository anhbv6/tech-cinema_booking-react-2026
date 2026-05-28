"use client";

import ClientSidebar from '@/components/client/client-sidebar'
import HeaderSidebar from '@/components/client/header-sidebar'
import React from 'react'

export default function ClientLayout({
    children,
} : {
    children: React.ReactNode;
}) {
    return (
        <div>
            <HeaderSidebar />
            <div>
                <ClientSidebar />
                {children}
            </div>
        </div>
    )
}