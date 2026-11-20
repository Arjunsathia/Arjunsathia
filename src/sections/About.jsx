import React from 'react';
import {Sequence, Item} from '../lib/motion.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';
import aboutPortrait from '../assets/images/arjun-about.jpeg';

export function About() {
  return <section className="about" id="about" aria-labelledby="about-title"><div className="section-wrap"><SectionHeading number="06" id="about-title" title={<><span className="about-title-lead">More than a </span><Item as="span" variant="wipe" className="about-title-mark">stack.</Item></>} note="A LITTLE ABOUT ME" />
    <div className="about-grid">
      <div className="about-portrait">
        <figure className="about-photo"><img src={aboutPortrait} alt="Arjun Sathia wearing glasses and a suit" loading="lazy" width="1173" height="1536" /><figcaption className="about-photo-caption"><span className="about-caption-name">// Arjun Sathia</span><span className="about-caption-divider"> · </span><span className="about-caption-role">Software engineer &amp; freelancer</span></figcaption></figure>
      </div>
      <Sequence className="about-content" gap={.1} delay={.08}>
        <Item as="h3" variant="line" className="about-name">HI, I’M<br /><Item as="mark" variant="wipe">ARJUN.</Item></Item>
        <Item as="p" className="about-lead">I’m a software engineer who enjoys figuring out how things work — and making them work better.</Item>
        <Item className="about-copy"><p>I’m a full-stack developer at Wisbato in Kozhikode, where I build CRM platforms for client businesses, integrated with the WhatsApp Cloud API and MetaTrader 5. I work across React and Next.js interfaces, Node.js APIs, and PostgreSQL and MongoDB databases, backed by automated tests.</p><p>I’m looking for a team to grow with, and I’m available for freelance projects too.</p></Item>
      </Sequence>
    </div>
  </div></section>;
}
