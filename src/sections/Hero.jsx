import React, {Suspense, lazy, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Entrance, useCompactMotion} from '../lib/motion.jsx';
import {Arrow, DownloadIcon} from '../components/icons.jsx';
import {DogTag} from '../components/DogTag.jsx';
import {TagSwitch, useTheme} from '../components/ThemeSwitch.jsx';
import portrait from '../assets/images/portrait-warm-lighting.webp';
import {aboutCard, profile} from '../content/site.js';
import {heroCardArt} from '../lib/hero-card-art.js';
import {SpecularLight} from '../components/SpecularButton.jsx';
import TechText from '../components/TechText.jsx';
import {IntroContext, INTRO_QUIET_EVENT} from '../components/SiteIntro.jsx';

// The 3D lanyard (three.js) loads after the page, so it never holds up the first paint; the photo shows meanwhile.
const loadLanyard = () => import('../components/Lanyard.jsx');
const Lanyard = lazy(loadLanyard);

// The photo as an ID card on a lanyard: it hangs from a lime strap and swings with real physics. Drag it (with a mouse)
// to swing it; a quick click or tap turns it over. On touch screens the page still scrolls
// over it (no grabbing), and a tap turns it.
// Whether this browser can draw the 3D card at all (checked once). Without it, the plain photo stands in.
let webglSupport = null;
const canDraw3D = () => {
  if (webglSupport === null) {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      webglSupport = Boolean(gl);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
};

function HeroLanyard() {
  const theme = useTheme()==='dark'?'dark':'light';
  const compact = useCompactMotion();
  const [art,setArt] = useState(null);
  // The card drops in once the opening screen has cleared. Until then (and while it loads) the space stays empty, so
  // the photo never flashes up before the card; the photo is shown only where 3D can't be drawn.
  const revealed = useContext(IntroContext);
  const [threeD] = useState(canDraw3D);
  // Fetch the 3D card while the opening screen is up, and build it (held, out of sight) in the screen's quiet moment
  // once the first word has settled, so its setup and shader compiling never stall the words and are done before the
  // screen clears, letting it drop straight in.
  useEffect(()=>{loadLanyard();},[]);
  const [prepare,setPrepare] = useState(revealed);
  useEffect(()=>{
    if(prepare) return undefined;
    if(revealed){setPrepare(true);return undefined;}
    const go=()=>setPrepare(true);
    window.addEventListener(INTRO_QUIET_EVENT,go);
    const timer=setTimeout(go,4000);
    return()=>{window.removeEventListener(INTRO_QUIET_EVENT,go);clearTimeout(timer);};
  },[prepare,revealed]);
  useEffect(()=>{
    let live = true;
    heroCardArt(theme, portrait, aboutCard).then(next=>{if(live)setArt(next);});
    return()=>{live=false;};
  },[theme]);
  const still = <img className="hero-lanyard-still" src={portrait} alt="" fetchPriority="high" width="941" height="1672" />;
  return <div className="hero-lanyard">
    {!threeD ? still : art && prepare ? <Suspense fallback={null}>
      <Lanyard frontImage={art.front} backImage={art.back} strapImage={art.strap} imageFit="cover"
        cardColor={theme==='dark'?'#171b14':'#fffdf8'} strapColor={theme==='dark'?'#9fe05a':'#d4e62d'}
        orientation="portrait" finish="glossy" cornerRadius={0.35} size={compact?0.78:0.64} maxWidth={compact?0.72:0.2405} anchor={compact?'center':0.7515} passThrough={!compact}
        strapLength={compact?0.28:0.62} strapWidth={0.7} metal="graphite"
        gravity={1} damping={0.74} elasticity={0.4} breeze={0.18} interactive dragOnTouch={false} intro hold={!revealed}/>
    </Suspense> : null}
  </div>;
}

// The name as "type specimen" letters (TechText), drawn over each word of the heading. The real text stays in place
// (transparent) so the layout, the dog tag's position, search engines and screen readers are all unchanged. The
// letters draw in with type-metric guides (baseline, x-height, cap height) and fill; then a selection frame with
// specks and size labels sweeps across them. The two words take turns: ARJUN draws in first and SATHIA follows; the
// sweep runs through A-R-J-U-N, then hands over to S-A-T-H-I-A, and back. With a mouse: a hovered letter turns to a
// dashed outline inside the selection frame, letters can be dragged out and spring back, and a click kicks a ripple
// through the word.
const NAME_WORDS = ['Arjun','Sathia'];
function HeroTechWord({word, introDelay, sweep, onSweepEnd}) {
  const box = useRef(null);
  const theme = useTheme()==='dark'?'dark':'light';
  const compact = useCompactMotion();
  const [type,setType] = useState(null);
  useLayoutEffect(()=>{
    const node = box.current?.parentElement;
    if(!node) return undefined;
    const measure = () => {
      const style = getComputedStyle(node);
      const size = parseFloat(style.fontSize) || 100;
      const spacing = (parseFloat(style.letterSpacing) || 0) / size;
      setType(prev => prev && prev.size===size && prev.spacing===spacing ? prev : {size, spacing});
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  },[]);
  // The letters draw in once the opening screen has cleared; the real (invisible) name holds the layout until then.
  const revealed = useContext(IntroContext);
  return <span className="hero-tech" ref={box} aria-hidden="true">
    {type && revealed && <TechText text={word.toUpperCase()} fontWeight={400} fontSize={type.size} letterSpacing={type.spacing}
      color="currentColor" accentColor={theme==='dark'?'#9fe05a':'#707e25'} align="center"
      reveal="letter" lineStyle="dashed" dashLength={4} dashGap={2} strokeWidth={1.5} specks={compact?8:15} selection labels={!compact}
      draggable bounce={0.4} sweep={sweep} onSweepEnd={onSweepEnd} speed={1.5} clickKick intro="metrics" introDuration={1.8}
      introDelay={introDelay} guides={false} guideSide="right"/>}
  </span>;
}

export function Hero() {
  // Which word's turn it is for the sweep (0: ARJUN, 1: SATHIA).
  const [sweeping,setSweeping] = useState(0);
  return <section className="hero" id="home" aria-labelledby="hero-title">
    <Entrance className="hero-meta" delay={.04}><span>SOFTWARE ENGINEER / FULL STACK</span><span><span className="status-dot" /> OPEN TO WORK & FREELANCE</span></Entrance>
    <div className="name-stage"><h1 id="hero-title">{NAME_WORDS.map((name,i)=><span className="hero-name-word" key={name}><span className="hero-name-text hero-name-ghost">{name}</span><HeroTechWord word={name} introDelay={i*1.1} sweep={sweeping===i} onSweepEnd={()=>setSweeping((i+1)%NAME_WORDS.length)}/>{i===0&&<DogTag/>}</span>)}</h1><TagSwitch/>
      <figure className="hero-portrait">
        <HeroLanyard/>
        {/* What the card shows, for screen readers (the 3D card itself is a picture). */}
        <figcaption className="sr-only">Arjun Sathia, seated in warm studio light, on an ID card hanging from a lanyard. The back of the card reads: {aboutCard.role.join(' ')}. {aboutCard.lede} {aboutCard.details.map(([label,value])=>`${label}: ${value}.`).join(' ')}</figcaption>
      </figure>
    </div>
    <div className="hero-bottom"><Entrance className="hero-actions" delay={.52}><a className="button primary-button" href="#work"><SpecularLight/>View projects <Arrow direction="↘" /></a><a className="button secondary-button" href={profile.cv} download={profile.cvFile} aria-label="Download my CV (PDF)"><SpecularLight/>Download my CV <DownloadIcon /></a></Entrance></div>
  </section>;
}
