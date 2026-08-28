'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface VehicleImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface VehicleGalleryProps {
  name: string;
  vehicleType: string;
  isFeatured: boolean;
  status: string;
  images: VehicleImage[];
}

export default function VehicleGallery({
  name,
  vehicleType,
  isFeatured,
  status,
  images,
}: VehicleGalleryProps) {
  const defaultFallback =
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';

  const [activeImage, setActiveImage] = useState<string>(
    images.find((img) => img.isPrimary)?.imageUrl ||
      images[0]?.imageUrl ||
      defaultFallback
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Main Image Display */}
      <div className="relative h-72 sm:h-96 md:h-[420px] bg-slate-100">
        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-opacity duration-300"
          unoptimized
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
            {vehicleType}
          </span>
          {isFeatured && (
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>Featured Fleet</span>
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4">
          {status === 'AVAILABLE' ? (
            <Badge variant="success">Available for Booking</Badge>
          ) : (
            <Badge variant="warning">On Trip / Reserved</Badge>
          )}
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="p-4 grid grid-cols-4 sm:grid-cols-6 gap-3 border-t border-slate-100 bg-slate-50/70">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveImage(img.imageUrl)}
              className={`relative h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeImage === img.imageUrl
                  ? 'border-blue-600 ring-2 ring-blue-600/30'
                  : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img.imageUrl}
                alt="Thumbnail"
                fill
                sizes="100px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
