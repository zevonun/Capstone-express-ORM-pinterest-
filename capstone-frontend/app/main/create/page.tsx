'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../../lib/axios';

export default function CreateImagePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: '',
    });
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
    const [uploading, setUploading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'url') setPreview(e.target.value);
    };

    // Upload file lên server
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview local
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);

        // Upload lên backend
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await axiosInstance.post('/images/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormData((prev) => ({ ...prev, url: res.data.url }));
        } catch (err) {
            setError('Upload ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name.trim() || !formData.url.trim()) {
            setError('Vui lòng nhập tên và ảnh');
            return;
        }
        setLoading(true);
        try {
            const res = await axiosInstance.post('/images', {
                name: formData.name.trim(),
                url: formData.url.trim(),
                description: formData.description.trim() || undefined,
            });
            router.push(`/main/image/${res.data.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Tạo ảnh thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Tạo ảnh mới</h1>

            <div className="bg-white rounded-3xl shadow-md overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                {/* Left — Preview */}
                <div className="md:w-1/2 bg-gray-100 flex items-center justify-center min-h-[300px]">
                    {preview ? (
                        <img src={preview} alt="preview" className="w-full h-full object-cover max-h-[600px]" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 gap-3">
                            <div className="text-6xl">🖼️</div>
                            <p className="text-sm">Xem trước ảnh</p>
                        </div>
                    )}
                </div>

                {/* Right — Form */}
                <div className="md:w-1/2 p-8 flex flex-col justify-between">

                    {/* Toggle URL / Upload */}
                    <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
                        <button
                            type="button"
                            onClick={() => setUploadMode('url')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${uploadMode === 'url' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                                }`}
                        >
                            🔗 Dán URL
                        </button>
                        <button
                            type="button"
                            onClick={() => setUploadMode('file')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${uploadMode === 'file' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                                }`}
                        >
                            📁 Upload file
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* URL hoặc File */}
                        {uploadMode === 'url' ? (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    URL ảnh <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Chọn ảnh từ máy <span className="text-red-500">*</span>
                                </label>
                                <label className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-400 flex flex-col items-center cursor-pointer hover:border-red-400 hover:text-red-400 transition">
                                    <span className="text-3xl mb-2">📁</span>
                                    {uploading ? 'Đang upload...' : 'Click để chọn ảnh (JPG, PNG, WEBP)'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                                {formData.url && (
                                    <p className="text-xs text-green-600 mt-1">✓ Upload thành công!</p>
                                )}
                            </div>
                        )}

                        {/* Tên ảnh */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Tên ảnh <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="VD: Hoàng hôn ở Đà Lạt"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                        </div>

                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Mô tả ngắn về ảnh này..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                            >
                                {loading ? 'Đang tạo...' : 'Đăng ảnh'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}