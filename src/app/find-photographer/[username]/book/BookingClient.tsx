"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Users,
  MessageSquare,
  CreditCard,
  Loader2,
  Camera,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Service {
  id: string;
  name: string;
  description: string | null;
  startingAt: number | null;
  currency: string;
  duration: string | null;
  sortOrder: number;
}

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Profile {
  id: string;
  username: string;
  businessName: string | null;
  profilePhotoUrl: string | null;
  city: string | null;
  country: string | null;
  user: { id: string; name: string };
  services: Service[];
  availability: Availability[];
}

interface BookingClientProps {
  profile: Profile;
  preselectedServiceId?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Graduation",
  "Corporate",
  "Family Reunion",
  "Other",
];

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/** Generate 1-hour time slots between startTime and endTime (e.g. "09:00"-"17:00") */
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh] = endTime.split(":").map(Number);
  for (let h = sh; h < eh; h++) {
    slots.push(`${String(h).padStart(2, "0")}:${String(sm).padStart(2, "0")}`);
  }
  return slots;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                     */
/* ------------------------------------------------------------------ */

const STEP_LABELS = ["Service", "Date & Time", "Your Details", "Review", "Payment"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8 md:mb-12">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < current;
        const isActive = step === current;
        return (
          <div key={label} className="flex flex-col items-center flex-1 relative">
            {/* Connector line */}
            {i > 0 && (
              <div
                className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                  step <= current ? "bg-green-500" : "bg-slate-200"
                }`}
                style={{ zIndex: 0 }}
              />
            )}
            {/* Circle */}
            <div
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : isActive
                    ? "bg-[#E8593C] text-white"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : step}
            </div>
            {/* Label */}
            <span
              className={`mt-2 text-xs font-medium hidden sm:block ${
                isActive
                  ? "text-[#E8593C]"
                  : isCompleted
                    ? "text-green-600"
                    : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function BookingClient({ profile, preselectedServiceId }: BookingClientProps) {
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    preselectedServiceId ?? null
  );

  // Step 2
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Step 3
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    occasion: "",
    groupSize: 1,
    specialRequests: "",
  });

  // Step 5
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    bookingId?: string;
    error?: string;
  } | null>(null);

  /* -- Derived values -- */

  const selectedService = profile.services.find((s) => s.id === selectedServiceId) ?? null;

  const availableDatesSet = useMemo(() => {
    const s = new Set<string>();
    profile.availability.forEach((a) => {
      s.add(new Date(a.date).toISOString().split("T")[0]);
    });
    return s;
  }, [profile.availability]);

  const timeSlotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    const avail = profile.availability.find((a) => {
      return new Date(a.date).toISOString().split("T")[0] === selectedDate;
    });
    if (!avail) return [];
    return generateTimeSlots(avail.startTime, avail.endTime);
  }, [selectedDate, profile.availability]);

  const totalPrice = selectedService?.startingAt ?? 0;
  const depositAmount = Math.round(totalPrice * 0.5 * 100) / 100;

  /* -- Navigation -- */

  function canContinue(): boolean {
    switch (step) {
      case 1:
        return !!selectedServiceId;
      case 2:
        return !!selectedDate && !!selectedTime;
      case 3:
        return formData.fullName.trim() !== "" && formData.email.trim() !== "";
      default:
        return true;
    }
  }

  function goNext() {
    if (canContinue() && step < 5) setStep(step + 1);
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  /* -- Submit booking -- */

  async function handleConfirmBooking() {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setStep(5);

    try {
      const durationMinutes = parseInt(selectedService.duration ?? "60", 10) || 60;

      const res = await fetch("/api/marketplace/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          photographerId: profile.user.id,
          serviceId: selectedService.id,
          sessionType: selectedService.name,
          sessionDate: selectedDate,
          sessionStartTime: selectedTime,
          sessionDuration: durationMinutes,
          sessionLocation: formData.location || null,
          occasion: formData.occasion || null,
          groupSize: formData.groupSize,
          specialRequests: formData.specialRequests || null,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone || null,
          totalPrice,
          depositAmount,
          currency: selectedService.currency,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBookingResult({ success: true, bookingId: data.bookingId ?? data.id });
      } else {
        setBookingResult({ success: false, error: data.error ?? "Something went wrong" });
      }
    } catch {
      setBookingResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Calendar                                                         */
  /* ---------------------------------------------------------------- */

  function renderCalendar() {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const cells: React.ReactNode[] = [];

    // Blank cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`blank-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isPast = dateObj < today;
      const isAvailable = availableDatesSet.has(dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = isSameDay(dateObj, today);

      let classes =
        "flex items-center justify-center h-10 w-10 mx-auto rounded-full text-sm font-medium transition-colors ";

      if (isSelected) {
        classes += "bg-[#E8593C] text-white";
      } else if (isAvailable && !isPast) {
        classes += "bg-sky-50 text-[#0C1829] hover:bg-sky-100 cursor-pointer";
      } else {
        classes += "text-slate-300 cursor-default";
      }

      if (isToday && !isSelected) {
        classes += " ring-2 ring-[#29ABE2]";
      }

      cells.push(
        <div
          key={day}
          className={classes}
          onClick={() => {
            if (isAvailable && !isPast) {
              setSelectedDate(dateStr);
              setSelectedTime(null);
            }
          }}
        >
          {day}
        </div>
      );
    }

    const canGoPrev = !(year === today.getFullYear() && month === today.getMonth());
    const canGoNext = true;

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (!canGoPrev) return;
              const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
              setCalendarMonth(prev);
            }}
            disabled={!canGoPrev}
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h3 className="text-lg font-semibold text-[#0C1829]">{monthLabel}</h3>
          <button
            onClick={() => {
              const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
              setCalendarMonth(next);
            }}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1">{cells}</div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render Steps                                                     */
  /* ---------------------------------------------------------------- */

  function renderStep1() {
    return (
      <div>
        <h2 className="text-2xl font-bold text-[#0C1829] mb-2">Select a Service</h2>
        <p className="text-slate-500 mb-6">Choose the type of session you'd like to book.</p>

        <div className="space-y-3">
          {profile.services.map((svc) => {
            const isSelected = selectedServiceId === svc.id;
            return (
              <button
                key={svc.id}
                onClick={() => setSelectedServiceId(svc.id)}
                className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#E8593C] bg-red-50/40"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#0C1829]">{svc.name}</h3>
                      {isSelected && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E8593C] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    {svc.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      {svc.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {svc.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  {svc.startingAt != null && (
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xs text-slate-400">Starting at</p>
                      <p className="text-lg font-bold text-[#0C1829]">
                        {formatCurrency(svc.startingAt, svc.currency)}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {profile.services.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Camera className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No services listed yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div>
        <h2 className="text-2xl font-bold text-[#0C1829] mb-2">Pick a Date & Time</h2>
        <p className="text-slate-500 mb-6">Available dates are highlighted below.</p>

        {renderCalendar()}

        {/* Time slots */}
        {selectedDate && (
          <div className="mt-6">
            <h3 className="font-semibold text-[#0C1829] mb-3">
              Available times for {formatDate(selectedDate)}
            </h3>
            {timeSlotsForDate.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {timeSlotsForDate.map((t) => {
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        isSelected
                          ? "bg-[#E8593C] text-white border-[#E8593C]"
                          : "bg-white text-[#0C1829] border-slate-200 hover:border-[#29ABE2]"
                      }`}
                    >
                      {formatTime(t)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No time slots available for this date.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderStep3() {
    function updateField(field: string, value: string | number) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    const inputClass =
      "w-full border border-slate-300 rounded-lg px-4 py-3 text-[#0C1829] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent transition-colors";

    return (
      <div>
        <h2 className="text-2xl font-bold text-[#0C1829] mb-2">Your Details</h2>
        <p className="text-slate-500 mb-6">Tell us a bit about yourself and your session.</p>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#0C1829] mb-1.5">
              <User className="w-4 h-4 text-slate-400" />
              Full Name <span className="text-[#E8593C]">*</span>
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#0C1829] mb-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              Email <span className="text-[#E8593C]">*</span>
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#0C1829] mb-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#0C1829] mb-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              Session Location / Address
            </label>
            <input
              type="text"
              placeholder="Park, studio, address..."
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Occasion + Group Size row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#0C1829] mb-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Occasion
              </label>
              <select
                value={formData.occasion}
                onChange={(e) => updateField("occasion", e.target.value)}
                className={inputClass}
              >
                <option value="">Select...</option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#0C1829] mb-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                Group Size
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={formData.groupSize}
                onChange={(e) => updateField("groupSize", parseInt(e.target.value, 10) || 1)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#0C1829] mb-1.5">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Special Requests
            </label>
            <textarea
              rows={3}
              placeholder="Anything the photographer should know..."
              value={formData.specialRequests}
              onChange={(e) => updateField("specialRequests", e.target.value)}
              className={inputClass + " resize-none"}
            />
          </div>
        </div>
      </div>
    );
  }

  function renderStep4() {
    const photographerName = profile.businessName || profile.user.name;
    const currency = selectedService?.currency ?? "EUR";

    return (
      <div>
        <h2 className="text-2xl font-bold text-[#0C1829] mb-2">Review Your Booking</h2>
        <p className="text-slate-500 mb-6">Please confirm the details below before paying.</p>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Photographer header */}
          <div className="flex items-center gap-4 p-5 border-b border-slate-100">
            {profile.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt={photographerName}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#29ABE2] to-[#E8593C] flex items-center justify-center text-white text-xl font-bold">
                {photographerName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-[#0C1829]">{photographerName}</p>
              {(profile.city || profile.country) && (
                <p className="text-sm text-slate-500">
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Service</span>
              <span className="font-medium text-[#0C1829]">{selectedService?.name}</span>
            </div>
            {selectedService?.duration && (
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium text-[#0C1829]">{selectedService.duration}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-[#0C1829]">
                {selectedDate ? formatDate(selectedDate) : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-medium text-[#0C1829]">
                {selectedTime ? formatTime(selectedTime) : "-"}
              </span>
            </div>
            {formData.location && (
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-[#0C1829]">{formData.location}</span>
              </div>
            )}
            {formData.occasion && (
              <div className="flex justify-between">
                <span className="text-slate-500">Occasion</span>
                <span className="font-medium text-[#0C1829]">{formData.occasion}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Group Size</span>
              <span className="font-medium text-[#0C1829]">{formData.groupSize}</span>
            </div>

            <hr className="border-slate-100" />

            <div className="flex justify-between">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-[#0C1829]">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-[#0C1829]">{formData.email}</span>
            </div>
            {formData.phone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Phone</span>
                <span className="font-medium text-[#0C1829]">{formData.phone}</span>
              </div>
            )}

            <hr className="border-slate-100" />

            <div className="flex justify-between text-base">
              <span className="text-slate-500">Total Price</span>
              <span className="font-bold text-[#0C1829]">{formatCurrency(totalPrice, currency)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-slate-500">Deposit Due Now (50%)</span>
              <span className="font-bold text-[#E8593C]">
                {formatCurrency(depositAmount, currency)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center">
          You'll pay the remaining balance after your session.
        </p>
      </div>
    );
  }

  function renderStep5() {
    if (isSubmitting) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#29ABE2] animate-spin mb-4" />
          <p className="text-lg font-medium text-[#0C1829]">Processing your booking...</p>
          <p className="text-sm text-slate-500 mt-1">Please don't close this page.</p>
        </div>
      );
    }

    if (bookingResult?.success) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0C1829] mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-1">Your session has been booked successfully.</p>
          {bookingResult.bookingId && (
            <p className="text-sm text-slate-400 mb-6">
              Booking Reference:{" "}
              <span className="font-mono font-medium text-[#0C1829]">
                {bookingResult.bookingId.slice(0, 12).toUpperCase()}
              </span>
            </p>
          )}
          <p className="text-sm text-slate-500 mb-8">
            You'll receive a confirmation email shortly at{" "}
            <span className="font-medium">{formData.email}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/find-photographer/${profile.username}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-200 text-sm font-medium text-[#0C1829] hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>
            <Link
              href="/find-photographer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#29ABE2] text-white text-sm font-medium hover:bg-[#29ABE2]/90 transition-colors"
            >
              Browse Photographers
            </Link>
          </div>
        </div>
      );
    }

    // Error state
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <span className="text-3xl">!</span>
        </div>
        <h2 className="text-2xl font-bold text-[#0C1829] mb-2">Something Went Wrong</h2>
        <p className="text-slate-500 mb-6">{bookingResult?.error ?? "Please try again."}</p>
        <button
          onClick={() => {
            setBookingResult(null);
            setStep(4);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#E8593C] text-white text-sm font-medium hover:bg-[#E8593C]/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back & Retry
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href={`/find-photographer/${profile.username}`}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-[#0C1829] truncate">
              Book {profile.businessName || profile.user.name}
            </h1>
            {(profile.city || profile.country) && (
              <p className="text-sm text-slate-500 truncate">
                {[profile.city, profile.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <StepIndicator current={step} />

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}

          {/* Navigation buttons */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              {step > 1 ? (
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-[#0C1829] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  onClick={goNext}
                  disabled={!canContinue()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E8593C] text-white text-sm font-semibold hover:bg-[#E8593C]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleConfirmBooking}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E8593C] text-white text-sm font-semibold hover:bg-[#E8593C]/90 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Confirm & Pay Deposit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
