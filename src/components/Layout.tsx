import React from 'react';
import { Navbar } from './Navbar';
import { ScrollRestoration } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <ScrollRestoration />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-white border-t border-stone-200 py-8 text-center text-stone-400 text-sm">
        <p>© {new Date().getFullYear()} HowToCook. Open Source Project.</p>
      </footer>
    </div>
  );
};
