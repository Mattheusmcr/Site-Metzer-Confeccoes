// ─── ÍCONES — set minimalista, traço fino, consistente em todo o site ──────
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
  // Balão de fala com fone — glifo limpo e reconhecível, no mesmo traço do site
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.4-1.2A8.5 8.5 0 1 0 12 3.5Z" />
      <path d="M8.7 8.7c.15-.4.3-.45.5-.45h.45c.15 0 .35.02.5.38.18.43.62 1.5.67 1.6.07.13.1.27.02.43-.08.16-.12.26-.25.4-.13.15-.27.32-.38.43-.13.13-.26.27-.1.55.15.3.68 1.18 1.5 1.9 1.02.92 1.9 1.22 2.18 1.36.28.14.45.12.62-.07.18-.2.74-.83.94-1.1.2-.28.4-.23.66-.14.27.1 1.7.78 2 .92.3.15.5.22.57.34.08.13.08.73-.16 1.43-.25.7-1.42 1.27-1.97 1.34-.5.07-1.13.1-1.83-.12-.42-.13-.96-.3-1.65-.6-2.9-1.22-4.8-4.1-4.95-4.3-.14-.2-1.2-1.55-1.2-2.95 0-1.4.74-2.1.97-2.4Z"
        fill="currentColor" stroke="none" />
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

export function DashboardIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.6" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.6" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.6" />
    </svg>
  );
}

export function ReceiptIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M5.5 3.5h13v17l-2.2-1.5-2.2 1.5-2.1-1.5-2.1 1.5-2.2-1.5-2.2 1.5Z" />
      <path d="M8.3 8.3h7.4M8.3 11.8h7.4M8.3 15.3h4.5" />
    </svg>
  );
}

export function FolderIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M3.5 6.5a1.5 1.5 0 0 1 1.5-1.5h4.2l1.8 2h8a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5Z" />
    </svg>
  );
}

export function CameraIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M4 8.2a1.7 1.7 0 0 1 1.7-1.7h2l1.1-1.7h6.4l1.1 1.7h2A1.7 1.7 0 0 1 20 8.2v9.1a1.7 1.7 0 0 1-1.7 1.7H5.7A1.7 1.7 0 0 1 4 17.3Z" />
      <circle cx="12" cy="12.3" r="3.4" />
    </svg>
  );
}

export function SaveIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M5 3.5h11l3.5 3.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z" />
      <path d="M7.5 3.5V9h7V3.5" />
      <path d="M7.5 20.5v-6h9v6" />
    </svg>
  );
}

export function CoinIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M14.7 9.3c0-1-1.1-1.8-2.7-1.8-1.6 0-2.7.8-2.7 1.8 0 2.6 5.4 1.2 5.4 3.8 0 1-1.1 1.9-2.7 1.9-1.6 0-2.7-.8-2.7-1.9" />
    </svg>
  );
}

export function BagIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M5.5 8.5h13l-1 11.5h-11Z" />
      <path d="M9 8.5V6.8a3 3 0 0 1 6 0v1.7" />
    </svg>
  );
}

export function PaletteIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.7-.8 1.7-1.7 0-.45-.17-.85-.45-1.15-.28-.3-.45-.7-.45-1.15 0-.9.77-1.7 1.7-1.7H16a4 4 0 0 0 4-4c0-4.4-3.6-7.3-8-7.3Z" />
      <circle cx="7.3" cy="10.3" r="1.3" fill="#2563eb" stroke="none" />
      <circle cx="9.8" cy="6.8" r="1.3" fill="#d97706" stroke="none" />
      <circle cx="14.4" cy="6.8" r="1.3" fill="#16a34a" stroke="none" />
      <circle cx="16.8" cy="10.3" r="1.3" fill="#c41e3a" stroke="none" />
    </svg>
  );
}

export function PulseIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M3 12h3.5l1.8-5.5L12 17l2.2-8 1.5 3h4.3" />
    </svg>
  );
}

export function UsersIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <circle cx="8.7" cy="8" r="3" />
      <path d="M3 19c1-2.8 3.1-4.3 5.7-4.3S13.4 16.2 14.4 19" />
      <circle cx="16.2" cy="8.6" r="2.4" />
      <path d="M15 14.5c1.9.1 3.6 1.5 4.4 4" />
    </svg>
  );
}

export function DocIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M6.5 3.5h7l4 4v13h-11Z" />
      <path d="M13.5 3.5V7.5h4" />
      <path d="M9 12.5h6M9 15.8h6" />
    </svg>
  );
}

export function TrophyIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0Z" />
      <path d="M7.5 5.5H5a2 2 0 0 0 0 4h1M16.5 5.5H19a2 2 0 0 1 0 4h-1" />
      <path d="M12 14v3M9 20.5h6M9.8 17h4.4l.4 3.5H9.4Z" />
    </svg>
  );
}

export function ListIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <circle cx="4.3" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.3" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.3" cy="17.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PhoneIcon({ size = 20, strokeWidth = 1.6, ...props }) {
  return (
    <svg {...base(props, size, strokeWidth)}>
      <path d="M5.3 4h3l1.4 4-2 1.6a11.5 11.5 0 0 0 6.7 6.7l1.6-2 4 1.4v3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.8 5.6 1.5 1.5 0 0 1 5.3 4Z" />
    </svg>
  );
}