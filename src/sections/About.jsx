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
        <Item className="about-copy"><p>I build across the full stack, from React interfaces to backend services and databases. I care about clear code, useful details, and the person on the other side of the screen.</p><p>I’m looking for a team to grow with, and I’m available for freelance projects too.</p></Item>
      </Sequence>
    </div>
  </div></section>;
}
