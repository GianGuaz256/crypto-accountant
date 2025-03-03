'use client';

import { CalendarClock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  subtitle?: string;
}

export default function ComingSoon({ title, subtitle }: ComingSoonProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16">
      <div className="text-center max-w-xl">
        <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CalendarClock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {subtitle || "We're currently building this feature. Please check back soon!"}
        </p>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
} 