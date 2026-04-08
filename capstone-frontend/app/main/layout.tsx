import { Suspense } from 'react';
import Navbar from '../components/Navbar';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense>
                <Navbar />
            </Suspense>
            <main className="max-w-7xl mx-auto px-4 py-6">
                <Suspense>
                    {children}
                </Suspense>
            </main>
        </div>
    );
}