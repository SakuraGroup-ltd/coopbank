// Minimal className merger. shadcn ships clsx + tailwind-merge; here we
// roll our own to avoid pulling in two more deps for a thin utility.
export function cn(...inputs: Array<string | undefined | null | false>): string {
  return inputs.filter(Boolean).join(" ");
}
