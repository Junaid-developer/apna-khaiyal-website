import { motion } from 'motion/react';
import { TeamMember, DynamicSocialLink, SystemSettings, CompanyContact } from '../types';
import { getAvatarUrl } from '../lib/db';
import { getCEOWhatsAppUrl } from '../lib/utils';
import SocialIcon from './SocialIcon';

interface TeamViewProps {
  team: TeamMember[];
  settings?: SystemSettings;
  companyContact?: CompanyContact;
}

function getActiveMemberLinks(member: TeamMember, settings?: SystemSettings, companyContact?: CompanyContact): DynamicSocialLink[] {
  const isCEO = member.name === 'Muhammad Junaid' || 
                member.designation?.toLowerCase().includes('ceo') || 
                member.designation?.toLowerCase().includes('founder');

  const ceoWaUrl = 'https://wa.me/923090111330';

  let list: DynamicSocialLink[] = [];

  if (Array.isArray(member.dynamicSocialLinks) && member.dynamicSocialLinks.length > 0) {
    list = member.dynamicSocialLinks.filter(
      l => l.enabled !== false && Boolean(l.url && l.url.trim() !== '')
    );
  } else {
    // Fallback if dynamicSocialLinks is not explicitly defined in legacy record
    const linkedinUrl = member.socialLinks?.linkedin || (isCEO ? 'https://linkedin.com' : '');
    const githubUrl = member.socialLinks?.github || (isCEO ? 'https://github.com' : '');
    const waUrl = isCEO ? ceoWaUrl : (member.socialLinks?.whatsapp || '');

    if (linkedinUrl) list.push({ id: 'sl_l', platform: 'LinkedIn', url: linkedinUrl, enabled: true, openInNewTab: true });
    if (waUrl) list.push({ id: 'sl_wa', platform: 'WhatsApp', url: waUrl, enabled: true, openInNewTab: true });
    if (githubUrl) list.push({ id: 'sl_g', platform: 'GitHub', url: githubUrl, enabled: true, openInNewTab: true });
  }

  // Guarantee that the CEO profile card always has a direct, active WhatsApp link pointing strictly to +923090111330
  if (isCEO) {
    const waIdx = list.findIndex(l => {
      const p = (l.platform || '').toLowerCase();
      return p.includes('whatsapp') || p.includes('wa');
    });

    if (waIdx < 0) {
      list.push({
        id: 'sl_wa_ceo',
        platform: 'WhatsApp',
        url: ceoWaUrl,
        enabled: true,
        openInNewTab: true
      });
    } else {
      // Force CEO's WhatsApp link to point strictly to https://wa.me/923090111330
      list[waIdx] = {
        ...list[waIdx],
        url: ceoWaUrl,
        enabled: true
      };
    }
  }

  return list;
}

export default function TeamView({ team, settings, companyContact }: TeamViewProps) {
  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 font-sans" id="team-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Our Executive Tech Team
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mt-3 text-sm font-sans">
            The multi-disciplinary engineers, automation architects, and designers directing state-of-the-art products at ApnaKhaiyal.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="team-grid">
          {team.map((member, idx) => {
            const photoSrc =
              member.photoUrl && member.photoUrl.trim() !== ""
                ? member.photoUrl
                : getAvatarUrl(member.gender, member.name);

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
                {/* Background ambient lighting */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#e1b382]/10 rounded-full filter blur-[30px] group-hover:bg-[#e1b382]/20 transition-all pointer-events-none" />

                <div className="flex flex-col items-center">
                  {/* Photo Container */}
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

                  {/* Optional Experience Badge */}
                  {member.experience && member.experience.trim() !== '' && (
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#e1b382] uppercase bg-[#12343b] px-2.5 py-0.5 rounded border border-[#e1b382]/30 mb-3">
                      {member.experience}
                    </span>
                  )}
                  
                  <h3 className="text-lg font-bold text-[#e1b382] tracking-wide leading-tight transition-colors mb-1.5">
                    {member.name}
                  </h3>
                  
                  <p className="text-[#94A3B8] text-xs font-semibold tracking-wide uppercase font-sans mb-2">
                    {member.designation}
                  </p>
                </div>

                {/* Socials Link Row */}
                {activeLinks.length > 0 && (
                  <div className="flex items-center justify-center space-x-3 pt-4 border-t border-[#3f6973] w-full mt-4 flex-wrap gap-y-2">
                    {activeLinks.map((link) => {
                      const normPlatform = (link.platform || '').toLowerCase();
                      const isWhatsApp = normPlatform.includes('whatsapp') || normPlatform.includes('wa');

                      return (
                        <a
                          key={link.id || link.platform}
                          href={link.url}
                          target={link.openInNewTab !== false ? "_blank" : "_self"}
                          rel={link.openInNewTab !== false ? "noopener noreferrer" : undefined}
                          referrerPolicy="no-referrer"
                          id={`team-${member.id}-${normPlatform.replace(/[^a-z0-9]/g, '')}`}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                            isWhatsApp 
                              ? 'bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border-[#25D366]/40 hover:border-[#25D366] shadow-md hover:scale-110 z-10' 
                              : 'bg-[#12343b] hover:bg-[#e1b382] hover:text-[#12343b] border-[#3f6973] text-[#94A3B8] hover:scale-105'
                          }`}
                          aria-label={`${link.platform} Profile`}
                          title={isWhatsApp ? `Contact ${member.name} directly on WhatsApp` : link.platform}
                        >
                          <SocialIcon platform={link.platform} className={isWhatsApp ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
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
