import { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { supabase, Session } from './lib/supabase';
import { SessionForm } from './components/SessionForm';
import { AdminLogin } from './components/AdminLogin';
import { Schedule } from './pages/Schedule';
import { ImportantLinks } from './pages/ImportantLinks';
import { Materials } from './pages/Materials';

type PageType = 'schedule' | 'important' | 'materials';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentPage, setCurrentPage] = useState<PageType>('schedule');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date_start', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAdmin(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleAddSession = () => {
    setEditingSession(null);
    setShowSessionForm(true);
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const handleSaveSession = async (data: Omit<Session, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingSession) {
        const { error } = await supabase
          .from('sessions')
          .update(data)
          .eq('id', editingSession.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sessions')
          .insert([data]);

        if (error) throw error;
      }

      await fetchSessions();
      setShowSessionForm(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Ошибка при сохранении занятия');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это занятие?')) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Ошибка при удалении занятия');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-6">
            <button
              onClick={() => setCurrentPage('schedule')}
              className={`text-s font-medium transition-colors ${
                currentPage === 'schedule'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Расписание
            </button>
            <button
              onClick={() => setCurrentPage('important')}
              className={`text-s font-medium transition-colors ${
                currentPage === 'important'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Важные ссылки
            </button>
            <button
              onClick={() => setCurrentPage('materials')}
              className={`text-s font-medium transition-colors ${
                currentPage === 'materials'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Полезное
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
        {currentPage === 'schedule' && (
          <Schedule
            sessions={sessions}
            isAdmin={isAdmin}
            onAddSession={handleAddSession}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            loading={loading}
          />
        )}
        {currentPage === 'important' && (
          <ImportantLinks
            isAdmin={isAdmin}
            onBack={() => setCurrentPage('schedule')}
          />
        )}
        {currentPage === 'materials' && (
          <Materials
            isAdmin={isAdmin}
            onBack={() => setCurrentPage('schedule')}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <button
              onClick={() => (isAdmin ? handleLogout() : setShowLoginModal(true))}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isAdmin
                  ? 'text-red-600 hover:text-red-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isAdmin ? (
                <span className="flex items-center gap-1">
                  <LogOut className="w-3 h-3" />
                  выйти
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <LogIn className="w-3 h-3" />
                  •
                </span>
              )}
            </button>
          </div>
        </div>
      </footer>

      {showLoginModal && (
        <AdminLogin
          onLogin={handleLogin}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

      {showSessionForm && (
        <SessionForm
          session={editingSession}
          onSave={handleSaveSession}
          onCancel={() => {
            setShowSessionForm(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
