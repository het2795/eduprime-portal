import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, MapPin, Tag, CheckCircle2, Ticket, Sparkles } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegisterEvent = async (id) => {
    setBtnLoading(id);
    try {
      const res = await api.post(`/events/${id}/register`);
      alert(res.data.message || 'Successfully registered for event!');
      await fetchEvents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Event registration failed.');
    } finally {
      setBtnLoading(null);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filter === 'All') return true;
    if (filter === 'Registered') return e.registered;
    return e.category === filter;
  });

  const getEventBadge = (cat) => {
    return cat === 'Technical' ? (
      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/20">Technical</span>
    ) : (
      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-brand-purple/10 text-brand-purple border border-brand-purple/20">Cultural</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Category filter tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-navy-800 border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Registered', 'Cultural', 'Technical'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-heading transition-all ${
                filter === tab
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-700'
              }`}
            >
              {tab === 'All' ? 'All Events' : (tab === 'Registered' ? 'My Registrations' : tab)}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {filteredEvents.length} Event(s) listed
        </span>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 text-center flex flex-col items-center justify-center gap-3">
          <Calendar className="h-10 w-10 text-slate-400" />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white font-heading">No events found</p>
            <p className="text-xs text-slate-400">There are no events matching this category filter.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className={`bg-white dark:bg-navy-800 p-5 rounded-2xl border shadow-sm flex flex-col justify-between hover-lift ${
                event.registered ? 'border-brand-green/20' : 'border-slate-200/50 dark:border-navy-700/50'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-white font-heading line-clamp-1">{event.title}</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{getEventBadge(event.category)}</p>
                    </div>
                  </div>
                  {event.registered && (
                    <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Registered
                    </span>
                  )}
                </div>

                {/* Details layout */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="font-semibold font-mono text-[10.5px]">{new Date(event.date).toLocaleDateString()} at 10:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="font-semibold">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Ticket className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="font-semibold">
                      {event.price === 0 ? 'Free Entry' : `$${event.price}`} ·{' '}
                      <span className="text-brand-blue font-bold">{event.seats} Seats left</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-navy-700/40 flex justify-end">
                {event.registered ? (
                  <button
                    disabled
                    className="px-4 py-1.5 rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/20 text-[10px] font-bold font-heading"
                  >
                    Registered ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegisterEvent(event._id)}
                    disabled={btnLoading === event._id || event.seats <= 0}
                    className="px-4 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue/90 disabled:bg-slate-200 text-white text-[10px] font-bold font-heading tracking-wide shadow-md shadow-brand-blue/15 hover:translate-y-[-0.5px] active:translate-y-[0.5px]"
                  >
                    {btnLoading === event._id ? (
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : event.seats <= 0 ? (
                      'Sold Out'
                    ) : (
                      'Register Now →'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
