const STEPS = [
  { when: '19. století · Volyň', what: 'Začátky rodinného včelaření' },
  { when: 'Po 2. sv. válce', what: 'Návrat rodiny do Československa' },
  { when: '30. narozeniny', what: 'První vlastní včelstvo' },
  { when: 'Současnost', what: 'Rodinná farma, ~40 včelstev' },
];

export default function Timeline() {
  const inset = `${100 / (STEPS.length * 2)}%`;

  return (
    <div className="relative">
      {/* Spojnice mezi tečkami - vodorovná na desktopu (inset na střed krajních
          teček), svislá na mobilu. */}
      <div className="absolute top-[7px] hidden h-px bg-honey-200 md:block" style={{ left: inset, right: inset }} />
      <div className="absolute bottom-1 left-[7px] top-1 w-px bg-honey-200 md:hidden" />

      <div className="relative flex flex-col gap-5 md:flex-row md:gap-0">
        {STEPS.map((step) => (
          <div
            key={step.when}
            className="flex items-start gap-3 md:flex-1 md:flex-col md:items-center md:gap-0 md:px-2 md:text-center"
          >
            <span className="relative z-10 mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-paper bg-honey-500 md:order-1 md:mb-3 md:mt-0" />
            <div className="md:order-2">
              <div className="text-[11px] font-bold uppercase tracking-wide text-honey-600">{step.when}</div>
              <div className="mt-1 text-[13.5px] font-bold">{step.what}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
