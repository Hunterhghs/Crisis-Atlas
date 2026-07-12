// Tiny colored circle indicator — Economist-style replacement for emoji icons
export function CrisisDot({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block flex-shrink-0 rounded-full"
      style={{ width: size, height: size, backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
