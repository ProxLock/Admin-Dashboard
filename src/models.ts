// Enum for SubscriptionPlans based on sample
export type SubscriptionPlans = 'free_user' | '10k_requests' | 'pro' | 'enterprise';

export interface KeyDTO {
    id: string;
    name: string;
    description: string;
    rateLimit?: number;
    whitelistedUrls?: string[];
    allowsWeb?: boolean;
}

export interface ProjectDTO {
    id: string;
    name: string;
    description: string;
    keys: KeyDTO[];
}

export interface PageMetadata {
    page: number;
    per: number;
    total: number;
    pageCount: number;
}

export interface UserDTO {
    id: string;
    projects?: ProjectDTO[];
    currentSubscription?: SubscriptionPlans;
    currentRequestUsage?: number;
    requestLimit?: number;
    justRegistered?: boolean;
    isAdmin?: boolean;
    // Helper fields that might come from older API versions or merge logic
    firstName?: string;
    lastName?: string;
    emailAddresses?: { emailAddress: string }[];
    imageUrl?: string;
    overrideRequestLimit?: number | null;
}

export interface PaginatedUsersDTO {
    metadata: PageMetadata;
    users: UserDTO[];
}

// Alias for easier refactoring
export type User = UserDTO;

