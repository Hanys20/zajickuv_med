export default function StoryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="mb-2 text-base font-bold">{title}</h3>
      <p className="max-w-[68ch] whitespace-pre-line text-[13.5px] leading-relaxed text-ink-dim">
        {children}
      </p>
    </div>
  );
}
