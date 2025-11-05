export type PremiumOperative = {
  name: string;
  email: string;
};

export const PREMIUM_OPERATIVES: PremiumOperative[] = [
  {
    name: "Avery Collins",
    email: "avery.collins@glitchhq.io",
  },
  {
    name: "Prince Raj",
    email: "princerajgrke1901@gmail.com",
  },
  {
    name: "Morgan Reyes",
    email: "morgan.reyes@glitchhq.io",
  },
  {
    name: "Jordan Bennett",
    email: "jordan.bennett@glitchhq.io",
  },
  {
    name: "Rowan Patel",
    email: "rowan.patel@glitchhq.io",
  },
  {
    name: "Taylor Monroe",
    email: "taylor.monroe@glitchhq.io",
  },
];

export function isPremiumEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return PREMIUM_OPERATIVES.some(
    (operative) => operative.email.trim().toLowerCase() === normalized
  );
}
