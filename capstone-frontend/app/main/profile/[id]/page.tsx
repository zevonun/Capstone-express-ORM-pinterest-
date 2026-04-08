'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axiosInstance from '@/app/lib/axios';
import ImageCard from '@/app/components/ImageCard';
import { Image, User } from '../../types';

type Tab = 'created' | 'saved';

export default function ProfilePage() {
    const { id } = useParams();
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [createdImages, setCreatedImages] = useState<Image[]>([]);
    const [savedImages, setSavedImages] = useState<Image[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('created');
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: '',
        avatar: '',
        age: '',
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const currentUser: User | null = (() => {
        try {
            return JSON.parse(Cookies.get('user') || 'null');
        } catch {
            return null;
        }
    })();

    const isOwner = currentUser?.id === Number(id);

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [userRes, createdRes, savedRes] = await Promise.all([
                axiosInstance.get(`/users/${id}`),
                axiosInstance.get(`/users/${id}/created-images`),
                axiosInstance.get(`/users/${id}/saved-images`),
            ]);
            setUser(userRes.data);
            setCreatedImages(createdRes.data);
            setSavedImages(savedRes.data.map((s: any) => s.image));
            setEditForm({
                fullName: userRes.data.fullName || '',
                avatar: userRes.data.avatar || '',
                age: userRes.data.age?.toString() || '',
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError('');
        setEditLoading(true);
        try {
            const res = await axiosInstance.put(`/users/${id}`, {
                fullName: editForm.fullName || undefined,
                avatar: editForm.avatar || undefined,
                age: editForm.age ? Number(editForm.age) : undefined,
            });
            setUser(res.data);
            Cookies.set('user', JSON.stringify({ ...currentUser, ...res.data }), {
                expires: 7,
            });
            setIsEditing(false);
        } catch (err: any) {
            setEditError(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setEditLoading(false);
        }
    };

    const displayImages = activeTab === 'created' ? createdImages : savedImages;

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200" />
                    <div className="space-y-2 text-center">
                        <div className="h-6 w-40 bg-gray-200 rounded-xl mx-auto" />
                        <div className="h-4 w-24 bg-gray-200 rounded-xl mx-auto" />
                    </div>
                </div>
                <div className="columns-2 md:columns-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="mb-4 rounded-2xl bg-gray-200"
                            style={{ height: `${i % 3 === 0 ? 300 : i % 3 === 1 ? 200 : 250}px` }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="text-6xl mb-4">😕</div>
                <p className="text-lg font-semibold">Không tìm thấy người dùng</p>
            </div>
        );
    }

    return (
        <div>
            {/* Profile header */}
            <div className="flex flex-col items-center text-center mb-8">

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 mb-4 overflow-hidden ring-4 ring-white shadow-md">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        user.fullName?.charAt(0)?.toUpperCase() || '?'
                    )}
                </div>

                {/* Tên */}
                <h1 className="text-2xl font-bold text-gray-800">
                    {user.fullName || 'Người dùng'}
                </h1>
                <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                {user.age && (
                    <p className="text-gray-400 text-sm">{user.age} tuổi</p>
                )}

                {/* Thống kê */}
                <div className="flex gap-6 mt-4">
                    <div className="text-center">
                        <p className="font-bold text-gray-800">{createdImages.length}</p>
                        <p className="text-xs text-gray-400">Ảnh đã tạo</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-gray-800">{savedImages.length}</p>
                        <p className="text-xs text-gray-400">Ảnh đã lưu</p>
                    </div>
                </div>

                {/* Nút chỉnh sửa */}
                {isOwner && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-5 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                    >
                        ✏️ Chỉnh sửa hồ sơ
                    </button>
                )}
            </div>

            {/* Modal chỉnh sửa */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Chỉnh sửa hồ sơ
                        </h2>

                        {editError && (
                            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                                {editError}
                            </div>
                        )}

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                    placeholder="Nguyen Van A"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    URL Avatar
                                </label>
                                <input
                                    type="text"
                                    value={editForm.avatar}
                                    onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                                {editForm.avatar && (
                                    <img
                                        src={editForm.avatar}
                                        alt="preview"
                                        className="w-14 h-14 rounded-full object-cover mt-2 border"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Tuổi
                                </label>
                                <input
                                    type="number"
                                    value={editForm.age}
                                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                                    placeholder="22"
                                    min={1}
                                    max={100}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                                >
                                    {editLoading ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('created')}
                    className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'created'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Đã tạo ({createdImages.length})
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'saved'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Đã lưu ({savedImages.length})
                </button>
            </div>

            {/* Grid ảnh */}
            {displayImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <div className="text-5xl mb-3">🖼️</div>
                    <p className="text-sm font-semibold">
                        {activeTab === 'created'
                            ? 'Chưa có ảnh nào được tạo'
                            : 'Chưa có ảnh nào được lưu'}
                    </p>
                    {activeTab === 'created' && isOwner && (
                        <button
                            onClick={() => router.push('/main/create')}
                            className="mt-4 px-5 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition"
                        >
                            Tạo ảnh đầu tiên
                        </button>
                    )}
                </div>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                    {displayImages.map((image) => (
                        <div key={image.id} className="mb-4 break-inside-avoid">
                            <ImageCard image={image} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}