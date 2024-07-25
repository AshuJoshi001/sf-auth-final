'use client'
import React, { ReactNode } from 'react';
import '../common/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { Flowbite } from 'flowbite-react';
import { Analytics } from '@vercel/analytics/react';

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body>
                <SessionProvider>
                    <Flowbite>
                        {children}
                        <Analytics />
                    </Flowbite>
                </SessionProvider>
            </body>
        </html>
    );
}