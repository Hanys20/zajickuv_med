export default function StoryBlock({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? 'mb-3 rounded-md border border-honey-50/15 bg-honey-50/10 p-4 last:mb-0'
          : 'mb-6 last:mb-0'
      }
    >
      <h3 className={`mb-2 text-base font-bold ${dark ? 'text-white' : ''}`}>{title}</h3>
      <p
        className={`max-w-[68ch] whitespace-pre-line text-[13.5px] leading-relaxed ${
          dark ? 'text-honey-50/70' : 'text-ink-dim'
        }`}
      >
        {children}
      </p>
    </div>
  );
}
