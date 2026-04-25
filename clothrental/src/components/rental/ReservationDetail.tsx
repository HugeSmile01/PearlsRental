'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, MapPin, Clock, Calendar, Package, Copy, ExternalLink, Navigation } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { PickupMap } from '@/components/map/PickupMap';
import type { Rental, PickupLocation } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Props {
  rental: Rental;
  location: PickupLocation | null;
}

export function ReservationDetail({ rental, location }: Props) {
  const product = rental.product;
  const image = product?.images?.[0];

  const copyId = () => {
    navigator.clipboard.writeText(rental.id);
    toast.success('Reservation ID copied');
  };

  const googleMapsUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
    : '#';

  const directionsUrl = location
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
    : '#';

  const days: Record<string, string> = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
    thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Success header */}
        <div className="text-center mb-10 animate-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Reservation Confirmed!</h1>
          <p className="text-obsidian-500 mb-4">Your item has been reserved. Please pick it up and pay in cash.</p>
          <button onClick={copyId} className="inline-flex items-center gap-2 text-xs text-obsidian-400 hover:text-gold-600 transition-colors">
            <Copy className="w-3.5 h-3.5" />
            ID: {rental.id}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left column */}
          <div className="md:col-span-3 space-y-5">

            {/* Item summary */}
            <div className="card p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Reserved Item</h2>
              <div className="flex gap-4">
                {image && (
                  <img src={image} alt={product?.name} className="w-20 h-24 object-cover rounded-xl shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gold-600 uppercase tracking-wide mb-1">{product?.category}</p>
                  <h3 className="font-display text-base font-semibold mb-1 leading-snug">{product?.name}</h3>
                  <p className="text-xs text-obsidian-400">{product?.size} · {product?.color}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn('badge text-xs', getStatusColor(rental.status))}>
                      {getStatusLabel(rental.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental details */}
            <div className="card p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Rental Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold-50 dark:bg-gold-900/20 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-xs text-obsidian-400 mb-0.5">Rental Period</p>
                    <p className="text-sm font-medium">{formatDate(rental.startDate)} → {formatDate(rental.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold-50 dark:bg-gold-900/20 rounded-lg flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-xs text-obsidian-400 mb-0.5">Total Amount (Cash on Pickup)</p>
                    <p className="font-display text-xl font-semibold text-gold-600">{formatCurrency(rental.totalPrice)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-obsidian-400 mb-0.5">Reservation Expires</p>
                    <p className="text-sm font-medium text-amber-600">{formatDate(rental.expiresAt)}</p>
                    <p className="text-xs text-obsidian-400">Pick up before this date to avoid cancellation</p>
                  </div>
                </div>
              </div>
              {rental.notes && (
                <div className="mt-4 pt-4 border-t border-obsidian-100 dark:border-obsidian-800">
                  <p className="text-xs text-obsidian-400 mb-1">Your Notes</p>
                  <p className="text-sm text-obsidian-600 dark:text-obsidian-300">{rental.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-primary flex-1 justify-center">
                View My Rentals
              </Link>
              <Link href="/catalog" className="btn-secondary flex-1 justify-center">
                Continue Browsing
              </Link>
            </div>
          </div>

          {/* Right column — pickup location */}
          <div className="md:col-span-2 space-y-5">
            {location && (
              <>
                {/* Map */}
                <div className="card overflow-hidden">
                  <div className="h-48">
                    <PickupMap location={location} />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="font-medium text-sm">{location.name}</p>
                      <div className="flex items-start gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gold-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-obsidian-500">{location.address}</p>
                      </div>
                    </div>
                    {location.notes && (
                      <p className="text-xs text-obsidian-400 bg-obsidian-50 dark:bg-obsidian-800 rounded-lg p-2.5">{location.notes}</p>
                    )}
                    <div className="flex gap-2">
                      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex-1 justify-center py-2">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Maps
                      </a>
                      <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs flex-1 justify-center py-2">
                        <Navigation className="w-3.5 h-3.5" />
                        Directions
                      </a>
                    </div>
                  </div>
                </div>

                {/* Opening hours */}
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gold-600" />
                    <h3 className="font-medium text-sm">Opening Hours</h3>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(days).map(([key, label]) => (
                      location.openingHours[key] && (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-obsidian-400">{label}</span>
                          <span className="font-medium">{location.openingHours[key]}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
