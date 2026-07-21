const STEPS = [
  { when: '19. století · Volyň', what: 'Začátky rodinného včelaření' },
  { when: 'Po 2. sv. válce', what: 'Návrat rodiny do Československa' },
  { when: '30. narozeniny', what: 'První vlastní včelstvo' },
  { when: 'Současnost', what: 'Rodinná farma, ~40 včelstev' },
];

export default function Timeline() {
  return (
    <div className="flex flex-col md:flex-row">
      {STEPS.map((step, i) => (
        <div
          key={step.when}
          className={`flex-1 pb-4 pr-0 md:pb-3.5 md:pr-3.5 ${
            i !== STEPS.length - 1
              ? 'mb-4 border-b border-dashed border-block-strong pb-4 md:mb-0 md:border-b-0 md:border-r md:pb-3.5'
              : ''
          }`}
        >
          <div className="mb-2.5 h-2.5 w-2.5 rounded-full bg-honey-500" />
          <div className="text-[11px] font-bold uppercase tracking-wide text-honey-600">
            {step.when}
          </div>
          <div className="mt-1 text-[13.5px] font-bold">{step.what}</div>
        </div>
      ))}
    </div>
  );
}
