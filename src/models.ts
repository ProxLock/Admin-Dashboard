export interface User {
    id: string;
    emailAddresses: { emailAddress: string }[];
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    createdAt: number;
    lastActiveAt?: number;
    publicMetadata?: {
        isAdmin?: boolean;
    };
    // Backend specific fields from /admin/users
    requestLimit?: number;
    currentRequestUsage?: number;
    overrideRequestLimit?: number | null;
}

export interface AdminUserResponse {
    users: User[];
    total: number;
}
