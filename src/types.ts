export type Item = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  ownerId: string;
  isGroup: boolean;
  needsRestock: boolean;
};

export type Group = {
  id: string;
  name: string;
  members: string[];
};

export type UserProfile = {
  email: string;
  activeGroupId?: string;
};
