'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axiosInstance from '../../../lib/axios';
import { Image, Comment, User } from '../../../types';

export default function ImageDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [image, setImage] = useState<Image | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isSaved, setIsSaved] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingLoading, setSavingLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);

    const currentUser: User | null = (() => {
        try {
            return JSON.parse(Cookies.get('user') || 'null');
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [imageRes, commentRes] = await Promise.all([
                axiosInstance.get(`/images/${id}`),
                axiosInstance.get(`/images/${id}/comments`),
            ]);
            setImage(imageRes.data);
            setComments(commentRes.data);

            if (currentUser) {
                const savedRes = await axiosInstance.get(`/images/${id}/is-saved`);
                setIsSaved(savedRes.data.isSaved);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSave = async () => {
        if (!currentUser) return router.push('/auth/login');
        setSavingLoading(true);
        try {
            await axiosInstance.post(`/images/${id}/save`);
            setIsSaved((prev) => !prev);
        } catch (err) {
            console.error(err);
        } finally {
            setSavingLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return router.push('/auth/login');
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            const res = await axiosInstance.post(`/images/${id}/comments`, {
                content: newComment.trim(),
            });
            setComments((prev) => [res.data, ...prev]);
            setNewComment('');
        } catch (err) {
            console.error(err);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await axiosInstance.delete(`/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex gap-8 animate-pulse max-w-5xl mx-auto">
                <div className="w-1/2 bg-gray-200 rounded-2xl min-h-[500px]" />
                <div className="flex-1 space-y-4 pt-4">
                    <div className="h-8 bg-gray-200 rounded-xl w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-xl w-1/2" />
                    <div className="h-4 bg-gray-200 rounded-xl w-full" />
                </div>
            </div>
        );
    }

    if (!image) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="text-6xl mb-4">😕</div>
                <p className="text-lg font-semibold">Không tìm thấy ảnh</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                {/* Left — Ảnh */}
                <div className="md:w-1/2 bg-gray-100 flex items-center justify-center">
                    <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover max-h-[700px]"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                'https://placehold.co/400x500?text=No+Image';
                        }}
                    />
                </div>

                {/* Right — Thông tin */}
                <div className="md:w-1/2 flex flex-col p-6 overflow-y-auto max-h-[700px]">

                    {/* Actions */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handleToggleSave}
                            disabled={savingLoading}
                            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition ${isSaved
                                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                } disabled:opacity-50`}
                        >
                            {savingLoading ? '...' : isSaved ? '✓ Đã lưu' : 'Lưu'}
                        </button>

                        {currentUser?.id === image.userId && (
                            <button
                                onClick={async () => {
                                    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;
                                    await axiosInstance.delete(`/images/${image.id}`);
                                    router.push('/main');
                                }}
                                className="px-4 py-2.5 rounded-full text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                            >
                                🗑 Xóa ảnh
                            </button>
                        )}
                    </div>

                    {/* Tên ảnh */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{image.name}</h1>

                    {/* Mô tả */}
                    {image.description && (
                        <p className="text-gray-500 text-sm mb-4">{image.description}</p>
                    )}

                    {/* Người tạo */}
                    {image.user && (
                        <div
                            className="flex items-center gap-3 mb-6 cursor-pointer group"
                            onClick={() => router.push(`/main/profile/${image.user!.id}`)}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 group-hover:ring-2 ring-red-400 transition overflow-hidden">
                                {image.user.avatar ? (
                                    <img
                                        src={image.user.avatar}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    image.user.fullName?.charAt(0)?.toUpperCase() || '?'
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 group-hover:text-red-500 transition">
                                    {image.user.fullName || 'Ẩn danh'}
                                </p>
                                <p className="text-xs text-gray-400">{image.user.email}</p>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-100 mb-4" />

                    {/* Bình luận */}
                    <h2 className="font-bold text-gray-700 mb-3">Bình luận ({comments.length})</h2>

                    <div className="space-y-3 flex-1 overflow-y-auto mb-4">
                        {comments.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">
                                Chưa có bình luận nào. Hãy là người đầu tiên!
                            </p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                                        {comment.user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-semibold text-gray-700">
                                                {comment.user?.fullName || 'Ẩn danh'}
                                            </p>
                                            {currentUser?.id === comment.userId && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    Xóa
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-0.5">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Form comment */}
                    <form onSubmit={handleAddComment} className="flex gap-2 mt-auto">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0">
                            {currentUser?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Thêm bình luận..."
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                            <button
                                type="submit"
                                disabled={commentLoading || !newComment.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 disabled:opacity-40 transition"
                            >
                                {commentLoading ? '...' : 'Gửi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}