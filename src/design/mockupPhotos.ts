export const mockupPhotoUris = {
  profile: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
  bippi: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  mina: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  joon: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80",
  sam: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80",
  friendPreview: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=80",
} as const;

export const mockupBlinkFrameUris = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=320&q=80",
] as const;

export function getMockupFriendPhotoUri(name: string, index: number): string {
  const normalized = name.trim().toLowerCase();
  if (normalized.includes("mina") || normalized.includes("민아")) return mockupPhotoUris.mina;
  if (normalized.includes("joon") || normalized.includes("준")) return mockupPhotoUris.joon;
  if (normalized.includes("sam")) return mockupPhotoUris.sam;
  if (normalized.includes("bippi") || normalized.includes("비피")) return mockupPhotoUris.bippi;
  return [mockupPhotoUris.bippi, mockupPhotoUris.mina, mockupPhotoUris.joon, mockupPhotoUris.sam][index % 4];
}
