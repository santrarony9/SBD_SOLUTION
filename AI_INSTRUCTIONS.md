# Spark Blue Diamond (SBD) AI Instructions Memory
This file acts as a persistent memory for Antigravity AI or any AI assistant working on the SBD project. Read these instructions before making structural changes or deployments.

## 1. Project Architecture & Stack
### Frontend
- **Framework:** Next.js (App Router, React 18+).
- **Styling:** Tailwind CSS. Do NOT use standard CSS unless creating specific custom animations (like Holi).
- **PWA:** Uses `@ducanh2912/next-pwa`. **Crucial**: Service workers are intentionally disabled in development mode to prevent caching loops. To test PWA features locally, you must run `npm run build && npm run start`.
- **State/Context:** Relies heavily on React Context (`CartContext`, `CurrencyContext`, `FestiveContext`, `ToastContext`).
- **Design System:** 
  - **Colors:** `brand-navy` (#0A1128), `brand-gold` (#D4AF37), `brand-cream` (#FDFBF7), `brand-charcoal` (#2C303A).
  - **Fonts:** Playfair Display (Serif/Headings) and Inter (Sans-serif/Body text). Always aim for a minimalist, premium luxury aesthetic.

### Backend
- **Framework:** NestJS.
- **Database:** MongoDB (using Prisma ORM). Run `npx prisma generate` when the schema changes. 
- **Integrations:**
  - **Payment Gateway:** CCAvenue. Do NOT alter the hashing or encryption logic without explicit permission.
  - **Shipping:** Shiprocket API.
  - **AI Features:** Google Gemini (`@google/generative-ai`) is used in the admin panel to auto-generate luxury product descriptions based on jewelry parameters.

## 2. Deployment Protocol
1. **Frontend (Vercel):** 
   - Deployed continuously via **GitHub Push**. 
   - **Do NOT** use `vercel` CLI or `vercel deploy` directly. The Vercel Root Directory is strictly locked in the Vercel Dashboard, which will cause CLI deployments to fail.
   - Example to deploy Frontend: `git add . && git commit -m "update" && git push origin main`
2. **Backend (Custom VPS):**
   - Deployed manually using the custom deploy script that packages, uploads via SSH, installs dependencies, and restarts the PM2 process.
   - Example to deploy Backend: `cd backend && node deploy.js`
   - *Note:* This script uses `node-ssh` and requires SSH password authentication.

## 3. General Rules & Known Quirks
- **Price Formatting:** Always use the `formatPrice` function from the `CurrencyContext` on the frontend for rendering currency. Do not manually append symbols.
- **PowerShell Execution Policies:** Sometimes `npx` or `npm run build` will fail on this local machine due to Windows Execution Policies blocking `.ps1` files. If this happens, use `npx.cmd` instead of `npx`, or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first.
- **Other Charges & Pricing:** The pricing calculation is complex. It involves Base Gold Rate, Making Charges (Flat, Per_Gram, Percentage), Diamond Value, and Other Charges (Flat, Per_Carat, Percentage). If updating the frontend `AdminAddProduct.tsx` live-calculation, ensure the backend `pricing.service.ts` logic exactly matches it.
- **Dynamic Banners & Overlays:** Always ensure `z-index` for specific popups or holiday splashes remains below `50` (e.g., `z-40`) to prevent blocking the interactive navigation header and footer.
- **Hydration Mismatches (Brave/Safari):** Next.js will throw "Application Error" client-side crashes if the DOM is modified by ad-blockers or strict privacy features. Use `const [isMounted, setIsMounted] = useState(false)` and return `null` before mounting when using `localStorage` or dynamic Date/Time logic.
- **React Context and Infinite Loops:** When passing functions to Context (`AuthContext`, `CartContext`) that are used in downstream `useEffect` dependency arrays, *always* wrap them in `useCallback()` to prevent infinite re-rendering loops. Additionally, use a `useRef(false)` strict-execution guard on sensitive callback handlers (like Google SSO `searchParams` parsing).
- **Safe Property Access:** Cart items and Orders may have missing or disconnected product relations. Always use optional chaining (`item.product?.pricing?.finalPrice`) and sensible fallbacks (`|| 0`) when rendering or calculating totals to avoid runtime `TypeErrors`.
- **MongoDB and Unique Indexes:** MongoDB considers multiple `null` values as duplicates in unique indexes unless configuring sparse indexes. For legacy `User` data migrations involving `@unique` fields (such as `googleId`), always assign a placeholder like `legacy_null_{id}` instead of using `$unset` or `null` to safely pass Prisma's string validation and avoid `E11000` collisions.
