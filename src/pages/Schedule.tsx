import { useState } from 'react';
import { Calendar, Plus, AlertCircle, X } from 'lucide-react';
import { Session } from '../lib/supabase';
import { UpcomingCard } from '../components/UpcomingCard';
import { ScheduleTable } from '../components/ScheduleTable';

type FilterType = 'future' | 'past' | 'all';

type ScheduleProps = {
  sessions: Session[];
  isAdmin: boolean;
  onAddSession: () => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
  loading: boolean;
};

export function Schedule({
  sessions,
  isAdmin,
  onAddSession,
  onEditSession,
  onDeleteSession,
  loading
}: ScheduleProps) {
  const [filter, setFilter] = useState<FilterType>('future');
  const [typeFilter, setTypeFilter] = useState<'all' | 'theory' | 'practical'>('all');
  const [showAlert, setShowAlert] = useState(true);

  const now = new Date();
  const filteredSessions = sessions
    .filter((session) => {
      const sessionDate = new Date(session.date_start);

      // по дате
      if (filter === 'future' && !(sessionDate >= now)) return false;
      if (filter === 'past' && !(sessionDate < now)) return false;

      // по типу (если выбран не 'all')
      if (typeFilter !== 'all' && session.type !== typeFilter) return false;

      return true;
    })
    .sort((a, b) => {
      const aDate = new Date(a.date_start).getTime();
      const bDate = new Date(b.date_start).getTime();

      if (filter === 'past') {
        // прошедшие — сначала недавние (большая дата -> раньше)
        return bDate - aDate;
      } else {
        // future / all — по возрастанию
        return aDate - bDate;
      }
    });

  const upcomingTheory = sessions
    .filter((s) => s.type === 'theory' && new Date(s.date_start) >= now)
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())[0];

  const upcomingPractical = sessions
    .filter((s) => s.type === 'practical' && new Date(s.date_start) >= now)
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())[0];

  return (
    <>
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-amber-50 border-b-2 border-amber-400 px-4 py-4 z-40 shadow-md">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-900 font-medium">
                  Отметься в табличке. На сколько дней едешь на практику 8-9 ноября.
                </p>
                <a
                  href="https://docs.google.com/spreadsheets/d/12zaEQrEvwml8k_zNuo34OT5sMXe5HZa1tYNL63DXi_U/edit?gid=1659407134#gid=1659407134"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 underline hover:text-amber-800 font-medium text-sm mt-1 inline-block"
                >
                  Открыть таблицу →
                </a>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="text-amber-600 hover:text-amber-800 flex-shrink-0 mt-0.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className={showAlert ? 'pt-24' : ''}>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
            <UpcomingCard session={upcomingTheory} type="theory" />
            <UpcomingCard session={upcomingPractical} type="practical" />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Полное расписание</h2>

              <div className="flex flex-wrap items-center gap-3">                          
                <div>
                  <label htmlFor="typeFilter" className="sr-only">Тип</label>
                  <select
                    id="typeFilter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'all' | 'theory' | 'practical')}
                    className="border rounded-lg px-3 py-1.5 text-sm bg-white"
                  >
                    <option value="all">Все типы</option>
                    <option value="theory">Теория</option>
                    <option value="practical">Практика</option>
                  </select>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setFilter('future')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      filter === 'future'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Будущие
                  </button>
                  <button
                    onClick={() => setFilter('past')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      filter === 'past'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Прошедшие
                  </button>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Все
                  </button>
                </div>

                {isAdmin && (
                  <button
                    onClick={onAddSession}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить
                  </button>
                )}
              </div>
            </div>

            <ScheduleTable
              sessions={filteredSessions}
              onEdit={onEditSession}
              onDelete={onDeleteSession}
              isAdmin={isAdmin}
            />
          </div>
          </>
        )}
      </div>
    </>
  );
}
