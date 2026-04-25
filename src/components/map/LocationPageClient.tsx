'use client';
import { MapPin, Clock, Navigation, ExternalLink, Phone } from 'lucide-react';
import { PickupMap } from './PickupMap';
import type { PickupLocation } from '@/types';

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

export function LocationPageClient({ locations }: { locations: PickupLocation[] }) {
  const loc = locations[0];
  if (!loc) return (
    <div className="pt-32 min-h-screen text-center text-obsidian-400">No pickup location configured.</div>
  );

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-obsidian-900 dark:bg-obsidian-950 pt-16 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-xs uppercase tracking-widest mb-2">Visit Us</p>
          <h1 className="font-display text-4xl font-semibold text-white mb-2">Pickup Location</h1>
          <p className="text-obsidian-400 text-sm">{loc.address}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Map */}
          <div className="lg:col-span-3 card overflow-hidden">
            <div className="h-96">
              <PickupMap location={loc} height="100%" />
            </div>
            <div className="p-4 flex gap-3">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 justify-center text-sm">
                <ExternalLink className="w-4 h-4" />
                Open in Google Maps
              </a>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 justify-center text-sm">
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </div>

          {/* Info panel */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-5">
              <h2 className="font-display text-lg font-semibold mb-4">{loc.name}</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-0.5">Address</p>
                    <p className="text-sm text-obsidian-500 dark:text-obsidian-400">{loc.address}</p>
                  </div>
                </div>
                {loc.notes && (
                  <div className="p-3 bg-gold-50 dark:bg-gold-900/10 border border-gold-200 dark:border-gold-800 rounded-xl text-sm text-obsidian-600 dark:text-obsidian-300">
                    📍 {loc.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gold-500" />
                <h2 className="font-display text-lg font-semibold">Opening Hours</h2>
              </div>
              <div className="space-y-2.5">
                {Object.entries(DAY_LABELS).map(([key, label]) => {
                  const hours = loc.openingHours?.[key];
                  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                  const isToday = today === key;
                  return (
                    <div
                      key={key}
                      className={`flex justify-between items-center text-sm py-1 ${isToday ? 'text-gold-600 dark:text-gold-400 font-semibold' : ''}`}
                    >
                      <span className={isToday ? '' : 'text-obsidian-500 dark:text-obsidian-400'}>{label}</span>
                      <span>{hours || 'Closed'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
