import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-orange-500 p-2 rounded-lg text-white group-hover:bg-orange-600 transition-colors">
            <ChefHat size={24} />
          </div>
          <span className="font-bold text-xl text-stone-800 tracking-tight">HowToCook</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/king-jingxiang/HowToCook" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-stone-500 hover:text-stone-800 transition-colors text-sm font-medium hidden sm:block"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
};
