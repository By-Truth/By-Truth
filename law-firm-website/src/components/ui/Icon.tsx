import type { ReactNode, SVGProps } from "react";
import type { IconName } from "@/types/content";

/**
 * A small, consistent line-icon set drawn on a 24px grid.
 * Icons are decorative by default (aria-hidden); pass `title` to expose one.
 */
type UiIconName =
  | IconName
  | "arrow-right"
  | "arrow-up-right"
  | "menu"
  | "close"
  | "phone"
  | "mail"
  | "map-pin"
  | "clock"
  | "whatsapp"
  | "linkedin"
  | "x"
  | "facebook"
  | "instagram"
  | "check"
  | "alert"
  | "lock"
  | "calendar";

const paths: Record<UiIconName, ReactNode> = {
  "arrow-right": <path d="M4 12h15m-6-6 6 6-6 6" />,
  "arrow-up-right": <path d="M7 17 17 7M9 7h8v8" />,
  menu: <path d="M3 7h18M3 12h18M9 17h12" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  phone: (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10h17M8 3v4m8-4v4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5m0 3v.01" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5 5 16.3A8.5 8.5 0 1 1 8 19.2l-4.5 1.3Z" />
      <path d="M9.2 8.6c.2-.5.6-.6 1-.5l.6 1.5c.1.3 0 .6-.2.8l-.4.4a6 6 0 0 0 3 3l.4-.4c.2-.2.5-.3.8-.2l1.5.6c.1.4 0 .8-.5 1-.9.6-2 .6-3.2 0a8 8 0 0 1-3.3-3.3c-.5-1.1-.6-2.2.3-2.9Z" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M8 10.5v6M8 7.5v.01M11.5 16.5v-3.5a2.5 2.5 0 0 1 5 0v3.5m-5-6v6" />
    </>
  ),
  x: <path d="M4.5 4h4l11 16h-4Zm0 16 6.5-7m2-2.2L19.5 4" />,
  facebook: <path d="M14 21v-7.5h2.5l.5-3h-3V8.8c0-.9.4-1.5 1.6-1.5H17V4.6a18 18 0 0 0-2.4-.1C12.4 4.5 11 5.9 11 8.3v2.2H8.5v3H11V21" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M17 7v.01" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="1.5" />
      <path d="M8.5 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2M3 13h18" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V4.5A1.5 1.5 0 0 1 5.5 3h8A1.5 1.5 0 0 1 15 4.5V21M15 9h3.5A1.5 1.5 0 0 1 20 10.5V21M2.5 21h19" />
      <path d="M7.5 7h4m-4 4h4m-4 4h4" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8Z" />
      <path d="M14 3v5h5M8.5 13h7m-7 4h5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.3a6.5 6.5 0 0 1 3.5 5.7" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4.5" />
      <path d="m11.2 11.8 8.8-8.8m-3 3 2.5 2.5M14.5 8.5 16.5 10.5" />
    </>
  ),
  chart: <path d="M3.5 20.5h17M6.5 17v-5m5 5V7m5 10v-8" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5Z" />
    </>
  ),
  "scale-line": <path d="M12 4v16M5 20h14M5 8h14M7 8l-3 6a3 3 0 0 0 6 0Zm10 0-3 6a3 3 0 0 0 6 0Z" />,
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: UiIconName;
  title?: string;
  size?: number;
}

export function Icon({ name, title, size = 20, strokeWidth = 1.4, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}

export type { UiIconName };
