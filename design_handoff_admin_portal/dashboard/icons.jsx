/* global React */

// Minimal stroke icons, drawn at 24×24 viewBox.
// All accept { size, className, strokeWidth } props.

const Icon = ({ size = 18, strokeWidth = 1.6, className = "", children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {children}
  </svg>
);

const IconHome = (p) => (
  <Icon {...p}>
    <path d="M3.5 11 12 4l8.5 7" />
    <path d="M5.5 9.5V20h13V9.5" />
  </Icon>
);
const IconCalendar = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </Icon>
);
const IconBell = (p) => (
  <Icon {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Icon>
);
const IconUsers = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5" />
    <path d="M15.5 11.5a3 3 0 0 0 0-6" />
    <path d="M17 19c0-1.8 1-3.4 2.5-4.3" />
  </Icon>
);
const IconParent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="7.5" r="3" />
    <path d="M5.5 20c0-3.5 3-6.5 6.5-6.5s6.5 3 6.5 6.5" />
  </Icon>
);
const IconTutor = (p) => (
  <Icon {...p}>
    <path d="M3 9 12 5l9 4-9 4-9-4Z" />
    <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
    <path d="M21 9v5" />
  </Icon>
);
const IconBook = (p) => (
  <Icon {...p}>
    <path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Z" />
    <path d="M5 17a3 3 0 0 1 3-3h9" />
  </Icon>
);
const IconLessons = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="4" width="17" height="13" rx="2" />
    <path d="M3.5 8h17M8 4v4M16 4v4" />
    <path d="M7 12h4M7 14.5h6" />
  </Icon>
);
const IconCheck = (p) => (
  <Icon {...p}>
    <path d="m4.5 12 4.5 4.5L19.5 6" />
  </Icon>
);
const IconClipboard = (p) => (
  <Icon {...p}>
    <rect x="6" y="4.5" width="12" height="15.5" rx="2" />
    <path d="M9 4.5V3.5h6v1" />
    <path d="M9 11h6M9 14h4" />
  </Icon>
);
const IconPen = (p) => (
  <Icon {...p}>
    <path d="m4 20 1-4 11-11 3 3-11 11-4 1Z" />
    <path d="m14 7 3 3" />
  </Icon>
);
const IconFolder = (p) => (
  <Icon {...p}>
    <path d="M3.5 6.5a2 2 0 0 1 2-2h3.7a2 2 0 0 1 1.4.6l1.4 1.4h6.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6.5Z" />
  </Icon>
);
const IconCard = (p) => (
  <Icon {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10.5h18M7 16h3" />
  </Icon>
);
const IconDollar = (p) => (
  <Icon {...p}>
    <path d="M12 3v18" />
    <path d="M16.5 7c0-1.5-2-2.5-4.5-2.5S7.5 5.5 7.5 7s1.5 2.3 4.5 2.8 4.5 1.5 4.5 3.2-2 2.5-4.5 2.5S7.5 14.5 7.5 13" />
  </Icon>
);
const IconShield = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 4.5 6v6c0 4 3 7 7.5 8.5 4.5-1.5 7.5-4.5 7.5-8.5V6L12 3.5Z" />
    <path d="M12 8v4M12 15v.5" />
  </Icon>
);
const IconMegaphone = (p) => (
  <Icon {...p}>
    <path d="M4 10v4l11 4V6L4 10Z" />
    <path d="M15 8.5c2 .5 3.5 1.8 3.5 3.5s-1.5 3-3.5 3.5" />
    <path d="M7 14.5V18a1.5 1.5 0 0 0 3 0v-2.5" />
  </Icon>
);
const IconActivity = (p) => (
  <Icon {...p}>
    <path d="M3 12h4l2.5-7 5 14L17 12h4" />
  </Icon>
);
const IconSettings = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="2.7" />
    <path d="M12 3v2.5M12 18.5V21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M3 12h2.5M18.5 12H21M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
  </Icon>
);
const IconLogout = (p) => (
  <Icon {...p}>
    <path d="M14.5 3.5H5.5A1.5 1.5 0 0 0 4 5v14a1.5 1.5 0 0 0 1.5 1.5h9" />
    <path d="m17 8 4 4-4 4" />
    <path d="M21 12H10" />
  </Icon>
);
const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m20 20-5-5" />
  </Icon>
);
const IconChevronRight = (p) => (
  <Icon {...p}>
    <path d="m9 5 7 7-7 7" />
  </Icon>
);
const IconChevronDown = (p) => (
  <Icon {...p}>
    <path d="m5 9 7 7 7-7" />
  </Icon>
);
const IconArrowUpRight = (p) => (
  <Icon {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Icon>
);
const IconArrowRight = (p) => (
  <Icon {...p}>
    <path d="M4 12h16" />
    <path d="m14 6 6 6-6 6" />
  </Icon>
);
const IconPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
const IconFilter = (p) => (
  <Icon {...p}>
    <path d="M3.5 5.5h17l-6.5 8V20l-4-2v-4.5L3.5 5.5Z" />
  </Icon>
);
const IconSort = (p) => (
  <Icon {...p}>
    <path d="M7 4v16M3 8l4-4 4 4" />
    <path d="M17 20V4M13 16l4 4 4-4" />
  </Icon>
);
const IconDownload = (p) => (
  <Icon {...p}>
    <path d="M12 3v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M4 19.5h16" />
  </Icon>
);
const IconRefresh = (p) => (
  <Icon {...p}>
    <path d="M4 11A8 8 0 0 1 18 6.5L20 9" />
    <path d="M20 13a8 8 0 0 1-14 4.5L4 15" />
    <path d="M20 4v5h-5M4 20v-5h5" />
  </Icon>
);
const IconMore = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="18" cy="12" r="1.2" />
  </Icon>
);
const IconStar = (p) => (
  <Icon {...p}>
    <path d="m12 3.5 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7L12 3.5Z" />
  </Icon>
);
const IconClock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);
const IconMail = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Icon>
);
const IconPhone = (p) => (
  <Icon {...p}>
    <path d="M5 4.5h3l2 4-2 1c1 2.5 3 4.5 5.5 5.5l1-2 4 2v3a2 2 0 0 1-2 2C8 20 4 16 4 7a2 2 0 0 1 1-2.5Z" />
  </Icon>
);
const IconTrend = (p) => (
  <Icon {...p}>
    <path d="m3 17 6-6 4 4 8-9" />
    <path d="M14 6h7v7" />
  </Icon>
);
const IconWarn = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 21 19.5H3L12 3.5Z" />
    <path d="M12 10v4.5M12 17v.5" />
  </Icon>
);
const IconBookOpen = (p) => (
  <Icon {...p}>
    <path d="M3.5 5.5h6a3 3 0 0 1 3 3V20a3 3 0 0 0-3-3h-6V5.5Z" />
    <path d="M20.5 5.5h-6a3 3 0 0 0-3 3V20a3 3 0 0 1 3-3h6V5.5Z" />
  </Icon>
);

window.RyzeIcons = {
  IconHome, IconCalendar, IconBell, IconUsers, IconParent, IconTutor,
  IconBook, IconBookOpen, IconLessons, IconCheck, IconClipboard, IconPen,
  IconFolder, IconCard, IconDollar, IconShield, IconMegaphone, IconActivity,
  IconSettings, IconLogout, IconSearch, IconChevronRight, IconChevronDown,
  IconArrowUpRight, IconArrowRight, IconPlus, IconFilter, IconSort, IconDownload,
  IconRefresh, IconMore, IconStar, IconClock, IconMail, IconPhone, IconTrend, IconWarn,
};
