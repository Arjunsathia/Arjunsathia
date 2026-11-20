# Arjun Sathia

**Full-Stack Developer** · React · Next.js · Node.js · PostgreSQL · MongoDB

I build production web applications: CRM platforms, payment and trading workflows, and messaging automation, backed by automated tests.

---

### About me

- Full-Stack Developer at **Wisbato**, Kozhikode, building CRM platforms for client businesses.
- Integrated the **WhatsApp Cloud API** and the **MetaTrader 5** gateway API into production systems.
- Focused on correctness under load: database transactions, idempotent jobs, rate limiting and safe retries.
- Write tests as part of the work: 300+ automated tests across my main projects.

---

### Tech stack

**Languages**

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-663399?style=flat-square&logo=css&logoColor=white)

**Frontend**

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

**Backend & APIs**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white)
![REST APIs](https://img.shields.io/badge/REST_APIs-0A66C2?style=flat-square)
![WhatsApp Cloud API](https://img.shields.io/badge/WhatsApp_Cloud_API-25D366?style=flat-square&logo=whatsapp&logoColor=white)
![MetaTrader 5 API](https://img.shields.io/badge/MetaTrader_5_API-4A76B8?style=flat-square)

**Databases**

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=flat-square&logo=sequelize&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white)

**Auth & security**

![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![OAuth](https://img.shields.io/badge/OAuth-4285F4?style=flat-square&logo=google&logoColor=white)
![RBAC](https://img.shields.io/badge/RBAC-555555?style=flat-square)
![bcrypt](https://img.shields.io/badge/bcrypt-338033?style=flat-square)

**Testing, tools & DevOps**

![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-2B037A?style=flat-square&logo=pm2&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-000000?style=flat-square&logo=render&logoColor=white)

---

### Featured projects

**[NexChain](https://github.com/Arjunsathia)**: Crypto paper-trading platform
Trade live Binance prices with a $10k virtual balance using market, limit, stop and OCO orders. Includes a server-side matching engine, MongoDB transactions that prevent double fills, TOTP 2FA, a Gemini AI assistant and 140+ automated tests.
`React 19` `Vite` `Redux Toolkit` `TanStack Query` `Node.js` `Express 5` `MongoDB` `WebSockets` `Jest` `Vitest`
[Live demo](LIVE_DEMO_URL) · [Source](https://github.com/Arjunsathia)

**HighCRM**: Forex brokerage CRM & client portal *(client project at Wisbato, private)*
Covers KYC, MetaTrader 5 account creation, and deposit and withdrawal workflows kept in sync with MT5 balances through PostgreSQL transactions. Includes a 12 × 7 roles-and-permissions matrix and real-time support tickets.
`React 19` `Node.js` `Express` `PostgreSQL` `Sequelize` `Socket.IO` `Nginx` `PM2` `GitHub Actions`

**WhatsApp CRM**: Business messaging & class automation *(client project at Wisbato, used by 3 companies, private)*
Extended an open-source CRM into an education platform with a cron-driven class scheduler, WhatsApp attendance check-ins and a broadcast queue whose send governor backs off on Meta rate limits. Cut the planner payload from ~320 KB to ~37 KB; 60+ SQL migrations and ~200 Vitest test files.
`Next.js 16` `React 19` `TypeScript` `Tailwind CSS v4` `Supabase` `WhatsApp Cloud API` `Vitest` `Docker`

---

### Experience

**Full Stack Developer**, Wisbato · *Oct 2025 – Present*
Develop and maintain full-stack applications for client businesses, mainly a WhatsApp CRM and HighCRM, a forex brokerage CRM integrated with MetaTrader 5.

**Full Stack Developer Intern**, Luminar Technolab · *Jan 2025 – Aug 2025*
Built RESTful APIs in Node.js and Express.js with JWT authentication and role-based access, plus 30+ reusable React components with Redux and Tailwind CSS.

---

### GitHub stats

<p>
  <img height="165" src="https://github-readme-stats.vercel.app/api?username=Arjunsathia&show_icons=true&hide_border=true&include_all_commits=true&count_private=true" alt="GitHub stats" />
  <img height="165" src="https://github-readme-stats.vercel.app/api/top-langs/?username=Arjunsathia&layout=compact&hide_border=true&langs_count=8" alt="Top languages" />
</p>

---

### Contact

[![Portfolio](https://img.shields.io/badge/Portfolio-111111?style=flat-square&logo=googlechrome&logoColor=white)](PORTFOLIO_URL)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/arjunsathia/)
[![Email](https://img.shields.io/badge/arjunsathia.in@gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:arjunsathia.in@gmail.com)
