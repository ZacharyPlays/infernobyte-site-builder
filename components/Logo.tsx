// InfernoByte brand mark: a faceted flame rising from a hexagonal "byte" frame.
// Ported into the site-builder runtime so the page designer carries our branding.
export default function Logo({
  size = 36,
  withFrame = true,
}: {
  size?: number;
  withFrame?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="ib-flame"
          x1="24"
          y1="3"
          x2="24"
          y2="45"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f87171" />
          <stop offset="0.55" stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient
          id="ib-flame-core"
          x1="24"
          y1="17"
          x2="24"
          y2="41"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fee2e2" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient
          id="ib-frame"
          x1="6"
          y1="6"
          x2="42"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ef4444" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7f1d1d" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {withFrame && (
        <path
          d="M24 3.2 41.9 13.6 41.9 34.4 24 44.8 6.1 34.4 6.1 13.6Z"
          stroke="url(#ib-frame)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}

      <path
        d="M24 6
           C 20.5 12.5, 14.5 15.5, 14.5 25
           C 14.5 33.5, 19 41, 24 43.5
           C 29 41, 33.5 33.5, 33.5 25
           C 33.5 19.5, 30 16.5, 28.5 12.5
           C 27.8 17, 25.2 16, 25.2 11.5
           C 25.2 9, 24.7 7.5, 24 6 Z"
        fill="url(#ib-flame)"
      />

      <path
        d="M24 21
           C 22 24, 20.5 26, 20.5 30.5
           C 20.5 34.5, 22.2 38, 24 39.5
           C 25.8 38, 27.5 34.5, 27.5 30.5
           C 27.5 27.5, 26 25.5, 25.2 23
           C 24.7 25.5, 23.4 24.5, 24 21 Z"
        fill="url(#ib-flame-core)"
      />
    </svg>
  );
}
