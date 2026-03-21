export default function JourneyHeader() {
  return (
    <div className="mb-8 flex flex-col gap-3 md:mb-12 md:gap-4">
      <div className="overflow-hidden">
        <p className="journey__label text-sm font-medium tracking-[0.2em] uppercase opacity-50">
          Career Path
        </p>
      </div>
      <div className="journey__title overflow-hidden">
        <h2 className="flex w-fit flex-wrap gap-x-4 text-[clamp(32px,6vw,80px)] leading-none font-bold tracking-tight">
          {"My Journey".split(" ").map((word, i) => (
            <span key={i} className="inline-block">
              {word}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}
