import {siJavascript, siTypescript, siReact, siNextdotjs, siTailwindcss, siNodedotjs, siExpress, siSocketdotio, siMongodb, siPostgresql, siSupabase, siRedux, siReactquery, siReacthookform, siZod, siVite, siSequelize, siJsonwebtokens, siSwagger, siPostman, siJest, siVitest, siDocker, siGit, siGithubactions, siNginx, siPm2, siVercel, siRender, siWhatsapp, siGooglegemini, siCloudinary, siXyflow} from 'simple-icons';

const previewImages = import.meta.glob('../assets/project-previews/*.{svg,jpg,png,webp}', {eager:true, query:'?url', import:'default'});
const findPreview = name => Object.entries(previewImages).find(([path])=>path.slice(path.lastIndexOf('/')+1).replace(/\.\w+$/,'')===name);
// A raster file (jpg/png/webp) is a real screenshot; an svg is an illustrative mockup.
// A project's own `previews` list (file name and title, in order) is used when it has one; otherwise its three
// default screens. `previewNote` describes the screens (for example a demo build with sample data).
const defaultViews = [['overview','Workspace overview'],['detail','A closer look'],['mobile','Mobile layout']];
export const projectPreviewList = project => (project.previews ?? defaultViews.map(([view,title],i)=>({file:`${project.slug}-${view}`, title:project.previewTitles?.[i]??title}))).map(({file,title})=>{
  const [path,src]=findPreview(file)??[];
  return {title, src, screenshot:!!path&&!path.endsWith('.svg'), note:project.previewNote};
});
// `cv`: the CV (public/Arjun_Sathian_CV.pdf), downloaded as `cvFile` from the hero and About.
export const profile = { name: 'Arjun Sathia', email: 'arjunsathia.dev@gmail.com', phone: '+919072183999', github: 'https://github.com/Arjunsathia', linkedin: 'https://www.linkedin.com/in/arjunsathia/', cv: `${import.meta.env.BASE_URL}Arjun_Sathian_CV.pdf`, cvFile: 'Arjun_Sathian_CV.pdf' };
// Where the "Let's talk" form sends enquiries: EmailJS (emailjs.com) delivers them to profile.email using the
// template in email-templates/enquiry.html. These three values come from the EmailJS dashboard and are meant to be
// public (lock them to your domain under Account → Security). Set them here, or as VITE_EMAILJS_SERVICE_ID,
// VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY at build time. While any is empty, the form can't send and
// shows its "didn't send" note.
export const enquiryMail = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_m5obj3b',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_9ugcvq8',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '4hap1nA9xDGUZ1Cwu',
};
// The back of the hero photo card.
export const aboutCard = {
  role: ['AI-Integrated', 'Full stack', 'developer'],
  lede: 'Business solutions and automation.',
  details: [['Build', 'Digital products & business systems'], ['Specialize', 'SaaS, CRM & workflow automation'], ['Connect', 'APIs, platforms & business workflows']],
};
// Each project: the card shows `description` and the short `tags` (phones show the one-line `summary` instead); the dialog shows `overview`, `features`, `engineering` and the full `stack`.
// Preview screens live in assets/project-previews as `<slug>-overview`, `<slug>-detail` and `<slug>-mobile` (.svg mockups, or .jpg/.png/.webp screenshots); `previewTitles` optionally renames the three.
// Or a project lists its own screens, in order, as `previews: [{file, title}]` (any number), with `previewNote` saying what they show.
// `link` is the live site, shown in the project popup; leave it out when there is no public URL.
// Optional `results` (headline numbers, shown as tiles in the popup's overview, with `resultsNote` saying where they
// come from) and `scale` (a problem → cause → fixes → results story, shown first under Engineering).
export const projects = [
  {
    name: 'WhatsApp CRM', slug: 'whatsapp-crm', accent: '#a8ed7d',
    category: 'Client project / Automation', context: 'Wisbato · Used by 3 client companies',
    title: 'Business messaging & class automation',
    summary: 'WhatsApp automation for a multilingual training institute.',
    description: 'An education platform on the WhatsApp Cloud API: batches, class reminders, attendance and large broadcasts, all kept safely within Meta’s sending limits.',
    overview: 'I extended an open-source Next.js and Supabase WhatsApp CRM into a platform that runs a training institute’s **student communication end to end**. Students attend live classes in **Malayalam, English and Kannada** across several batches, and each of them needs the right reminder, meeting link and follow-up, all sent through **one WhatsApp number** without breaching Meta’s limits.',
    note: 'Built on an open-source (MIT) WhatsApp CRM template. The **education layer and the sending-safety system** are my work.',
    results: [
      {value: '~2X', label: 'faster class reminders: ~5 → **9–10 messages a second**'},
      {value: '30%', label: 'fewer database requests per message: **20.4 → 14.4**'},
      {value: '0 / 0', label: '**duplicate and missed messages** in every load-test run'},
      {value: '37 KB', label: 'automation planner payload, down from **~320 KB** (259 ms)'},
    ],
    resultsNote: 'Load-tested with production’s France → Singapore database latency simulated (~160 ms per request), at up to 10,000 students.',
    scale: {
      problem: 'A **9,822-student class slot** sent at about **1.9 messages a second**, so **6,422 reminders (65%)** expired before they were sent.',
      cause: 'About **20 sequential database requests per message**, each crossing ~160 ms of France → Singapore latency.',
      fixes: ['One steady sender per account', 'Merged writes', 'Student data read once per 200, not per student', 'Higher send concurrency', 'Sending continues while planning runs', 'Crash-safe “sending” marks'],
      results: [
        ['Database requests per message', '20.4', '14.4'],
        ['Messages per second', '~5', '~9–10'],
        ['2,000-student reminder', '6–7 min', '3.8 min'],
        ['10,000-student reminder', '~30 min', '~21 min'],
        ['Duplicates / missed messages', '—', '0 / 0'],
      ],
      note: 'Load-test results, with production latency simulated.',
    },
    features: [
      '**Batch and program management**: cohorts move through a Live → Upcoming cycle with **automatic student assignment**, language tracks, and meeting links stored in the database.',
      'A **cron-driven scheduler** that plans and sends personalised class reminders and after-class notes. The builder’s “Upcoming runs” preview uses the same planning logic, so it shows **exactly what will be sent**.',
      '**WhatsApp attendance**: students send a server-generated session code such as “NOTES 47”, are **marked present once**, and automatically receive that session’s notes.',
      '**Lead onboarding** with interactive buttons (consent, language, name, email) that **resumes where the lead left off**.',
      'A **conservative reply detector** for “Not interested” and “send me the link” messages, with a confirmation prompt for unclear opt-outs.',
      '**Special classes** with isolated audiences, enforced in the database by **Postgres guards and role checks**.',
    ],
    engineering: [
      '**Send governor**: every sender shares one adaptive rate limit per WhatsApp number. Class messages go before bulk sends, and on Meta throttling errors it **halves the rate**, pauses all senders and recovers gradually.',
      '**Server-side broadcast queue** with a renewable per-broadcast lock. Each recipient is claimed before sending so **nobody is messaged twice**, and sends go out in waves.',
      '**Account-health gate** that polls Meta’s quality rating and daily limit, reserves capacity for the next 24 hours of class messages, and can run in **shadow mode** before enforcement.',
      '**Crash safety, cron leases and webhook spooling**: interrupted sends are marked “Unclear” instead of re-sent, overlapping cron runs are blocked, and webhooks are written to disk and **replayed idempotently** during database outages.',
      '**Wave-based broadcasts with quality checks**: after a 9,905-recipient broadcast saw **47% refused by Meta**, sending now checks quality between waves and **holds a broadcast at a 25% refusal rate**.',
      'A **load-test harness** that runs the real cron against a local Postgres and a mock Meta API at up to **10,000 students**. It caught a bug that hid **7 failed reminders per 1,000** as “done”; after the fix, **1,000 of 1,000** were delivered.',
      'Fixed a **10,000-row bulk update that timed out** (one recount per row) by batching the recounts, and moved contact filtering into **one database call**, fixing wrong totals and a 1,000-row cap.',
      'Cut the planner payload from **~320 KB to ~37 KB** (259 ms on a 1,009-membership account) with compact, anonymised Postgres RPCs.',
      'Wrote **60+ SQL migrations** and **1,900+ automated tests** across ~200 Vitest files, including PGlite SQL tests.',
    ],
    tags: ['Next.js', 'TypeScript', 'Supabase', 'WhatsApp Cloud API'],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'WhatsApp Cloud API', 'React Flow', 'Vitest', 'PGlite', 'Docker', 'PM2'],
  },
  {
    name: 'MT5 Broker CRM', slug: 'highcrm', accent: '#ffdc3d',
    previews: [
      {file: 'highcrm-1-sign-in', title: 'Sign in'},
      {file: 'highcrm-2-dashboard', title: 'Admin dashboard'},
      {file: 'highcrm-3-reports', title: 'Reports overview'},
      {file: 'highcrm-4-users', title: 'User management'},
      {file: 'highcrm-5-client-portal', title: 'Client portal'},
    ],
    previewNote: 'Demo environment · sample data, not live',
    category: 'Client project / Fintech', context: 'Wisbato · Running in production',
    title: 'Forex brokerage CRM & client portal',
    summary: 'The client lifecycle of a forex brokerage, connected to MetaTrader 5.',
    description: 'A client portal and back office for a forex brokerage: onboarding, KYC, MetaTrader 5 accounts, deposits, withdrawals and support.',
    overview: 'This CRM runs the **client lifecycle of a forex brokerage**, from sign-up and KYC to live trading accounts, funding and support, without manual work in the MT5 Manager terminal. Clients use a **self-service portal**, and staff use an admin panel where every action is controlled by **configurable roles and permissions**. The backend has 18 data models and 15 API route groups, and the React 19 frontend is organised by feature.',
    features: [
      '**Live and demo MetaTrader 5 accounts** created through the **MT5 gateway API**, with login details emailed to the client. Admins set the demo group, starting balance, leverage and a per-email cooldown.',
      '**Deposit and withdrawal workflows** that **update MT5 balances**, with admin approve, reject and flag steps, balance checks and per-group minimum-deposit rules.',
      '**KYC document uploads** with a compliance review queue. Middleware **blocks money-related actions** until KYC is approved.',
      'A **roles-and-permissions matrix of 12 modules × 7 actions**, with protected system roles, custom roles and permission-based route guards.',
      'A **real-time support desk** over Socket.IO, with a room per ticket, internal staff-only notes and live admin alerts.',
      'Payment details chosen from the **client’s IP location**, and admin approval for **bank-account changes**.',
    ],
    engineering: [
      'Each MT5 account is saved as **PENDING** before the gateway call and marked LIVE or FAILED afterwards, so a failed call **never leaves a half-created account**.',
      'If the MT5 manager session has expired, the backend **logs in again and retries** the call automatically.',
      'Every deposit and withdrawal runs inside a **PostgreSQL transaction** alongside the MT5 balance operation, and the **MT5 deal ID** is recorded.',
      'JWT access and refresh tokens, with **one shared refresh** in the frontend so parallel requests don’t all refresh at once. Email OTPs are **hashed and expire after 5 minutes**.',
      'Uploaded files can only be fetched by their **owner or by permitted staff**, with path-traversal checks and no-store caching.',
      'Deployed to a **Linux VPS behind Nginx** (TLS, HSTS, gzip, WebSocket proxying) with PM2 and automatic GitHub Actions releases. The API has **1,400+ lines of OpenAPI documentation**.',
    ],
    tags: ['React', 'Node.js', 'PostgreSQL', 'Socket.IO'],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Redux Toolkit', 'TanStack Query', 'React Hook Form', 'Zod', 'Node.js', 'Express', 'PostgreSQL', 'Sequelize', 'Socket.IO', 'JWT', 'Swagger', 'Nginx', 'PM2', 'GitHub Actions', 'MetaTrader 5 API'],
  },
  {
    name: 'NexChain', slug: 'nexchain', accent: '#9edbc9', link: 'https://nexchain-black.vercel.app/',
    previews: [
      {file: 'nexchain-1-sign-in', title: 'Sign in'},
      {file: 'nexchain-2-dashboard', title: 'Trading dashboard'},
      {file: 'nexchain-3-markets', title: 'Market insights'},
      {file: 'nexchain-4-trade', title: 'Placing an order'},
      {file: 'nexchain-5-assistant', title: 'AI assistant'},
      {file: 'nexchain-6-light-theme', title: 'Light theme'},
    ],
    previewNote: 'Screenshot of the live app · virtual funds',
    previewIntro: 'Screenshots from the live app, from signing in to placing an order, in dark and light themes',
    category: 'Personal project / Fintech', context: 'Personal project · Live demo',
    title: 'Crypto paper-trading platform',
    summary: 'Learn crypto trading on live prices, without risking real money.',
    description: 'Trade live Binance prices with a $10,000 virtual balance, using market, limit, stop and OCO orders, plus price alerts, a leaderboard and an AI assistant.',
    overview: 'NexChain lets people learn crypto trading **without risking real money**. Each user gets a **$10,000 virtual balance** and trades against **live Binance prices** with market, limit, stop-limit, stop-market and OCO orders. They can track their portfolio’s performance, set price alerts, compete on a leaderboard and ask an AI assistant questions. Admins have their own dashboard for users, KYC verification, coins and feedback.',
    features: [
      '**Market, limit, stop-limit, stop-market and OCO orders** on live Binance prices, with an order book and trade history.',
      '**Portfolio performance and allocation charts**, a watchlist, global search, price alerts and a leaderboard.',
      'An **AI assistant on Google Gemini** that uses function calling to fetch live prices and crypto news, with **guardrails against financial advice**.',
      '**One-click demo accounts**: rate-limited private sandboxes, hidden from the leaderboard and **deleted with all their data after 24 hours**.',
      'An **admin dashboard** for users, KYC verification, coins and feedback.',
      '**Light and dark themes**, a mobile tab bar, **TradingView charts**, a news feed and a Learning Hub of guides.',
    ],
    engineering: [
      'A **server-side order-matching engine** on one Binance WebSocket connection with fallback hosts and REST fallbacks. It checks open orders every 5 seconds and saves hourly portfolio snapshots.',
      'Every balance change runs in a **MongoDB multi-document transaction**. An order is claimed and filled in the same transaction, so it can **never fill twice**, and OCO and buy orders reserve funds.',
      'The server is the **authority on prices**: the trade price always comes from the coin on the server, never from the client.',
      '**Authenticated WebSockets** push fills, cancellations and alerts. A shared client price store batches updates once a second and **re-renders only the coins that changed**.',
      '15-minute in-memory access tokens, **rotating httpOnly refresh cookies** with server-side revocation, Google OAuth, email OTP, and **TOTP 2FA** with secrets encrypted using **AES-256-GCM**.',
      '**140+ automated tests** (Jest, Supertest and Vitest against an in-memory MongoDB replica set), with **GitHub Actions CI** and deployment to Render and Vercel.',
    ],
    tags: ['React', 'Node.js', 'MongoDB', 'WebSockets'],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Redux Toolkit', 'TanStack Query', 'Node.js', 'Express', 'MongoDB', 'WebSockets', 'Google Gemini', 'Cloudinary', 'Jest', 'Vitest', 'GitHub Actions', 'Render', 'Vercel'],
  },
];
// Icons for the technology pills on the project cards and dialogs. The ones that aren't brands are drawn here.
const techBrands = {
  React: siReact, 'Next.js': siNextdotjs, TypeScript: siTypescript, 'Node.js': siNodedotjs, Express: siExpress, PostgreSQL: siPostgresql, MongoDB: siMongodb, Supabase: siSupabase,
  'Socket.IO': siSocketdotio, 'Tailwind CSS': siTailwindcss, Vite: siVite, 'Redux Toolkit': siRedux, 'TanStack Query': siReactquery, 'React Hook Form': siReacthookform, Zod: siZod,
  Sequelize: siSequelize, JWT: siJsonwebtokens, Swagger: siSwagger, Nginx: siNginx, PM2: siPm2, 'GitHub Actions': siGithubactions, Docker: siDocker, Jest: siJest, Vitest: siVitest,
  Render: siRender, Vercel: siVercel, 'WhatsApp Cloud API': siWhatsapp, 'Google Gemini': siGooglegemini, Cloudinary: siCloudinary, 'React Flow': siXyflow, Redux: siRedux, Git: siGit,
};
const databaseIcon = 'M12 3C7.6 3 4 4.3 4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6c0-1.7-3.6-3-8-3Zm0 2c3.9 0 6 1 6 1s-2.100 1-6 1-6-1-6-1 2.100-1 6-1Zm6 13c0 .4-2.200 1-6 1s-6-.6-6-1v-2.500c1.500.7 3.600 1 6 1s4.500-.3 6-1V18Zm0-5.500c0 .4-2.200 1-6 1s-6-.6-6-1V10c1.500.7 3.600 1 6 1s4.500-.3 6-1v2.500Z';
export const techIcons = {
  ...Object.fromEntries(Object.entries(techBrands).map(([name, icon]) => [name, icon.path])),
  WebSockets: 'M7 4h2v4h6V4h2v4h1v4a6 6 0 0 1-5 5.900V21h-2v-3.100A6 6 0 0 1 6 12V8h1V4Zm1 6v2a4 4 0 0 0 8 0v-2H8Z',
  'MetaTrader 5 API': 'M3 21h18v-2H3v2ZM5 17h3v-7H5v7Zm5.5 0h3V5h-3v12Zm5.5 0h3V9h-3v8Z',
  PGlite: databaseIcon,
  // Two arrows passing each other: requests and responses.
  'REST APIs': 'M4 7h12.2l-3.1-3.1 1.4-1.4L20 8l-5.5 5.5-1.4-1.4L16.2 9H4V7Zm16 10H7.8l3.1 3.1-1.4 1.4L4 16l5.5-5.5 1.4 1.4L7.8 15H20v2Z',
};
// Brand colours for the same pills. Near-black logos (Next.js, Express, Socket.IO, Vercel and others) simply use the text colour.
const isNearBlack = hex => { const n = parseInt(hex, 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 50; };
export const techColors = {
  ...Object.fromEntries(Object.entries(techBrands).filter(([, icon]) => !isNearBlack(icon.hex)).map(([name, icon]) => [name, `#${icon.hex}`])),
  WebSockets: '#14b8a6', 'MetaTrader 5 API': '#f59e0b', PGlite: '#3b82f6', 'REST APIs': '#6366f1',
};
export const toplineItems =['FRONTEND','BACKEND','FULL STACK DEVELOPER','MERN STACK DEVELOPER','BUILDING FOR THE WEB','REACT & NODE.JS','SOLVING REAL-WORLD PROBLEMS','BUILDING SCALABLE APPLICATIONS','SAAS & CRM DEVELOPMENT','FRONTEND & BACKEND ENGINEERING','API INTEGRATIONS','BUILDING REAL-WORLD PRODUCTS','WRITING CLEAN CODE','PRODUCT-MINDED DEVELOPER','CONTINUOUSLY LEARNING','OPEN TO OPPORTUNITIES','AVAILABLE FOR FREELANCE'];
export const navItems = [['work','Projects'],['services','Services'],['skills','Stack'],['experience','Experience'],['about','About me'],['contact','Contact']];
export const stackGroups = [
  { name: 'Frontend', description: 'Responsive React and Next.js interfaces, with predictable state and server data that stays in sync.', tools: [['JavaScript',siJavascript],['TypeScript',siTypescript],['React',siReact],['Next.js',siNextdotjs],['Redux',siRedux],['Tailwind',siTailwindcss]] },
  { name: 'Backend', description: 'REST APIs, real-time updates, authentication, and the databases that keep money and messages correct.', tools: [['Node.js',siNodedotjs],['Express',siExpress],['Socket.IO',siSocketdotio],['MongoDB',siMongodb],['PostgreSQL',siPostgresql],['Supabase',siSupabase]] },
  { name: 'Testing & quality', description: 'Automated tests for the flows that matter: balances, sessions, permissions, and every API route.', tools: [['Jest',siJest],['Vitest',siVitest],['Postman',siPostman],['Swagger',siSwagger]] },
  { name: 'Deployment', description: 'Containers, reverse proxies, and automated releases that take an application from a pull request to production.', tools: [['Docker',siDocker],['GitHub Actions',siGithubactions],['Nginx',siNginx],['Vercel',siVercel],['Git',siGit]] },
];
// A short note for each tool, shown under its card when it's opened in the Stack gallery.
export const toolNotes = {
  'JavaScript': 'The language under everything I build, in the browser and on the server.',
  'TypeScript': 'Typed code for the CRMs, so data shapes and API contracts are checked before they ship.',
  'React': 'Component-based interfaces, from dashboards to client portals, built from reusable pieces.',
  'Next.js': 'Full-stack React with server rendering and API routes, behind the WhatsApp CRM.',
  'Redux': 'Shared state for larger interfaces, kept predictable with Redux Toolkit.',
  'Tailwind': 'Utility-first styling for fast, consistent and responsive layouts.',
  'Node.js': 'Server-side JavaScript for APIs, scheduled jobs and background queues.',
  'Express': 'Lean REST APIs with routing, middleware, JWT auth and role-based access.',
  'Socket.IO': 'Real-time updates: live chats, notifications and dashboards without a refresh.',
  'MongoDB': 'Flexible document storage for apps whose data changes shape quickly.',
  'PostgreSQL': 'Relational data with schemas, migrations and transactions for money workflows.',
  'Supabase': 'Postgres with auth, storage and realtime built in, powering the WhatsApp CRM.',
  'Jest': 'Unit and integration tests that keep the business logic honest.',
  'Vitest': 'Fast tests for Vite and Next.js projects, around 200 test files in the CRM.',
  'Postman': 'Exploring, testing and sharing API requests while building endpoints.',
  'Swagger': 'API documentation that stays in step with the routes, for everyone using them.',
  'Docker': 'Containers, so an app runs the same on my machine, in CI and in production.',
  'GitHub Actions': 'Automated checks and deploys on every push and pull request.',
  'Nginx': 'Reverse proxy and HTTPS in front of Node apps on production servers.',
  'Vercel': 'Zero-config deploys and preview links for frontends and Next.js apps.',
  'Git': 'Version control with clean branches, reviews and a readable history.',
  'CI/CD': 'Every change tested and released automatically, from pull request to production.',
};
export const serviceItems = [
  {title:'Websites that work',description:'A clear, considered website for your business, portfolio, or next launch. Built around your content and the people you want to reach.',outcome:'From first idea to launch.'},
  {title:'Ideas into products',description:'Turn an idea into a working application, or add the next feature to an existing product. A focused scope, regular updates, and a useful result.',outcome:'A product ready for real users.'},
  {title:'Care & improvements',description:'Fix the frustrating parts, improve slow pages, and keep your application running well as your needs change.',outcome:'A better experience, over time.'},
];
export const experienceItems = [
  {role:'Full Stack Developer',company:'Wisbato',location:'Kozhikode, Kerala',period:'Oct 2025 — Present',duration:'1 year+',brief:'A WhatsApp CRM for 3 client companies and an MT5 broker CRM for a forex brokerage.',summary:'Develop and maintain full-stack web applications for client businesses, mainly a **WhatsApp CRM used by three companies** and an **MT5 broker CRM** for a forex brokerage, integrated with MetaTrader 5.'},
  {role:'Full Stack Developer Intern',company:'Luminar Technolab',location:'Kozhikode, Kerala',period:'Jan 2025 — Aug 2025',duration:'8 months',brief:'REST APIs with JWT and role-based access, plus 30+ reusable React components.',summary:'Built **RESTful APIs** in Node.js and Express.js with **JWT authentication** and role-based access, plus **reusable React components** with Redux and responsive Tailwind CSS layouts.'},
];
export const experienceDetails = [
  {responsibilities:['Extend an open-source WhatsApp CRM into an **education platform** with batches, timetables, class automations and attendance.','Build the MT5 broker CRM’s **client portal and back office**, integrating the **MetaTrader 5 gateway API** for trading accounts and balances.','Design database schemas, migrations, permissions and **transactional money workflows** in PostgreSQL.','Keep messaging fast and reliable at scale: **~9,800 students per class slot** within WhatsApp’s **10K-a-day sending limit**.','Write **automated tests** and ship releases with **Docker, PM2, Nginx and GitHub Actions**.'],delivered:['A **cron-driven class scheduler**, WhatsApp attendance check-ins, and a broadcast queue with a **send governor** that backs off on Meta rate limits.','Class reminders made **~2× faster** in load tests (**~5 → 9–10 messages a second**, database requests per message **20.4 → 14.4**), with **zero duplicate or missed messages**.','**Wave-based broadcasts** that stop at a **25% refusal rate**, after a 9,905-recipient send saw **47% refused by Meta**.','**MT5 account creation, deposit and withdrawal workflows** kept in sync with MT5 balances, KYC checks, and a **12 × 7 roles-and-permissions matrix**.','A planner payload cut from **~320 KB to ~37 KB**, **60+ SQL migrations**, and **1,900+ automated tests**, with a load-test harness for **10,000 students**.'],results:projects[0].results,resultsNote:projects[0].resultsNote,skills:['Next.js','Node.js','PostgreSQL','TypeScript','Supabase','Express','Socket.IO','WhatsApp Cloud API','MetaTrader 5 API','Vitest','Docker','GitHub Actions']},
  {responsibilities:['Built **RESTful APIs** in Node.js and Express.js.','Secured API routes with **JWT authentication and role-based access control**.','Built **reusable React components** with Redux for shared application state.','Created **responsive layouts** with Tailwind CSS.'],delivered:['**REST APIs** with JWT authentication and role-based access.','**30+ reusable React components** with Redux and responsive Tailwind CSS layouts.'],skills:['React','Node.js','Express','Redux','JWT','Tailwind CSS','REST APIs','Git']},
];
export const processSteps = [
  {title:'Understand',description:'We start with the problem, the people using the product, and what a good outcome looks like.',outcome:'A clear brief and shared priorities.'},
  {title:'Plan',description:'I break the work into a practical scope, map the key screens and data, and agree on the next steps.',outcome:'A focused plan with manageable milestones.'},
  {title:'Build',description:'I develop the interface and backend in small, reviewable pieces, with regular updates along the way.',outcome:'Working features you can see and try.'},
  {title:'Test & hand over',description:'I check the important flows, refine the details, and prepare the application and documentation for handover.',outcome:'A considered release and a clear next step.'},
];
