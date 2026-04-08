'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera, QrCode, KeyRound, ArrowLeft, X, ShoppingCart, Check, Heart, ChevronLeft, ChevronRight,
} from 'lucide-react';
import PhotoGrid, { type KioskPhoto } from '@/components/kiosk/PhotoGrid';
import ProductPicker, { type Product } from '@/components/kiosk/ProductPicker';
import ConnectionStatus from '@/components/kiosk/ConnectionStatus';

type Step = 'attract' | 'identify' | 'browse' | 'checkout' | 'thankyou';
type Lang = 'en' | 'fr' | 'ar' | 'de';

const LANGS: { code: Lang; flag: string }[] = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'ar', flag: '🇦🇪' },
  { code: 'de', flag: '🇩🇪' },
];

const MOCK_PHOTOS: KioskPhoto[] = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i}`,
  url: `https://picsum.photos/seed/pixel${i}/600/600`,
}));

const SLIDESHOW = [
  'https://picsum.photos/seed/resort1/1920/1080',
  'https://picsum.photos/seed/resort2/1920/1080',
  'https://picsum.photos/seed/resort3/1920/1080',
];

interface CartItem {
  photo: KioskPhoto;
  product: Product;
  quantity: number;
}

export default function GalleryKioskPage() {
  const [step, setStep] = useState<Step>('attract');
  const [lang, setLang] = useState<Lang>('en');
  const [photos, setPhotos] = useState<KioskPhoto[]>(MOCK_PHOTOS);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [slide, setSlide] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setStep('attract');
    setCart([]);
    setViewerIndex(null);
    setPhotos(MOCK_PHOTOS);
  }, []);

  // Idle reset (2 min)
  useEffect(() => {
    const bump = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (step !== 'attract') reset();
      }, 120000);
    };
    bump();
    window.addEventListener('touchstart', bump);
    window.addEventListener('mousedown', bump);
    return () => {
      window.removeEventListener('touchstart', bump);
      window.removeEventListener('mousedown', bump);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [step, reset]);

  // Slideshow rotation
  useEffect(() => {
    if (step !== 'attract') return;
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDESHOW.length), 5000);
    return () => clearInterval(t);
  }, [step]);

  // Thank you countdown
  useEffect(() => {
    if (step !== 'thankyou') return;
    setCountdown(30);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          reset();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step, reset]);

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const toggleFavorite = (p: KioskPhoto) => {
    setPhotos((prev) => prev.map((x) => (x.id === p.id ? { ...x, favorite: !x.favorite } : x)));
  };

  const addToCart = (items: { product: Product; quantity: number }[]) => {
    if (viewerIndex === null) return;
    const photo = photos[viewerIndex];
    setCart((c) => [...c, ...items.map((i) => ({ photo, ...i }))]);
    setViewerIndex(null);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-900 text-white">
      {/* Top bar (not on attract) */}
      {step !== 'attract' && (
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-5">
          <button
            onClick={() => {
              if (step === 'browse') setStep('identify');
              else if (step === 'identify') setStep('attract');
              else if (step === 'checkout') setStep('browse');
            }}
            className="press flex items-center gap-2 px-5 py-3 rounded-full bg-[#1A1F2E] border border-[#2A3042]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-[#1A1F2E] border border-[#2A3042] rounded-full p-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`press w-10 h-10 rounded-full text-xl flex items-center justify-center ${
                    lang === l.code ? 'bg-coral-500' : ''
                  }`}
                >
                  {l.flag}
                </button>
              ))}
            </div>
            <ConnectionStatus />
          </div>
        </div>
      )}

      {/* STEP 1 — ATTRACT */}
      {step === 'attract' && (
        <button
          onClick={() => setStep('identify')}
          className="absolute inset-0 cursor-pointer overflow-hidden"
        >
          {SLIDESHOW.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                i === slide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-transparent to-navy-900/90" />

          <div className="absolute top-10 left-0 right-0 text-center">
            <p className="font-display text-4xl text-gold-500 tracking-widest">PIXELHOLIDAY</p>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="anim-pulse-ring rounded-full p-10 bg-coral-500/20 mb-6">
              <Camera className="w-20 h-20 text-white" />
            </div>
            <h1 className="font-display text-6xl md:text-7xl font-semibold mb-4 text-center px-8">
              Touch to find your photos
            </h1>
            <p className="text-2xl text-slate-300">Your holiday memories await</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-navy-900/80 py-3 overflow-hidden">
            <div className="ticker-track text-gold-500 text-lg">
              ⭐ Welcome to PixelHoliday — Resort photography by professionals — Find your photos in seconds — Print, download, share — ⭐
            </div>
          </div>
        </button>
      )}

      {/* STEP 2 — IDENTIFY */}
      {step === 'identify' && (
        <div className="absolute inset-0 flex items-start justify-center p-8 pt-32 overflow-y-auto anim-fade-up">
          <div className="max-w-5xl w-full">
            <h2 className="font-display text-5xl text-center mb-3">How shall we find you?</h2>
            <p className="text-xl text-slate-400 text-center mb-12">Choose your preferred method</p>

            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: QrCode,   title: 'QR Wristband', desc: 'Scan your waterproof band', color: 'coral' },
                { icon: Camera,   title: 'Take a Selfie', desc: 'AI face recognition',     color: 'gold'  },
                { icon: KeyRound, title: 'Room Number',   desc: 'Enter your room',         color: 'navy'  },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    onClick={() => setStep('browse')}
                    className="press bg-[#1A1F2E] border border-[#2A3042] rounded-2xl p-10 flex flex-col items-center gap-6 hover:border-coral-500 transition-all"
                  >
                    <div className={`w-24 h-24 rounded-full bg-${card.color}-500/20 flex items-center justify-center`}>
                      <Icon className={`w-12 h-12 text-${card.color}-500`} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-display text-3xl mb-2">{card.title}</h3>
                      <p className="text-slate-400">{card.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 — BROWSE */}
      {step === 'browse' && (
        <div className="absolute inset-0 flex flex-col pt-20">
          <div className="px-6 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl">Your Gallery</h2>
              <p className="text-slate-400">{photos.length} photos · {photos.filter((p) => p.favorite).length} favorited</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-32">
            <PhotoGrid
              photos={photos}
              onPhotoTap={(p) => setViewerIndex(photos.findIndex((x) => x.id === p.id))}
              onFavorite={toggleFavorite}
              showWatermark
            />
          </div>

          {/* Floating cart */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-navy-900 to-transparent">
            <button
              onClick={() => cart.length > 0 && setStep('checkout')}
              className="press w-full bg-coral-500 disabled:bg-slate-700 text-white rounded-2xl px-6 py-5 flex items-center justify-between shadow-lift"
              disabled={cart.length === 0}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <span className="text-xl font-semibold">{cart.length} items in cart</span>
              </div>
              <span className="text-2xl font-bold">€{cartTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* PHOTO VIEWER */}
      {viewerIndex !== null && photos[viewerIndex] && (
        <div className="absolute inset-0 z-40 bg-navy-900 anim-fade-up flex flex-col">
          <div className="flex justify-between items-center p-4">
            <button onClick={() => setViewerIndex(null)} className="press p-3 rounded-full bg-[#1A1F2E]">
              <X className="w-6 h-6" />
            </button>
            <span className="text-slate-400">{viewerIndex + 1} / {photos.length}</span>
            <button
              onClick={() => toggleFavorite(photos[viewerIndex])}
              className="press p-3 rounded-full bg-[#1A1F2E]"
            >
              <Heart className={`w-6 h-6 ${photos[viewerIndex].favorite ? 'fill-coral-500 text-coral-500' : ''}`} />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => setViewerIndex((i) => (i! > 0 ? i! - 1 : photos.length - 1))}
                className="press absolute left-0 z-10 p-3 rounded-full bg-[#1A1F2E]/80"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[viewerIndex].url}
                alt=""
                className="max-h-[70vh] rounded-xl object-contain"
              />
              <button
                onClick={() => setViewerIndex((i) => (i! < photos.length - 1 ? i! + 1 : 0))}
                className="press absolute right-0 z-10 p-3 rounded-full bg-[#1A1F2E]/80"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <ProductPicker onAddToCart={addToCart} />
          </div>
        </div>
      )}

      {/* STEP 4 — CHECKOUT */}
      {step === 'checkout' && (
        <div className="absolute inset-0 pt-24 px-8 anim-fade-up overflow-y-auto">
          <h2 className="font-display text-5xl mb-6">Your Cart</h2>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item, i) => (
                <div key={i} className="bg-[#1A1F2E] border border-[#2A3042] rounded-xl p-4 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.photo.url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{item.product.name}</p>
                    <p className="text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-2xl font-bold text-gold-500">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#1A1F2E] border border-[#2A3042] rounded-2xl p-6 h-fit space-y-4">
              <div className="flex justify-between text-xl">
                <span className="text-slate-400">Subtotal</span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-3xl font-bold border-t border-[#2A3042] pt-4">
                <span>Total</span>
                <span className="text-gold-500">€{cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setStep('thankyou')}
                className="press w-full bg-coral-500 text-white text-xl font-semibold py-5 rounded-xl"
              >
                Pay Now
              </button>
              <button
                onClick={() => setStep('thankyou')}
                className="press w-full bg-[#2A3042] text-white text-xl font-semibold py-5 rounded-xl"
              >
                Order at Counter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5 — THANK YOU */}
      {step === 'thankyou' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center anim-fade-up px-8">
          <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center mb-8 anim-pulse-ring">
            <Check className="w-16 h-16 text-white" />
          </div>
          <h2 className="font-display text-6xl mb-3 text-center">Thank you!</h2>
          <p className="text-2xl text-slate-300 mb-8 text-center">Your photos are on their way</p>

          <div className="bg-white p-6 rounded-2xl mb-8">
            <svg width="160" height="160" viewBox="0 0 80 80">
              <rect width="80" height="80" fill="white" />
              {Array.from({ length: 64 }).map((_, i) => {
                const x = (i % 8) * 10;
                const y = Math.floor(i / 8) * 10;
                const fill = (i * 13 + 5) % 3 === 0;
                return fill ? <rect key={i} x={x} y={y} width="10" height="10" fill="black" /> : null;
              })}
            </svg>
          </div>

          <p className="text-slate-400 mb-4">Scan to download on your phone</p>

          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="36" stroke="#2A3042" strokeWidth="6" fill="none" />
              <circle
                cx="40" cy="40" r="36" stroke="#E8593C" strokeWidth="6" fill="none"
                strokeDasharray={`${(countdown / 30) * 226} 226`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
              {countdown}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
