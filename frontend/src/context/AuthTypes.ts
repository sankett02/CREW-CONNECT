export interface User {
    id: string;
    email: string;
    role: 'BRAND' | 'CREATOR' | 'WRITER' | 'EDITOR' | 'ADMIN';
    token: string;
    displayName?: string;
}

export interface AuthContextType {
    user: User | null;
    viewMode: 'BRAND' | 'CREATOR';
    login: (data: { user: Record<string, unknown>; token: string }) => void;
    updateUser: (updates: Partial<User>) => void;
    logout: () => void;
    toggleViewMode: () => void;
    loading: boolean;
}
