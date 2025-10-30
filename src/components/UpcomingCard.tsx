import { Calendar, ExternalLink, Users } from 'lucide-react';
import { Session } from '../lib/supabase';

type UpcomingCardProps = {
  session: Session | null;
  type: 'theory' | 'practical';
};

export function UpcomingCard({ session, type }: UpcomingCardProps) {
  const title = type === 'theory' ? 'Ближайшая лекция' : 'Ближайшая практика';
  const bgColor = type === 'theory' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
  const iconColor = type === 'theory' ? 'text-blue-600' : 'text-green-600';

  if (!session) {
    return (
      <div className={`${bgColor} border rounded-lg p-2 md:p-6`}>
        <h2 className="text-lg font-semibold mb-3 text-gray-800">{title}</h2>
        <p className="text-gray-500 text-sm">Нет запланированных занятий</p>
      </div>
    );
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateRange = () => {
    if (type === 'practical') {
      if (!session.date_end) {
        return formatDate(session.date_start);
      }
      return `${formatDate(session.date_start)} - ${formatDate(session.date_end)}`;
    }

    if (!session.date_end) {
      return formatDateTime(session.date_start);
    }
    const startDate = new Date(session.date_start);
    const endDate = new Date(session.date_end);

    if (startDate.toDateString() === endDate.toDateString()) {
      const dateStr = startDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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

    return `${formatDateTime(session.date_start)} - ${formatDateTime(session.date_end)}`;
  };

  return (
    <div className={`${bgColor} border rounded-lg p-4 md:p-6 transition-shadow hover:shadow-md`}>
      <h2 className="text-lg font-semibold mb-2 text-gray-800">{title}</h2>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className={`${iconColor} w-3 h-3 mt-0.3 flex-shrink-0`} />
          <div>
            <p className="text-xs font-medium text-gray-700">{formatDateRange()}</p>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900">{session.title}</h3>
        </div>

        {session.teachers && (
          <div className="flex items-center gap-2">
            <Users className={`${iconColor} w-3 h-3 mt-0.5 flex-shrink-0`} />
            <p className="text-sm text-gray-700">{session.teachers}</p>
          </div>
        )}

        {session.folder_link && (
          <a
            href={session.folder_link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-sm font-medium ${iconColor} hover:underline`}
          >
            <ExternalLink className="w-4 h-4" />
            Материалы занятия
          </a>
        )}
      </div>
    </div>
  );
}
