'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: { id?: string; url: string; isMain?: boolean }[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const sortedImages = [...images].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
  const [selectedImage, setSelectedImage] = useState(
    sortedImages[0]?.url || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'
  );

  return (
    <div className="space-y-4">
      {/* Main Image Display Box */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-dark-900 border border-dark-700 shadow-xl group flex items-center justify-center">
        <img
          src={selectedImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Thumbnails Carousel / Strip */}
      {sortedImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {sortedImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedImage(img.url)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden bg-dark-900 border-2 transition-all shrink-0 ${
                selectedImage === img.url
                  ? 'border-neon ring-2 ring-neon/40'
                  : 'border-dark-700 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
