import React from 'react';
import { User, Monitor, Shield, CheckCircle } from 'lucide-react';

export default function StatusTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  const roleStyles = {
    applicant: 'bg-blue-500 shadow-blue-500/30',
    system: 'bg-purple-500 shadow-purple-500/30',
    officer: 'bg-teal-500 shadow-teal-500/30',
    committee: 'bg-emerald-500 shadow-emerald-500/30',
  };

  const RoleIcon = ({ role }) => {
    const icons = { applicant: User, system: Monitor, officer: Shield, committee: CheckCircle };
    const Icon = icons[role] || User;
    return <Icon className="w-3.5 h-3.5 text-white" />;
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timeline.map((event, eventIdx) => (
          <li key={eventIdx}>
            <div className="relative pb-8">
              {eventIdx !== timeline.length - 1 ? (
                <span className="absolute top-5 left-[15px] -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true" />
              ) : null}
              <div className="relative flex gap-3">
                <div className="shrink-0">
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center shadow-md ${roleStyles[event.role] || 'bg-gray-500 shadow-gray-500/30'}`}>
                    <RoleIcon role={event.role} />
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    <p className="text-sm text-gray-900 font-semibold leading-snug">
                      {event.action} <span className="font-normal text-gray-500">by {event.actor}</span>
                    </p>
                    <time dateTime={event.time} className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">{event.time}</time>
                  </div>
                  {event.details && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">{event.details}</p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
