"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Clock,
  Plus,
  Minus,
  Check,
  Loader2,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";

/* ── Types ─────────────────────────────────────── */

interface AddOn {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  isDefault: boolean;
}

interface Package {
  id: string;
  name: string;
  slug: string;
  duration: number;
  deliveredPhotos: number;
  price: number;
  currency: string;
  maxGroupSize: number;
  minGroupSize: number;
  depositAmount: number | null;
  locationId: string | null;
  addOns: AddOn[];
}

interface Location {
  id: string;
  name: string;
  city: string | null;
}

interface TimeSlot {
  time: string;
  isGoldenHour: boolean;
  availablePhotographers: number;
  label?: string;
}

/* ── Helpers ───────────────────────────────────── */

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* ── Component ─────────────────────────────────── */

export default function BookingWidget({
  pkg,
  locations,
}: {
  pkg: Package;
  locations: Location[];
}) {
  // State
  const [selectedLocationId, setSelectedLocationId] = useState(pkg.locationId || "");
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [groupSize, setGroupSize] = useState(pkg.minGroupSize || 1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    pkg.addOns.filter((a) => a.isDefault).forEach((a) => defaults.add(a.id));
    return defaults;
  });

  // Customer info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Slots loading
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pricing
  const addOnsTotal = useMemo(() => {
    return pkg.addOns
      .filter((a) => selectedAddOns.has(a.id))
      .reduce((sum, a) => sum + a.price, 0);
  }, [pkg.addOns, selectedAddOns]);

  const totalPrice = pkg.price + addOnsTotal;

  // Fetch time slots when date changes
  const fetchSlots = useCallback(
    async (date: string) => {
      setLoadingSlots(true);
      setSlots([]);
      setSelectedTime(null);
      try {
        const params = new URLSearchParams({
          date,
          packageId: pkg.id,
        });
        if (selectedLocationId) params.set("locationId", selectedLocationId);

        const res = await fetch(`/api/booking/package-availability?${params}`);
        const data = await res.json();
        setSlots(data.slots || []);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [pkg.id, selectedLocationId],
  );

  function handleDateSelect(dateStr: string) {
    setSelectedDate(dateStr);
    fetchSlots(dateStr);
  }

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBookNow() {
    if (!selectedDate || !selectedTime || !name.trim() || !email.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/booking/create-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          sessionDate: selectedDate,
          sessionStartTime: selectedTime,
          groupSize,
          addOnIds: Array.from(selectedAddOns),
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || null,
          specialRequests: specialRequests.trim() || null,
          locationId: selectedLocationId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      // Redirect to Stripe
      if (data.stripeUrl) {
        window.location.href = data.stripeUrl;
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  // Calendar rendering
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);

  const daysInMonth = getDaysInMonth(calMonth.year, calMonth.month);
  const firstDay = getFirstDayOfWeek(calMonth.year, calMonth.month);

  function prevMonth() {
    setCalMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  }
  function nextMonth() {
    setCalMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  }

  const canGoPrev =
    calMonth.year > today.getFullYear() ||
    (calMonth.year === today.getFullYear() && calMonth.month > today.getMonth());

  const isReady = !!selectedDate && !!selectedTime;
  const canBook = isReady && name.trim() !== "" && email.trim() !== "";

  return (
    <div className="lg:sticky lg:top-24">
      <div className="card p-6 space-y-6">
        {/* Price header */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-sm text-navy-400">From</span>
            <span className="block text-3xl font-bold text-navy-900">
              {formatPrice(pkg.price, pkg.currency)}
            </span>
          </div>
          <span className="text-sm text-navy-400">{pkg.duration} min session</span>
        </div>

        <hr className="border-slate-100" />

        {/* Location selector (if package is not location-locked) */}
        {!pkg.locationId && locations.length > 0 && (
          <div>
            <label className="label-xs mb-1.5 block">Location</label>
            <select
              value={selectedLocationId}
              onChange={(e) => {
                setSelectedLocationId(e.target.value);
                setSelectedDate(null);
                setSelectedTime(null);
                setSlots([]);
              }}
              className="input w-full"
            >
              <option value="">Select a location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}{l.city ? ` \u2014 ${l.city}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Step 1: Calendar */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-semibold text-navy-900">1. Select Date</span>
          </div>

          {/* Calendar header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-navy-900">
              {MONTH_NAMES[calMonth.month]} {calMonth.year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-xs text-navy-400 font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(calMonth.year, calMonth.month, day);
              const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isPast = date < today;
              const isTooFar = date > maxDate;
              const isSelected = dateStr === selectedDate;
              const isDisabled = isPast || isTooFar;

              return (
                <button
                  key={day}
                  onClick={() => !isDisabled && handleDateSelect(dateStr)}
                  disabled={isDisabled}
                  className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-brand-400 text-white"
                      : isDisabled
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-navy-700 hover:bg-brand-400/10"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Time slots */}
        {selectedDate && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-brand-400" />
              <span className="text-sm font-semibold text-navy-900">2. Select Time</span>
            </div>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                <span className="ml-2 text-sm text-navy-400">Checking availability...</span>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-navy-400 py-3">
                No available slots on this date. Try another date.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      selectedTime === slot.time
                        ? "border-brand-400 bg-brand-400/5 ring-2 ring-brand-400/30"
                        : slot.isGoldenHour
                          ? "border-gold-500/40 bg-gold-500/5 hover:border-gold-500"
                          : "border-slate-200 hover:border-brand-400/50"
                    }`}
                  >
                    <span className="text-sm font-semibold text-navy-900 block">
                      {formatTime(slot.time)}
                    </span>
                    {slot.isGoldenHour && (
                      <span className="flex items-center gap-1 text-xs text-gold-500 mt-0.5">
                        <Sun className="h-3 w-3" /> Golden Hour
                      </span>
                    )}
                    {!slot.isGoldenHour && slot.label && (
                      <span className="text-xs text-navy-400 mt-0.5">{slot.label}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Group size */}
        {isReady && pkg.maxGroupSize > 1 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-navy-900">3. Group Size</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGroupSize((g) => Math.max(pkg.minGroupSize, g - 1))}
                disabled={groupSize <= pkg.minGroupSize}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-semibold text-navy-900 w-8 text-center">{groupSize}</span>
              <button
                onClick={() => setGroupSize((g) => Math.min(pkg.maxGroupSize, g + 1))}
                disabled={groupSize >= pkg.maxGroupSize}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30"
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-xs text-navy-400">Max {pkg.maxGroupSize} people</span>
            </div>
          </div>
        )}

        {/* Step 4: Add-ons */}
        {isReady && pkg.addOns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-navy-900">
                {pkg.maxGroupSize > 1 ? "4" : "3"}. Add-ons
              </span>
              <span className="text-xs text-navy-400">(optional)</span>
            </div>
            <div className="space-y-2">
              {pkg.addOns.map((addon) => (
                <label
                  key={addon.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedAddOns.has(addon.id)
                      ? "border-brand-400 bg-brand-400/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAddOns.has(addon.id)}
                    onChange={() => toggleAddOn(addon.id)}
                    className="mt-0.5 rounded border-slate-300 text-brand-400 focus:ring-brand-400"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-navy-900">{addon.name}</span>
                    {addon.description && (
                      <span className="text-xs text-navy-400 block mt-0.5">{addon.description}</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-navy-700 whitespace-nowrap">
                    +{formatPrice(addon.price, addon.currency)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price summary (always visible when ready) */}
        {isReady && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">{pkg.name}</span>
              <span className="text-navy-900 font-medium">{formatPrice(pkg.price, pkg.currency)}</span>
            </div>
            {addOnsTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-navy-600">
                  Add-ons ({selectedAddOns.size})
                </span>
                <span className="text-navy-900 font-medium">
                  +{formatPrice(addOnsTotal, pkg.currency)}
                </span>
              </div>
            )}
            <hr className="border-slate-200" />
            <div className="flex justify-between">
              <span className="font-semibold text-navy-900">Total</span>
              <span className="text-xl font-bold text-navy-900">
                {formatPrice(totalPrice, pkg.currency)}
              </span>
            </div>
          </div>
        )}

        {/* Customer info + Book button */}
        {isReady && !showCustomerForm && (
          <button
            onClick={() => setShowCustomerForm(true)}
            className="w-full py-3.5 rounded-xl bg-coral-500 text-white text-lg font-semibold hover:bg-coral-600 transition-colors"
          >
            Continue to Book \u2014 {formatPrice(totalPrice, pkg.currency)}
          </button>
        )}

        {showCustomerForm && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-navy-900">Your Details</span>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="Full name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <input
                  type="email"
                  placeholder="Email address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <input
                  type="tel"
                  placeholder="Phone / WhatsApp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-navy-400" />
                <textarea
                  placeholder="Special requests (optional)"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={2}
                  className="input w-full pl-10 resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleBookNow}
              disabled={!canBook || submitting}
              className="w-full py-3.5 rounded-xl bg-coral-500 text-white text-lg font-semibold hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                </>
              ) : (
                <>Pay {formatPrice(totalPrice, pkg.currency)}</>
              )}
            </button>
            <p className="text-xs text-navy-400 text-center">
              You&apos;ll be redirected to secure checkout powered by Stripe
            </p>
          </div>
        )}

        {/* Not ready prompt */}
        {!isReady && (
          <div className="text-center text-sm text-navy-400 py-2">
            {!selectedDate
              ? "Select a date to see available times"
              : "Select a time slot to continue"}
          </div>
        )}
      </div>
    </div>
  );
}
