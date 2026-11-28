import React, {useContext} from 'react';
import {Sequence, Item, useCompactMotion} from '../lib/motion.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';
import {SectionFade} from '../components/FadeContent.jsx';
import {profile} from '../content/site.js';
import {DownloadIcon} from '../components/icons.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import {EnquiryContext} from '../components/Enquiry.jsx';
import {SpecularLight} from '../components/SpecularButton.jsx';
import {useTheme} from '../components/ThemeSwitch.jsx';
import DepthText from '../components/DepthText.jsx';
import aboutPortrait from '../assets/images/arjun-about.webp';
import heroPortrait from '../assets/images/portrait-warm-lighting.webp';

// The profile card in the site's own colours: a cream glass frame (dark olive in dark mode), a soft grey tile that
// matches the photo's backdrop, ink text, and the accent green for the "open to work" dot.
const CARD_COLOURS = {
  light: {
    status: '#707e25',
    style: {
      '--pc-frame': 'rgba(255, 253, 248, 0.86)',
      '--pc-frame-edge': 'rgba(19, 23, 13, 0.14)',
      '--pc-frame-highlight': '#ffffff',
      '--pc-frame-shadow': '0 28px 54px -28px rgba(19, 23, 13, 0.38), 0 8px 18px -12px rgba(19, 23, 13, 0.2)',
      '--pc-tile': 'linear-gradient(180deg, #f2f1ed 0%, #e6e4dc 100%)',
      '--pc-tile-edge': 'rgba(19, 23, 13, 0.08)',
      '--pc-tile-highlight': 'rgba(255, 255, 255, 0.9)',
      '--pc-tile-shadow': '0 4px 10px -5px rgba(19, 23, 13, 0.25)',
      '--pc-ink': '#13170d',
      '--pc-muted': '#626155',
      '--pc-shade': 'rgba(19, 23, 13, 0.14)',
    },
  },
  dark: {
    status: '#7fc63f',
    style: {
      '--pc-frame': 'rgba(23, 27, 20, 0.86)',
      '--pc-frame-edge': 'rgba(255, 255, 255, 0.09)',
      '--pc-frame-highlight': 'rgba(255, 255, 255, 0.07)',
      '--pc-frame-shadow': '0 28px 54px -24px rgba(0, 0, 0, 0.85), 0 8px 18px -10px rgba(0, 0, 0, 0.55)',
      '--pc-tile': 'linear-gradient(180deg, #252b20 0%, #171b14 100%)',
      '--pc-tile-edge': 'rgba(255, 255, 255, 0.07)',
      '--pc-tile-highlight': 'rgba(255, 255, 255, 0.1)',
      '--pc-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
      '--pc-ink': '#f2f4ea',
      '--pc-muted': '#a4ab97',
      '--pc-shade': 'rgba(0, 0, 0, 0.4)',
    },
  },
};

export function About() {
  const theme = useTheme() === 'dark' ? 'dark' : 'light';
  const colours = CARD_COLOURS[theme];
  const openEnquiry = useContext(EnquiryContext);
  const compact = useCompactMotion();
  return <section className="about" id="about" aria-labelledby="about-title"><div className="section-wrap"><SectionHeading number="06" id="about-title" title={<><span className="about-title-lead">More than a </span><Item as="span" variant="wipe" className="about-title-mark">stack.</Item></>} note="A LITTLE ABOUT ME" />
    <div className="about-grid">
      {/* The photo as a profile card: it tilts with the pointer, with a soft foil and glare. */}
      <div className="about-portrait">
        <ProfileCard className="about-profile-card" theme={theme} style={colours.style}
          avatarUrl={aboutPortrait} alt="Arjun Sathia wearing glasses and a suit" miniAvatarUrl={heroPortrait}
          name="Arjun Sathia" title="Software engineer & freelancer" handle="arjunsathia" status="Open to work" statusColor={colours.status}
          contactText="Contact" contactPopup="dialog" contactAdornment={<SpecularLight/>}
          onContactClick={event => openEnquiry?.({topic: 'General enquiry'}, event.currentTarget)}
          radius={16} holo={.45} glare={.45} tiltStrength={9} parallax={8} enableTilt intro showUserInfo enableMobileTilt={false}/>
      </div>
      <Sequence className="about-content" gap={.1} delay={.08}>
        {/* "HI, I'M" rises in; the name is DepthText (React Bits): ARJUN. extruded in violet 3D layers that turn with
            the pointer (or orbit slowly on their own) and grow their depth in as the name appears. Light mode: a violet face on
            deep violet depth; dark mode: a light face on violet depth. Fewer, thinner layers on
            phones, where it is smaller. */}
        <h3 className="about-name">
          <Item as="span" className="about-name-hi">HI, I’M</Item><br />
          <Item as="span" className="about-name-depth"><DepthText text="ARJUN." layers={compact ? 18 : 30} depth={compact ? 1.5 : 2.4} faceColor={theme === 'dark' ? 'currentColor' : '#7c3aed'} depthColor={theme === 'dark' ? '#7c3aed' : '#3b0f80'} tilt={7.5} smoothing={0.14} perspective={900} autoOrbit orbitSpeed={0.35} fontSize="1em" fontWeight={400} shadow intro/></Item>
        </h3>
        <p className="about-lead">I’m a software engineer who enjoys figuring out how things work — and making them work better.</p>
        {/* The employer is named in Experience, not here. */}
        <SectionFade className="about-copy"><p>I’m a full-stack developer who builds CRM platforms for client businesses, integrated with the <b>WhatsApp Cloud API</b> and <b>MetaTrader 5</b>. I work across <b>React</b> and <b>Next.js</b> interfaces, <b>Node.js</b> APIs, and <b>PostgreSQL</b> and <b>MongoDB</b> databases, backed by automated tests.</p><p className="about-available">I’m looking for a team to grow with, and I’m available for freelance projects too.</p></SectionFade>
        {/* The CV, for anyone who wants the full picture on one page. */}
        <Item className="about-actions"><a className="button secondary-button about-cv" href={profile.cv} download={profile.cvFile}><SpecularLight/>Download CV <DownloadIcon /></a></Item>
      </Sequence>
    </div>
  </div></section>;
}
