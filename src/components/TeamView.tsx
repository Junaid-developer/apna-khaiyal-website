import { motion } from 'motion/react';
import { TeamMember, DynamicSocialLink, SystemSettings, CompanyContact } from '../types';
import { getAvatarUrl } from '../lib/db';
import SocialIcon from './SocialIcon';

interface TeamViewProps {
  team: TeamMember[];
  settings?: SystemSettings;
  companyContact?: CompanyContact;
}

function getActiveMemberLinks(member: TeamMember, settings?: SystemSettings, companyContact?: CompanyContact): DynamicSocialLink[] {
  const name = typeof member.name === 'string' ? member.name : '';
  const designation = typeof member.designation === 'string' ? member.designation : '';
  const isCEO = name === 'Muhammad Junaid' ||
                designation.toLowerCase().includes('ceo') ||
                designation.toLowerCase().includes('founder');

  const ceoWaUrl = 'https://wa.me/923090111330';
  let list: DynamicSocialLink[] = [];

  if (Array.isArray(member.dynamicSocialLinks)) {
    list = member.dynamicSocialLinks
      .filter((l): l is DynamicSocialLink => !!l && typeof l === 'object')
      .map((l: any, index) => {
        const platform = typeof l.platform === 'string' && l.platform.trim() ? l.platform.trim() : 'Website';
        const url = typeof l.url === 'string' ? l.url.trim() : '';
        const id = typeof l.id === 'string' && l.id.trim() ? l.id : `social-${index}-${name}`;
        return {
          ...l,
          id,
          platform,
          url,
          enabled: l.enabled !== false,
          openInNewTab: l.openInNewTab !== false
        } as DynamicSocialLink;
      })
      .filter(l => l.enabled !== false && l.url !== '');
  }

  if (list.length === 0) {
    const social = member.socialLinks && typeof member.socialLinks === 'object' ? member.socialLinks : {};
    const linkedinUrl = typeof social.linkedin === 'string' ? social.linkedin : (isCEO ? 'https://linkedin.com' : '');
    const githubUrl = typeof social.github === 'string' ? social.github : (isCEO ? 'https://github.com' : '');
    const waUrl = isCEO ? ceoWaUrl : (typeof social.whatsapp === 'string' ? social.whatsapp : '');

    if (linkedinUrl) list.push({ id: 'sl_l', platform: 'LinkedIn', url: linkedinUrl, enabled: true, openInNewTab: true });
    if (waUrl) list.push({ id: 'sl_wa', platform: 'WhatsApp', url: waUrl, enabled: true, openInNewTab: true });
    if (githubUrl) list.push({ id: 'sl_g', platform: 'GitHub', url: githubUrl, enabled: true, openInNewTab: true });
  }

  if (isCEO) {
    const waIdx = list.findIndex(l => typeof l.platform === 'string' && (l.platform.toLowerCase().includes('whatsapp') || l.platform.toLowerCase() === 'wa'));
    if (waIdx < 0) {
      list.push({ id: 'sl_wa_ceo', platform: 'WhatsApp', url: ceoWaUrl, enabled: true, openInNewTab: true });
    } else {
      list[waIdx] = { ...list[waIdx], url: ceoWaUrl, enabled: true };
    }
  }

  return list;
}

export default function TeamView({ team, settings, companyContact }: TeamViewProps) {
  const safeTeam: TeamMember[] = (Array.isArray(team) ? team : [])
    .filter((member): member is TeamMember => !!member && typeof member === 'object')
    .map((member: any, index) => ({
      id: typeof member.id === 'string' && member.id ? member.id : `team-fallback-${index}`,
      name: typeof member.name === 'string' ? member.name : 'Team Member',
      designation: typeof member.designation === 'string' ? member.designation : 'Team Member',
      gender: member.gender === 'Female' ? 'Female' : 'Male',
      experience: typeof member.experience === 'string' ? member.experience : '',
      socialLinks: member.socialLinks && typeof member.socialLinks === 'object' ? member.socialLinks : {},
      dynamicSocialLinks: Array.isArray(member.dynamicSocialLinks) ? member.dynamicSocialLinks : [],
      displayOrder: Number.isFinite(Number(member.displayOrder)) ? Number(member.displayOrder) : index + 1,
      photoUrl: typeof member.photoUrl === 'string' ? member.photoUrl : ''
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 font-sans" id="team-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">Our Executive Tech Team</h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mt-3 text-sm font-sans">
            The multi-disciplinary engineers, automation architects, and designers directing state-of-the-art products at ApnaKhaiyal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="team-grid">
          {safeTeam.map((member, idx) => {
            const photoSrc = member.photoUrl.trim() ? member.photoUrl : getAvatarUrl(member.gender, member.name);
            const activeLinks = getActiveMemberLinks(member, settings, companyContact);

            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                key={member.id}
                className="premium-card rounded-3xl p-6 flex flex-col justify-between items-center text-center group relative overflow-hidden"
                id={`team-card-${member.id}`}
              >
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#e1b382]/10 rounded-full filter blur-[30px] group-hover:bg-[#e1b382]/20 transition-all pointer-events-none" />

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-[#3f6973] group-hover:border-[#e1b382] shadow-lg relative mb-6 transition-all duration-300 bg-[#12343b]">
                    <img
                      src={photoSrc}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getAvatarUrl(member.gender, member.name);
                      }}
                    />
                  </div>

                  {member.experience.trim() !== '' && (
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#e1b382] uppercase bg-[#12343b] px-2.5 py-0.5 rounded border border-[#e1b382]/30 mb-3">
                      {member.experience}
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-[#e1b382] tracking-wide leading-tight transition-colors mb-1.5">{member.name}</h3>
                  <p className="text-[#94A3B8] text-xs font-semibold tracking-wide uppercase font-sans mb-2">{member.designation}</p>
                </div>

                {activeLinks.length > 0 && (
                  <div className="flex items-center justify-center space-x-3 pt-4 border-t border-[#3f6973] w-full mt-4 flex-wrap gap-y-2">
                    {activeLinks.map((link, linkIndex) => {
                      const normPlatform = typeof link.platform === 'string' ? link.platform.toLowerCase() : '';
                      const isWhatsApp = normPlatform.includes('whatsapp') || normPlatform === 'wa';
                      const linkKey = typeof link.id === 'string' && link.id ? link.id : `${normPlatform}-${linkIndex}`;

                      return (
                        <a
                          key={linkKey}
                          href={typeof link.url === 'string' ? link.url : '#'}
                          target={link.openInNewTab !== false ? '_blank' : '_self'}
                          rel={link.openInNewTab !== false ? 'noopener noreferrer' : undefined}
                          referrerPolicy="no-referrer"
                          id={`team-${member.id}-${normPlatform.replace(/[^a-z0-9]/g, '')}-${linkIndex}`}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                            isWhatsApp
                              ? 'bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border-[#25D366]/40 hover:border-[#25D366] shadow-md hover:scale-110 z-10'
                              : 'bg-[#12343b] hover:bg-[#e1b382] hover:text-[#12343b] border-[#3f6973] text-[#94A3B8] hover:scale-105'
                          }`}
                          aria-label={`${typeof link.platform === 'string' ? link.platform : 'Social'} Profile`}
                          title={isWhatsApp ? `Contact ${member.name} directly on WhatsApp` : (typeof link.platform === 'string' ? link.platform : 'Social link')}
                        >
                          <SocialIcon platform={typeof link.platform === 'string' ? link.platform : 'Website'} className={isWhatsApp ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
