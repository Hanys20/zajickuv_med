const STEPS = [
  { when: '19. století · Volyň', what: 'Začátky rodinného včelaření' },
  { when: 'Po 2. sv. válce', what: 'Návrat rodiny do Československa' },
  { when: '30. narozeniny', what: 'První vlastní včelstvo' },
  { when: 'Současnost', what: 'Rodinná farma, ~40 včelstev' },
];

export default function Timeline() {
  return (
    <div className="relative mx-auto max-w-sm md:mx-0 md:max-w-none">
      <div className="absolute bottom-1 left-1/2 top-1 w-px -translate-x-1/2 bg-honey-200 md:left-[7px] md:translate-x-0 lg:bottom-auto lg:left-[12.5%] lg:right-[12.5%] lg:top-11 lg:h-px lg:w-auto" />
      <div className="relative flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-4">
        {STEPS.map((step) => (
          <div
            key={step.when}
            className="flex flex-col items-center gap-2 text-center md:flex-row md:items-start md:gap-3 md:text-left lg:grid lg:grid-rows-[28px_14px_auto] lg:justify-items-center lg:gap-y-2 lg:text-center"
          >
            <span className="relative z-20 mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-paper bg-honey-500 lg:row-start-2 lg:mt-0" />
            <div className="relative z-10 bg-paper px-3 md:bg-transparent md:px-0 lg:contents">
              <div className="text-[11px] font-bold uppercase tracking-wide text-honey-600 lg:row-start-1 lg:self-end lg:text-xs">
                {step.when}
              </div>
              <div className="mt-1 text-[13.5px] font-bold lg:row-start-3 lg:mx-auto lg:mt-1 lg:max-w-[18ch] lg:bg-paper lg:px-2 lg:text-sm">
                {step.what}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
