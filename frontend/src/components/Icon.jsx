import React from "react";

const P = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>,
  chat: <><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5A8 8 0 1 1 21 12Z" /><path d="M9 11h6M9 14h4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  plan: <><rect x="3.5" y="4.5" width="17" height="16" rx="3" /><path d="M3.5 9h17M8 3v3M16 3v3" /><path d="M7.5 13h3M7.5 16.5h6" /></>,
  cart: <><path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L21 7H6" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17.5" cy="20" r="1.3" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" /></>,
  leaf: <><path d="M5 19c0-8 6-13 14-13 0 9-5 14-13 14" /><path d="M5 19c2-4 5-7 9-9" /></>,
  flame: <path d="M12 3c4 4 5 7 3 10-1-1.5-2-2-3-2 1 3-1 5-3 5-2.5 0-4-2-4-4.5C5 8 9 7 12 3Z" />,
  scale: <><path d="M12 4v3" /><circle cx="12" cy="4" r="1.2" /><path d="M6 7h12" /><path d="m6 7-3 7h6Z" /><path d="m18 7-3 7h6Z" /><path d="M9 20h6" /><path d="M12 7v13" /></>,
  sparkle: <><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6Z" /><path d="M18.5 4.5 19 6l1.5.5L19 7l-.5 1.5L18 7l-1.5-.5L18 6Z" /></>,
  egg: <path d="M12 3c3.5 0 6 5 6 9a6 6 0 1 1-12 0c0-4 2.5-9 6-9Z" />,
  camera: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.2" /></>,
  text: <path d="M5 7V5h14v2M12 5v14M9 19h6" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></>,
  check: <path d="M5 12.5 10 17l9-10" />,
  arrowR: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowL: <path d="M19 12H5M11 6l-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  edit: <path d="M14 5l5 5M4 20l1-4L16 5l3 3L8 19Z" />,
  replace: <path d="M4 8h11l-2.5-2.5M20 16H9l2.5 2.5" />,
  recipe: <><rect x="5" y="3.5" width="14" height="17" rx="2.5" /><path d="M9 8h6M9 11.5h6M9 15h4" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  send: <path d="M4 12 20 4l-6 16-3-7-7-1Z" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18M16.5 14h2" /></>,
  bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6Z" />,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  refresh: <><path d="M4 12a8 8 0 0 1 13.5-5.8L20 8M20 4v4h-4" /><path d="M20 12a8 8 0 0 1-13.5 5.8L4 16M4 20v-4h4" /></>,
  alert: <><path d="M12 4 21 19H3Z" /><path d="M12 10v4M12 17h.01" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
  ruler: <><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M7 7v3M11 7v4M15 7v3M19 7v4" /></>,
  heart: <path d="M12 20S4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11Z" />,
};

export default function Icon({ name, size = 20, stroke = 1.9, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      {P[name] || P.info}
    </svg>
  );
}
