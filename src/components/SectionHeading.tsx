interface SectionHeadingProps {
  num: string;
  titlePrefix: string;
  titleAccent: string;
  subtitle?: string;
}

export function SectionHeading({ num, titlePrefix, titleAccent, subtitle }: SectionHeadingProps) {
  return (
    <>
      <div className="font-mono text-xs font-medium tracking-[0.12em] text-text-faint">{num}</div>
      <h2 className="mt-3.5 mb-2.5 text-[34px] leading-[1.15] font-bold tracking-[-0.01em] text-text-bright">
        {titlePrefix} <em className="text-accent">{titleAccent}</em>
      </h2>
      {subtitle && <p className="max-w-[560px] text-[15px] leading-[1.6] text-text-muted">{subtitle}</p>}
    </>
  );
}
