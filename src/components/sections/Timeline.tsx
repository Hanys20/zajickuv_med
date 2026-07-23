const STEPS = [
  { when: '19. století · Volyň', what: 'Začátky rodinného včelaření' },
  { when: 'Po 2. sv. válce', what: 'Návrat rodiny do Československa' },
  { when: '30. narozeniny', what: 'První vlastní včelstvo' },
  { when: 'Současnost', what: 'Rodinná farma, ~40 včelstev' },
];

export default function Timeline() {
  return (
    <div className="relative">
      <div className="absolute bottom-1 left-[7px] top-1 w-px bg-honey-200" />
      <div className="relative flex flex-col gap-5">
        {STEPS.map((step) => (
          <div key={step.when} className="flex items-start gap-3">
            <span className="relative z-10 mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-paper bg-honey-500" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-honey-600">{step.when}</div>
              <div className="mt-1 text-[13.5px] font-bold">{step.what}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
