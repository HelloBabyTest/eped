import { Link } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              E-Pedagog
            </span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden xs:inline">Kirish</span>
            </Link>
            <Link 
              to="/register" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Ro'yxatdan o'tish</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
