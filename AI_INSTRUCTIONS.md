# Spark Blue Diamond (SBD) AI Instructions Memory
This file acts as a persistent memory for Antigravity AI or any AI assistant working on the SBD project. Read these instructions before making structural changes or deployments.

## 1. Project Architecture & Stack
### Frontend (Elite 2026 Standard)
- **Framework:** Next.js 16.2.3+ (App Router, React 19.2.5+).
- **Styling:** Tailwind CSS 3.4.1. Configuration is in `tailwind.config.ts`. Avoid upgrading to v4 without a comprehensive design audit.
  - **Luxury Tokens:** `brand-navy` (#0F172A), `brand-gold` (#C6A87C), `brand-gold-light` (#F0E6D2), `brand-cream` (#FAFAF9).
  - **Utilities:** `.glass` (Standard), `.glass-dark` (Obsidian), `.text-gold-gradient`.
- **PWA:** Uses `@ducanh2912/next-pwa`. **Crucial**: Service workers are intentionally disabled in development mode.
- **Icons & Favicon:** Uses a high-resolution `favicon.png` in `/public`. The `generateMetadata` in `layout.tsx` is the source of truth for all icon types (shortcut, apple-touch, maskable).
- **State/Context:** Relies on React Context (`CartContext`, `CurrencyContext`, `FestiveContext`, `ToastContext`).
- **Typography:** Playfair Display (Serif/Headings) and Inter (Sans-serif/Body text). Always aim for a minimalist, premium luxury aesthetic.

### SEO & Performance (Elite 2026 Standard)
- **ISR (Incremental Static Regeneration):** The home page is configured with `export const revalidate = 60`. Changes to banners or products via the admin panel will reflect within 60 seconds without a rebuild.
- **API Caching:** The `fetchAPI` wrapper in `lib/api.ts` supports Next.js `revalidate` options. It is configured to cache repetitive GET requests (e.g., categories, banners) for 300 seconds (5 mins) to optimize LCP and reduce server load.
- **Sitemap & Robots:**
  - `frontend/app/sitemap.ts`: Generates a dynamic sitemap for categories and products.
  - `frontend/public/robots.txt`: Explicitly manages crawler access (Disallows `/admin`, `/checkout`, `/api`).
- **Image Optimization:** Always use `priority` and `sizes="100vw"` (or appropriate width) for LCP images like the Hero Slider to ensure fast rendering on mobile/tablet.
- **Metadata:** Comprehensive OpenGraph and Twitter card metadata are managed in `layout.tsx`. Always include `alt` text for OG images.

### Backend (Elite 2026 Standard)
- **Framework:** NestJS 11+.
- **Language:** TypeScript 6.0.2+ (Strict `unknown` error handling in catch blocks is mandatory).
- **ORM:** Prisma 5.22.0.
  - **Configuration:** Standard `schema.prisma` with `url = env("DATABASE_URL")`.
  - **Workflow:** Run `npx prisma generate` after schema changes.
- **Integrations:**
  - **Payment Gateway:** PhonePe and CCAvenue. Do NOT alter the hashing or encryption logic without explicit permission.
  - **Shipping:** Shiprocket API.
  - **AI Features:** Google Gemini (`@google/generative-ai`) is used for generating luxury product descriptions.
- **Node Engine:** Effectively forced to 24.x/22.x for modern environment compatibility.

## 2. Deployment Protocol
1. **Frontend (Vercel):** 
   - Deployed continuously via **GitHub Push**. 
   - **Do NOT** use `vercel` CLI or `vercel deploy` directly. The Vercel Root Directory is strictly locked in the Vercel Dashboard, which will cause CLI deployments to fail.
   - Example to deploy Frontend: `git add . && git commit -m "update" && git push origin main`
2. **Backend (Custom VPS):**
   - Deployed manually using the custom deploy script that packages, uploads via SSH, installs dependencies, and restarts the PM2 process.
   - Example to deploy Backend: `cd backend && node deploy.js`
   - *Note:* This script uses `node-ssh` and requires SSH password authentication.
   - **CRITICAL: The `.env` file is deployed TO the VPS.** The local `backend/.env` MUST contain `JWT_SECRET` and `FRONTEND_URL` or the backend will crash on startup. Always verify these exist before deploying.
   - **CRITICAL: After every deploy, verify `class-validator` and `class-transformer` are installed on the VPS.** If missing, PM2 will crash-loop. Run `npm install class-validator class-transformer --legacy-peer-deps` on the VPS if needed.
   - **VPS Hosting:** HostGraber (my.hostgraber.com), IP: `160.187.68.243`, password in deploy.js.

## 3. General Rules & Known Quirks
- **Price Formatting:** Always use the `formatPrice` function from the `CurrencyContext` on the frontend for rendering currency. Do not manually append symbols.
- **PowerShell Execution Policies:** Sometimes `npx` or `npm run build` will fail on this local machine due to Windows Execution Policies blocking `.ps1` files. If this happens, use `npx.cmd` instead of `npx`, or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first.
- **Other Charges & Pricing:** The pricing calculation is complex. It involves Base Gold Rate, Making Charges (Flat, Per_Gram, Percentage), Diamond Value, and Other Charges (Flat, Per_Carat, Percentage). If updating the frontend `AdminAddProduct.tsx` live-calculation, ensure the backend `pricing.service.ts` logic exactly matches it.
- **Dynamic Banners & Overlays:** Always ensure `z-index` for specific popups or holiday splashes remains below `50` (e.g., `z-40`) to prevent blocking the interactive navigation header and footer.
- **Hydration Mismatches (Brave/Safari):** Next.js will throw "Application Error" client-side crashes if the DOM is modified by ad-blockers or strict privacy features. Use `const [isMounted, setIsMounted] = useState(false)` and return `null` before mounting when using `localStorage` or dynamic Date/Time logic.
- **React Context and Infinite Loops:** When passing functions to Context (`AuthContext`, `CartContext`) that are used in downstream `useEffect` dependency arrays, *always* wrap them in `useCallback()` to prevent infinite re-rendering loops. Additionally, use a `useRef(false)` strict-execution guard on sensitive callback handlers (like Google SSO `searchParams` parsing).
- **Safe Property Access:** Cart items and Orders may have missing or disconnected product relations. Always use optional chaining (`item.product?.pricing?.finalPrice`) and sensible fallbacks (`|| 0`) when rendering or calculating totals to avoid runtime `TypeErrors`.
- **MongoDB and Unique Indexes:** MongoDB considers multiple `null` values as duplicates in unique indexes unless configuring sparse indexes. For legacy `User` data migrations involving `@unique` fields (such as `googleId`), always assign a placeholder like `legacy_null_{id}` instead of using `$unset` or `null` to safely pass Prisma's string validation and avoid `E11000` collisions.

## 4. UI Synchronization & Hot-Reloading
- **Vercel Sync:** Because the frontend is deployed to Vercel, local file edits will NOT show up in the production browser (`admin.sparkbluediamond.com`) until you **Run a Git Push**.
- **Build Caching:** If UI changes (like new menu items) are pushed but do not appear, it is likely due to Next.js build caching. Use a unique `FORCE_REBUILD` timestamp or delete the `.next` folder before building to force a refresh.
- **Legacy URLs:** **IMPORTANT**: Ignore any environment variables or hardcoded strings pointing to `onrender.com`. The current production API is strictly **`https://api.sparkbluediamond.com/api`**. Always use the `fetchAPI` wrapper from `lib/api.ts` which is hardcoded to this production URL.
- **Backend Deployment Failures:** If `node deploy.js` fails with an SSH timeout from the AI environment, the developer (USER) should run it manually from their local terminal.
