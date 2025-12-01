import { Calendar, ExternalLink, FileText, Users } from 'lucide-react';
import { Session } from '../lib/supabase';

type ScheduleTableProps = {
  sessions: Session[];
  onEdit?: (session: Session) => void;
  onDelete?: (id: string) => void;
  isAdmin: boolean;
};

export function ScheduleTable({ sessions, onEdit, onDelete, isAdmin }: ScheduleTableProps) {
  const parseLinksInText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const formatDateRange = (start: string, end: string | null, type: 'theory' | 'practical') => {
    if (type === 'practical') {
      if (!end) {
        return formatDate(start);
      }
      return `${formatDate(start)} - ${formatDate(end)}`;
    }

    if (!end) {
      return formatDateTime(start);
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.toDateString() === endDate.toDateString()) {
      const dateStr = startDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });
      const startTime = startDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const endTime = endDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${dateStr}, ${startTime} - ${endTime}`;
    }

    return `${formatDateTime(start)} - ${formatDateTime(end)}`;
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Нет занятий для отображения</p>
      </div>
    );
  }

  const shouldShowSemesterHeader = (index: number, currentSession: Session) => {
    if (index === 0) {
      const sessionDate = new Date(currentSession.date_start);
      if (sessionDate.getMonth() === 1 && sessionDate.getDate() === 5) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <>
          {shouldShowSemesterHeader(index, session) && (
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4 pt-2">Второй семестр</h3>
          )}
          <div
            key={session.id}
            className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 hover:shadow-md transition-shadow"
          >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs w-fit font-medium ${
                  session.type === 'theory'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {session.type === 'theory' ? 'Теория' : 'Практика'}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDateRange(session.date_start, session.date_end, session.type)}</span>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit?.(session)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Изменить
                </button>
                <button
                  onClick={() => onDelete?.(session.id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Удалить
                </button>
              </div>
            )}
          </div>

          <h3 className="text-base md:text-sm font-semibold text-gray-900 mb-2">
            {session.title}
          </h3>

          {session.teachers && (
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700">{session.teachers}</p>
            </div>
          )}

          {session.folder_link && (
            <a
              href={session.folder_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline mb-2"
            >
              <ExternalLink className="w-4 h-4" />
              Ссылка на материалы
            </a>
          )}

          {session.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Примечания:</span> {parseLinksInText(session.notes)}
              </p>
            </div>
          )}
          </div>
        </>
      ))}
    </div>
  );
}
