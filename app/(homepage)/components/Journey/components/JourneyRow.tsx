import type { Journey } from "../constants/journeys";

type Props = {
  item: Journey;
  idx: number;
};

export default function JourneyRow({ item, idx }: Props) {
  return (
    <div
      className="journey__row hover:bg-foreground/3 cursor-default transition-colors duration-300"
      data-image={item.image}
      data-idx={idx}
    >
      <div className="journey__line h-px w-full bg-neutral-300" />

      <div className="py-5 md:py-8">
        <div className="flex items-start gap-4">
          <div className="journey__index shrink-0">
            <span className="inline-block text-[clamp(32px,4vw,56px)] leading-none font-bold text-neutral-200 select-none">
              {item.index}
            </span>
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h3 className="journey__content w-fit text-[clamp(15px,2vw,26px)] leading-tight font-bold">
              {item.company}
            </h3>

            <div className="journey__content mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="text-xs font-medium text-neutral-500 md:text-sm">
                {item.role}
              </span>
              <span className="hidden text-neutral-300 sm:inline">·</span>
              <span className="text-xs font-medium text-neutral-400 tabular-nums md:text-sm">
                {item.period}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-2 md:mt-4 md:gap-3">
              <p className="journey__content max-w-[560px] text-sm leading-relaxed text-neutral-500">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="journey__tag rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
