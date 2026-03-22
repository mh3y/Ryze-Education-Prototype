import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SocialLink = {
  Icon: LucideIcon;
  href: string;
  label: string;
};

export const socialLinks: SocialLink[] = [
  {
    Icon: Facebook,
    href: 'https://www.facebook.com/people/Ryze-Education/61583067491158/?mibextid=wwXIfr&rdid=pqwYdpqBoSmmo7cn&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Ch1Yo8qHp%2F%3Fmibextid%3DwwXIfr',
    label: 'Ryze Education on Facebook',
  },
  {
    Icon: Instagram,
    href: 'https://www.instagram.com/ryzeeducation/?igsh=MTI3Z21xcHRzZnFxZA%3D%3D&utm_source=qr#',
    label: 'Ryze Education on Instagram',
  },
  {
    Icon: Linkedin,
    href: 'https://www.linkedin.com/company/ryze-education',
    label: 'Ryze Education on LinkedIn',
  },
  {
    Icon: MessageCircle,
    href: 'https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0',
    label: 'Chat with Ryze Education on WhatsApp',
  },
];
