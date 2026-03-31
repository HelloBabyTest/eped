import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">E-Pedagog</span>
          </div>
          
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Biz haqimizda</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Yordam</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Maxfiylik siyosati</a>
          </div>
          
          <div className="text-sm text-gray-400">
            © 2026 E-Pedagog. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </div>
    </footer>
  );
}
