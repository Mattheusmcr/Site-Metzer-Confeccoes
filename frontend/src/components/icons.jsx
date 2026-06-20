// Todos aceitam { size = 20, color = "currentColor", strokeWidth = 1.6, ...props }

function base(props, size, strokeWidth) {
  return {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth,
    strokeLinecap: "round", strokeLinejoin: "round",
    ...props,
  };
}

export function CartIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="18" cy="21" r="1.4" />
      <path d="M2.5 3h2.2l1.2 12.1a2 2 0 0 0 2 1.8h9.4a2 2 0 0 0 2-1.7l1.3-7.7H6.2" />
    </svg>
  );
}

export function UserIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  // Glifo característico do WhatsApp simplificado em traço único
  return (
    <svg {...base(props, size, strokeWidth)} fill="none">
      <path d="M6.4 17.6 4 20l2.5-2.3A8.5 8.5 0 1 0 4.5 12c0 1.5.4 2.9 1.1 4.1Z" />
      <path d="M8.7 8.6c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .5.4.2.5.7 1.7.7 1.9.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.2-.3.3-.4.5-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.5.2.5.3.1.4.1.8 0 1.2-.1.4-.8 1-1.5 1.2-.6.2-1.3.3-3.4-.7-2.8-1.3-4.5-4.2-4.7-4.4-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2Z" />
    </svg>
  );
}

export function MailIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </svg>
  );
}

export function PinIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function InstagramIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronUpIcon({ size = 16, strokeWidth = 1.8, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="m5 14 7-7 7 7" />
    </svg>
  );
}

export function ArrowUpRightIcon({ size = 16, strokeWidth = 1.8, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function CloseIcon({ size = 20, strokeWidth = 1.8, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function ShirtIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M8 3 4 6.5 6.5 9.5 8 8.3V21h8V8.3l1.5 1.2L20 6.5 16 3c-.6.9-2 1.7-4 1.7s-3.4-.8-4-1.7Z" />
    </svg>
  );
}

export function PrinterIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <rect x="6" y="3" width="12" height="6" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <rect x="7" y="14" width="10" height="7" />
    </svg>
  );
}

export function AdminIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6Z" />
      <path d="m9 12 2.2 2.2L15.5 9.5" />
    </svg>
  );
}

export function CheckIcon({ size = 20, strokeWidth = 1.8, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function TrashIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M4.5 6.5h15" />
      <path d="M9 6.5V4.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3V6.5" />
      <path d="M6.5 6.5 7.3 19a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12.5" />
      <path d="M10.3 10.5v6M13.7 10.5v6" />
    </svg>
  );
}

export function EditIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M14.5 5 19 9.5 8 20.5H3.5V16Z" />
      <path d="m12.5 7 4.5 4.5" />
    </svg>
  );
}

export function PlusIcon({ size = 20, strokeWidth = 1.8, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function PixIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M8.3 8.3a2.8 2.8 0 0 1 4 0l1.4 1.4a1 1 0 0 0 1.4 0l1.4-1.4a2.8 2.8 0 0 1 4 0" transform="translate(0 -1)" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="m9 9 3 3-3 3M15 9l-3 3 3 3" />
    </svg>
  );
}

export function CardIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 9.5h19" />
      <path d="M6 14.5h4" />
    </svg>
  );
}

export function CashIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.8" />
      <path d="M5.5 9v0M18.5 15v0" />
    </svg>
  );
}

export function TruckIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M2.5 7h11v9h-11Z" />
      <path d="M13.5 10.5h3.6L20.5 14V16h-7Z" />
      <circle cx="7" cy="18" r="1.7" />
      <circle cx="17" cy="18" r="1.7" />
    </svg>
  );
}

export function StoreIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M3.5 9 4.7 4h14.6l1.2 5" />
      <path d="M3.8 9a2.3 2.3 0 0 0 4.4 1.1A2.3 2.3 0 0 0 12 10.1a2.3 2.3 0 0 0 4.4 0A2.3 2.3 0 0 0 20.2 9" />
      <path d="M5 10.5V20h14v-9.5" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  );
}

export function PackageIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="m3.5 7.5 8.5-4.5 8.5 4.5-8.5 4.5Z" />
      <path d="M3.5 7.5v9l8.5 4.5 8.5-4.5v-9" />
      <path d="M12 12v9" />
    </svg>
  );
}

export function ChartIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M2.5 20h19" />
    </svg>
  );
}

export function ImageIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.3" cy="9.3" r="1.6" />
      <path d="m4 18 5.5-5.5L13 16l3-3 4 4" />
    </svg>
  );
}

export function SearchIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m20 20-4.6-4.6" />
    </svg>
  );
}

export function RefreshIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M4 12a8 8 0 0 1 14-5.3L20 9" />
      <path d="M20 4v5h-5" />
      <path d="M20 12a8 8 0 0 1-14 5.3L4 15" />
      <path d="M4 20v-5h5" />
    </svg>
  );
}

export function WarningIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M12 3.5 21.5 20h-19Z" />
      <path d="M12 9.5v4.2M12 17v0" />
    </svg>
  );
}

export function ClockIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  );
}

export function TagIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M11.5 3.5h-6A2 2 0 0 0 3.5 5.5v6L13 21l7-7-9.5-10.5Z" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, strokeWidth = 1.8, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="m5 9 7 7 7-7" />
    </svg>
  );
}

export function FilterIcon({ size = 18, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M4 5.5h16M7 12h10M10.5 18.5h3" />
    </svg>
  );
}

export function DownloadIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M12 3.5v12M8 12l4 4 4-4" />
      <path d="M4.5 18v1.7a1.8 1.8 0 0 0 1.8 1.8h11.4a1.8 1.8 0 0 0 1.8-1.8V18" />
    </svg>
  );
}

export function StarIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="m12 3.5 2.6 5.5 6 .7-4.4 4.1 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.7l6-.7Z" />
    </svg>
  );
}