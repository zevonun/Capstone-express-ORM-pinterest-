'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('name') || '');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = Cookies.get('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch {
                setUser(null);
            }
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/main?name=${encodeURIComponent(search.trim())}`);
        } else {
            router.push('/main');
        }
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        router.push('/auth/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-3">

                {/* Logo */}
                <Link href="/main" className="shrink-0">
                    <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-red-700 transition">
                        P
                    </div>
                </Link>

                {/* Home button */}
                <Link
                    href="/main"
                    className={`hidden md:flex shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${pathname === '/main'
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    Trang chủ
                </Link>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm ảnh..."
                            className="w-full bg-gray-100 rounded-full px-5 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                        >
                            🔍
                        </button>
                    </div>
                </form>

                {/* Right side */}
                <div className="flex items-center gap-2 shrink-0">

                    {user ? (
                        <>
                            {/* Tạo ảnh — chỉ hiện khi đã login */}
                            <Link
                                href="/main/create"
                                className="hidden md:block px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                            >
                                Tạo ảnh
                            </Link>

                            {/* Avatar + dropdown */}
                            <div className="relative group">
                                <button className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-red-400 transition">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-600 font-semibold text-sm">
                                            {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {user?.fullName || 'Người dùng'}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>

                                    <Link
                                        href={`/main/profile/${user?.id}`}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        👤 Trang cá nhân
                                    </Link>

                                    <Link
                                        href="/main/create"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition md:hidden"
                                    >
                                        ➕ Tạo ảnh
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                                    >
                                        🚪 Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Chưa login → hiện nút Đăng nhập
                        <div className="flex items-center gap-2">
                            <Link
                                href="/auth/login"
                                className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href="/auth/register"
                                className="px-4 py-2 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}