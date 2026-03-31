import { AlertCircle, ExternalLink, Settings } from 'lucide-react';

export default function ConfigRequired() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <Settings className="w-8 h-8 text-amber-500 animate-spin-slow" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supabase Sozlanmagan
          </h2>
          
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  Ilovani ishlatish uchun Supabase kalitlarini kiritishingiz kerak.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 w-full">
            <div className="text-sm text-gray-600 text-left">
              <p className="font-semibold mb-2">Qadamlar:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Supabase loyihangizga kiring</li>
                <li>Settings {'>'} API bo'limiga o'ting</li>
                <li>Project URL va Anon Key nusxasini oling</li>
                <li>AI Studio "Secrets" paneliga quyidagilarni qo'shing:</li>
              </ol>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 text-left font-mono text-xs text-indigo-300 space-y-2">
              <p>VITE_SUPABASE_URL=...</p>
              <p>VITE_SUPABASE_ANON_KEY=...</p>
            </div>

            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Supabase Dashboard
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
