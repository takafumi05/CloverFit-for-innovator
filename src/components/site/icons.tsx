import type { SVGProps } from "react";

/** CloverFit ブランドマーク（四つ葉クローバー）。色は className の text-* で指定 */
export function CloverMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  const leaf =
    "M0,0 C -1.6,-3 -7,-4.6 -7,-9 C -7,-12.2 -3,-12.8 -1,-10.2 C -0.3,-9.3 0,-8.6 0,-8 C 0,-8.6 0.3,-9.3 1,-10.2 C 3,-12.8 7,-12.2 7,-9 C 7,-4.6 1.6,-3 0,0 Z";
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} {...props}>
      <g transform="translate(16 14.5)">
        <path d={leaf} transform="rotate(45)" />
        <path d={leaf} transform="rotate(135)" />
        <path d={leaf} transform="rotate(225)" />
        <path d={leaf} transform="rotate(315)" />
        <path
          d="M0,1 C 0,5.5 -0.7,10 -1.4,13.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

function Stroke(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function PulseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M22 12h-4l-3 8-6-16-3 8H2" />
    </Stroke>
  );
}

export function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
      <path d="M4 21h16" />
    </Stroke>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Stroke>
  );
}

export function ReportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
      <path d="M14 2v6h6" />
      <path d="M9 14v3M12 12v5M15 15v2" />
    </Stroke>
  );
}

export function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 15l.7 2 .3 .3M5 4l.7 2" />
    </Stroke>
  );
}

export const FEATURE_ICONS: Record<
  string,
  (props: SVGProps<SVGSVGElement>) => React.JSX.Element
> = {
  pulse: PulseIcon,
  building: BuildingIcon,
  clock: ClockIcon,
  report: ReportIcon,
  spark: SparkIcon,
};

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M20 6L9 17l-5-5" />
    </Stroke>
  );
}

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Stroke>
  );
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </Stroke>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...props}>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}
