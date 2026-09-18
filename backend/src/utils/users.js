export const USER_DIRECTORY = {
  user_001: {
    name: "Matheus Ferrero",
    avatar: "https://i.pravatar.cc/150?u=user_001",
  },
  user_002: {
    name: "Floyd Miles",
    avatar: "https://i.pravatar.cc/150?u=user_002",
  },
  user_003: {
    name: "Jerome Bell",
    avatar: "https://i.pravatar.cc/150?u=user_003",
  },
  user_004: {
    name: "Ralph Edwards",
    avatar: "https://i.pravatar.cc/150?u=user_004",
  },
};

export function enrichUser(userId, profile) {
  const meta = USER_DIRECTORY[userId] || {
    name: userId,
    avatar: profile || `https://i.pravatar.cc/150?u=${userId}`,
  };
  return meta;
}
