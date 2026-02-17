/**
 * Next.js App Router Example
 * 
 * Demonstrates how to access user session in Server Components.
 * Note: @aerostack/react is primarily for Client Components.
 * For Server Components, usage depends on where you store the token (cookies vs local storage).
 * 
 * If using cookies:
 */

// app/layout.tsx (Client Component Wrapper)
/*
'use client';
import { AerostackProvider } from '@aerostack/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AerostackProvider projectSlug="...">
          {children}
        </AerostackProvider>
      </body>
    </html>
  );
}
*/

// app/page.tsx (Server Component)
import { cookies } from 'next/headers';
import { AerostackClient } from '@aerostack/sdk'; // Use Core SDK on server

async function getUser() {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    const client = new AerostackClient({ projectSlug: '...' });
    try {
        return await client.auth.getCurrentUser(token);
    } catch {
        return null;
    }
}

export default async function Page() {
    const user = await getUser();

    if (!user) {
        return <div>Please log in</div>
    }

    return <h1>Hello Server-Side User: {user.email}</h1>
}
