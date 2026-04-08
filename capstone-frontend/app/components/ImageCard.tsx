'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image } from '../types';

interface Props {
    image: Image;
}

export default function ImageCard({ image }: Props) {
    const router = useRouter();
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => router.push(`/main/image/${image.id}`)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Ảnh */}
            <img
                src={image.url}
                alt={image.name}
                className="w-full object-cover rounded-2xl"
                onError={(e) => {
                    (e.target as HTMLImageElement).src =
                        'https://placehold.co/300x400?text=No+Image';
                }}
            />

            {/* Overlay khi hover */}
            {hovered && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col justify-between p-3 transition">
                    {/* Tên ảnh */}
                    <p className="text-white font-semibold text-sm line-clamp-2">
                        {image.name}
                    </p>

                    {/* Người tạo */}
                    {image.user && (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700">
                                {image.user.fullName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="text-white text-xs">
                                {image.user.fullName || 'Ẩn danh'}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}