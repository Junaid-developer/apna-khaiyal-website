import React from 'react';
import { 
  Linkedin, 
  Github, 
  Twitter, 
  Facebook, 
  Instagram, 
  Youtube, 
  Mail, 
  Globe, 
  Dribbble,
  MessageCircle,
  Share2
} from 'lucide-react';

interface SocialIconProps {
  platform: string;
  className?: string;
}

export const SUPPORTED_SOCIAL_PLATFORMS = [
  'LinkedIn',
  'WhatsApp',
  'GitHub',
  'Facebook',
  'Instagram',
  'X (Twitter)',
  'YouTube',
  'Email',
  'Website',
  'Behance',
  'Dribbble',
] as const;

export type SocialPlatform = typeof SUPPORTED_SOCIAL_PLATFORMS[number];

export default function SocialIcon({ platform, className = 'w-3.5 h-3.5' }: SocialIconProps) {
  const normPlatform = (platform || '').trim().toLowerCase();

  if (normPlatform.includes('linkedin')) {
    return <Linkedin className={className} />;
  }
  if (normPlatform.includes('whatsapp') || normPlatform.includes('wa')) {
    return (
      <svg className={`${className} fill-current`} viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347zM12 2a10 10 0 0 0-8.627 15.086L2 22l5.044-1.32A10 10 0 1 0 12 2z"/>
      </svg>
    );
  }
  if (normPlatform.includes('github')) {
    return <Github className={className} />;
  }
  if (normPlatform.includes('facebook')) {
    return <Facebook className={className} />;
  }
  if (normPlatform.includes('instagram')) {
    return <Instagram className={className} />;
  }
  if (normPlatform.includes('twitter') || normPlatform === 'x' || normPlatform.includes('x (twitter)')) {
    return (
      <svg className={`${className} fill-current`} viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (normPlatform.includes('youtube')) {
    return <Youtube className={className} />;
  }
  if (normPlatform.includes('email') || normPlatform.includes('mail')) {
    return <Mail className={className} />;
  }
  if (normPlatform.includes('website') || normPlatform.includes('web') || normPlatform.includes('site')) {
    return <Globe className={className} />;
  }
  if (normPlatform.includes('behance')) {
    return (
      <svg className={`${className} fill-current`} viewBox="0 0 24 24">
        <path d="M22 7h-7V5h7v2zm-1.708 6.012c.162.775.05 1.67-.343 2.256-.448.667-1.267 1.054-2.183 1.054-1.626 0-2.85-1.084-2.85-3.047 0-2.022 1.268-3.175 2.801-3.175 1.638 0 2.652 1.096 2.575 2.912h-3.837c.026.868.513 1.408 1.298 1.408.579 0 .977-.248 1.157-.655l1.382.247zm-3.923-1.649h2.365c-.068-.616-.453-1.026-1.144-1.026-.704 0-1.16.425-1.221 1.026zM11.666 11.412c.571.378.966.974.966 1.832 0 1.879-1.42 2.756-3.41 2.756H3V5h5.811c1.94 0 3.195.961 3.195 2.479 0 .927-.478 1.666-1.295 2.052v.041zM6.024 7.551v2.174h2.245c.805 0 1.343-.374 1.343-1.099 0-.74-.538-1.075-1.343-1.075H6.024zm0 4.542v2.449h2.469c.907 0 1.516-.409 1.516-1.229 0-.847-.609-1.22-1.516-1.22H6.024z"/>
      </svg>
    );
  }
  if (normPlatform.includes('dribbble')) {
    return <Dribbble className={className} />;
  }

  return <Globe className={className} />;
}
