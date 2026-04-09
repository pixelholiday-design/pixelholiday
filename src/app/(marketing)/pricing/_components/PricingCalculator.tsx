"use client";

import { useState } from "react";
import { Zap, ShoppingBag, MapPin } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PricingCalculator() {
  const [digitalSales, setDigitalSales] = useState(2000);
  const [printSales, setPrintSales] = useState(800);
  const [marketplaceBookings, setMarketplaceBookings] = useState(400);

  // Calculations
  const digitalFee = digitalSales * 0.02;
  const digitalKeep = digitalSales - digitalFee;

  // Print: assume ~40% is lab cost, commission on markup portion
  const printLabCost = printSales * 0.35;
  const printMarkup = printSales - printLabCost;
  const printFee = printMarkup * 0.1; // approximate commission on markup
  const printKeep = printSales - printLabCost - printFee;

  const marketplaceFee = marketplaceBookings * 0.1;
  const marketplaceKeep = marketplaceBookings - marketplaceFee;

  const totalRevenue = digitalSales + printSales + marketplaceBookings;
  const totalFees = digitalFee + printFee + marketplaceFee;
  const totalKeep = digitalKeep + printKeep + marketplaceKeep;
  const effectiveRate = totalRevenue > 0 ? (totalFees / totalRevenue) * 100 : 0;

  return (
    <div className="rounded-2xl border-2 border-navy-100 bg-white p-6 md:p-8 shadow-sm">
      {/* Sliders */}
      <div className="space-y-8 mb-10">
        {/* Digital sales slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-navy-900">
                Monthly digital sales
              </span>
            </div>
            <span className="text-lg font-display font-bold text-navy-900">
              {formatCurrency(digitalSales)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10000}
            step={100}
            value={digitalSales}
            onChange={(e) => setDigitalSales(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-navy-100 accent-brand-400 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-navy-400 mt-1">
            <span>{formatCurrency(0)}</span>
            <span>{formatCurrency(10000)}</span>
          </div>
        </div>

        {/* Print sales slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-coral-500" />
              <span className="text-sm font-semibold text-navy-900">
                Monthly print &amp; product sales
              </span>
            </div>
            <span className="text-lg font-display font-bold text-navy-900">
              {formatCurrency(printSales)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={printSales}
            onChange={(e) => setPrintSales(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-navy-100 accent-coral-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-navy-400 mt-1">
            <span>{formatCurrency(0)}</span>
            <span>{formatCurrency(5000)}</span>
          </div>
        </div>

        {/* Marketplace bookings slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-600" />
              <span className="text-sm font-semibold text-navy-900">
                Monthly marketplace bookings
              </span>
            </div>
            <span className="text-lg font-display font-bold text-navy-900">
              {formatCurrency(marketplaceBookings)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={marketplaceBookings}
            onChange={(e) => setMarketplaceBookings(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-navy-100 accent-gold-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-navy-400 mt-1">
            <span>{formatCurrency(0)}</span>
            <span>{formatCurrency(5000)}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-navy-100 mb-8" />

      {/* Results */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">
            Total monthly revenue
          </p>
          <p className="text-2xl font-display font-bold text-navy-900">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">
            Fotiqo fee
          </p>
          <p className="text-2xl font-display font-bold text-coral-500">
            {formatCurrency(totalFees)}
          </p>
          <p className="text-xs text-navy-400 mt-0.5">
            {effectiveRate.toFixed(1)}% effective rate
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">
            You keep
          </p>
          <p className="text-2xl font-display font-bold text-green-600">
            {formatCurrency(totalKeep)}
          </p>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="rounded-xl bg-cream-100 p-5">
        <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-3">
          Breakdown
        </p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-navy-600">Digital sales ({formatCurrency(digitalSales)})</span>
            <div className="flex items-center gap-4">
              <span className="text-navy-400">Fee: {formatCurrency(digitalFee)}</span>
              <span className="font-semibold text-navy-900">
                Keep: {formatCurrency(digitalKeep)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-navy-600">Print sales ({formatCurrency(printSales)})</span>
            <div className="flex items-center gap-4">
              <span className="text-navy-400">Fee: {formatCurrency(printFee)}</span>
              <span className="font-semibold text-navy-900">
                Keep: {formatCurrency(printKeep)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-navy-600">Marketplace ({formatCurrency(marketplaceBookings)})</span>
            <div className="flex items-center gap-4">
              <span className="text-navy-400">Fee: {formatCurrency(marketplaceFee)}</span>
              <span className="font-semibold text-navy-900">
                Keep: {formatCurrency(marketplaceKeep)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compare note */}
      <p className="text-center text-xs text-navy-400 mt-5">
        On other platforms, you would also pay {formatCurrency(30)}&ndash;{formatCurrency(100)}/month
        in subscription fees on top of their commissions.
      </p>
    </div>
  );
}
