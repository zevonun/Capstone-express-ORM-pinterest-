export interface User {
    id: number;
    email: string;
    fullName?: string;
    avatar?: string;
    age?: number;
}

export interface Image {
    id: number;
    name: string;
    url: string;
    description?: string;
    createdAt: string;
    userId: number;
    user?: User;
}

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    userId: number;
    imageId: number;
    user?: User;
}