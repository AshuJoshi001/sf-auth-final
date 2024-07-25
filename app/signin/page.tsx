'use client'

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Card } from 'flowbite-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const providersIcons = {
    Salesforce: '/icons/salesforce-svgrepo-com.svg',
};

export default function SignIn() {
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
    console.log('SignIn Page');


        if (status === 'authenticated' && session) {
            router.push('/');
        }
    }, [session, status, router]);

    if (status === 'loading' || session) {
        return null;
    }

    return (
        <>

<div className="flex h-screen">
    <div className="m-auto">
        <div className="max-w-md">
            <Card>
                <h5 className="mb-3 text-base text-gray-900 dark:text-white lg:text-xl">
                    Connect to Salesforce
                </h5>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    For this demo, we use Salesforce as the provider. Click the salesforce button to get authenticated.
                </p>
                <ul className="my-4 space-y-3">
                    <li onClick={() => signIn('salesforce')}>
                        <button className="w-full flex flex-col items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">
                            <Image
                                src={providersIcons['Salesforce']}
                                alt="Salesforce"
                                width={25}
                                height={25}
                            />
                            <span className="ml-3 whitespace-nowrap">
                                Salesforce
                            </span>
                        </button>
                    </li>
                </ul>
                <div className="space-y-4 flex flex-col">
                    <div>
                        <label htmlFor="clientId">Client ID</label>
                        <input
                            type="text"
                            id="clientId"
                            onChange={(e) => setClientId(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="clientSecret">Client Secret</label>
                        <input
                            type="password"
                            id="clientSecret"
                            onChange={(e) => setClientSecret(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </Card>
        </div>
    </div>
</div>
           
        </>
    );
};
