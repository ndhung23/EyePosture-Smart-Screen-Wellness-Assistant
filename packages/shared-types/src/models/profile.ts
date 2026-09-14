export interface Profile {
  id: string;
  userId?: string;
  name: string;
  avatarUrl?: string;
  isChild: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDto {
  name: string;
  avatarUrl?: string;
  isChild?: boolean;
}

export interface UpdateProfileDto {
  name?: string;
  avatarUrl?: string;
  isChild?: boolean;
}
