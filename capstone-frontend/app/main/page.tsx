'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ImageCard from '../components/ImageCard';
import axiosInstance from '../lib/axios';
import { Image } from '../types';

export default function HomePage() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name') || '';
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchImages();
    }, [name]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const endpoint = name
                ? `/images/search?name=${encodeURIComponent(name)}`
                : '/images';
            const res = await axiosInstance.get(endpoint);
            setImages(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            {name ? (
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Kết quả tìm kiếm:{' '}
                        <span className="text-red-500">"{name}"</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {images.length} kết quả
                    </p>
                </div>
            ) : (
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Khám phá ý tưởng
                    </h2>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="mb-4 rounded-2xl bg-gray-200 animate-pulse"
                            style={{ height: `${(i % 3 === 0 ? 300 : i % 3 === 1 ? 200 : 250)}px` }}
                        />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-lg font-semibold">Không tìm thấy ảnh nào</p>
                    <p className="text-sm mt-1">Hãy thử tìm kiếm từ khóa khác</p>
                </div>
            )}

            {/* Masonry grid */}
            {!loading && images.length > 0 && (
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="mb-4 break-inside-avoid">
                            <ImageCard image={image} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}