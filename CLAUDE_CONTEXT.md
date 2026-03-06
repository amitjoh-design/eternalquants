# EternalQuants — Claude Context File
> Paste this entire file at the start of a new Claude chat to resume from where we left off.

---

## 1. PROJECT OVERVIEW

- **Site**: https://www.eternalquants.com (live, deployed on GitHub Pages)
- **Repo**: https://github.com/amitjoh-design/eternalquants
- **Local path**: `C:\Users\amitjohari\Documents\eternalquants`
- **Stack**: React 19 + Vite 7, deployed via GitHub Actions to `gh-pages` branch
- **Auth**: Supabase Auth (Google OAuth)
- **Database + Storage**: Supabase
  - Project URL: `https://psadtbhadvbxyfxsvebc.supabase.co`
  - Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYWR0YmhhZHZieHlmeHN2ZWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQxNzcsImV4cCI6MjA4NzAyMDE3N30.3oMNwbL2KDdkMV6SYY3l5JCE53iegwPmnn1fnDuRSHY`
- **Admin user**: `amitjoh@gmail.com` (Amit Johari) — ONLY this email gets the ADMIN badge
- **Claude API**: Anthropic key stored in `VITE_CLAUDE_KEY` env variable (NOT hardcoded)
  - Local dev: `.env.local` (gitignored) — `VITE_CLAUDE_KEY=sk-ant-api03-...`
  - Production: GitHub Actions secret `VITE_CLAUDE_KEY` in repo Settings → Secrets → Actions
  - ⚠️ Vite inlines `VITE_*` vars into the compiled bundle — key is visible in devtools. Proper fix = Supabase Edge Function proxy (pending task).

---

## 2. SOURCE FILE STRUCTURE

```
eternalquants/
├── public/
│   └── 404.html                   ← GitHub Pages SPA routing fix
├── index.html                     ← SPA redirect restoration script in <head>
├── CLAUDE_CONTEXT.md              ← this file
├── .env.local                     ← gitignored — VITE_CLAUDE_KEY=sk-ant-api03-...
├── supabase_model_guides.sql      ← SQL used to create model_guides table + insert Guide 1
├── .github/
│   └── workflows/
│       └── deploy.yml             ← Vite build → gh-pages deploy; injects 3 secrets
├── src/
│   ├── App.jsx                    ← React Router: / → LandingPage, /auth → AuthPage, /learn → ContentPage
│   ├── main.jsx
│   ├── context/
│   │   └── AuthContext.jsx        ← useAuth() — provides user, loading, signOut
│   ├── lib/
│   │   └── supabase.js            ← createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
│   └── pages/
│       ├── LandingPage.jsx        ← Landing/hero page with animated SVG forecast chart
│       ├── AuthPage.jsx           ← Google OAuth login; redirectTo: window.location.origin + '/auth'
│       └── ContentPage.jsx        ← Main dashboard (~2815 lines) — MOST IMPORTANT FILE
```

---

## 3. GITHUB ACTIONS WORKFLOW (`.github/workflows/deploy.yml`)

Push to `main` → GitHub Actions runs Vite build → deploys to `gh-pages` → live in ~1 min.

```yaml
# Build step env (3 secrets injected):
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  VITE_CLAUDE_KEY: ${{ secrets.VITE_CLAUDE_KEY }}        # ← ADDED Feb 23 2026
```

**All 3 secrets** are set in GitHub repo → Settings → Secrets → Actions:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLAUDE_KEY` ✅ added Feb 23 2026

**⚠️ GitHub Secret Scanning**: Because `VITE_CLAUDE_KEY` is inlined into the compiled bundle (Vite replaces `import.meta.env.VITE_CLAUDE_KEY` with the literal value), the built `assets/index-*.js` file contains the raw API key. GitHub's Push Protection detects this and blocks the `gh-pages` push.
- Workaround applied (Mar 6 2026): Used the "Allow secret" unblock URL — selected "I'll fix it later"
- Long-term fix: Supabase Edge Function proxy (so key never touches the client bundle)
- If push is blocked again in future: Go to repo → Security → Secret scanning → unblock

**Standard git push to deploy:**
```bash
cd "C:\Users\amitjohari\Documents\eternalquants"
git add src/pages/ContentPage.jsx
git commit -m "description"
git push origin main
# If push is rejected by secret scanning, go to the unblock URL shown in the Actions log
```

**Monaco API trick** (for Supabase SQL Editor — avoids autocomplete corrupting keywords):
```js
window.monaco.editor.getModels()[0].setValue(sqlString)
```

---

## 4. SUPABASE TABLES

### `model_files` — file metadata for uploads
```sql
create table model_files (
  id uuid primary key default gen_random_uuid(),
  model_id text not null,       -- e.g. 'arima', 'garch', 'lstm-gru'
  bucket text not null,          -- 'live-files' or 'community-files'
  storage_path text not null,    -- e.g. 'arima/1771605043162_nifty_50_data.csv'
  name text not null,
  size int8,
  type text,                     -- 'Notebook', 'CSV', 'Excel', 'Parquet'
  description text,
  uploaded_by uuid references auth.users(id),
  uploaded_by_name text,
  created_at timestamptz default now()
);
-- RLS: SELECT/INSERT for authenticated, DELETE for admin only
```

### `feedback` — "Talk to Us" submissions ✅ CREATED
```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text, user_name text,
  type text default 'feedback',  -- feedback, suggestion, bug_report, question, other
  message text not null,
  status text default 'new',     -- new, read, in_progress, resolved
  admin_reply text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- RLS: INSERT (authenticated), SELECT/UPDATE/DELETE (admin only)
```

### `model_guides` — DB-driven guide documents per model ✅ CREATED
```sql
create table model_guides (
  id uuid primary key default gen_random_uuid(),
  model_id text not null,        -- 'arima', 'garch', etc.
  title text not null,
  description text,
  html_content text not null,    -- full HTML body (or full <!DOCTYPE html> doc)
  file_name text,
  author_name text default 'EternalQuants Team',
  created_at timestamptz default now(),
  is_active boolean default true
);
-- RLS: SELECT active guides (authenticated); all ops admin only (amitjoh@gmail.com)
```
**Current data**: 1 row — `model_id='garch'`, Guide 1: "Nifty 50 Time Series Analysis: A Practitioner's Guide to Beginner ARIMA Modeling" (8 sections, full HTML)

**⚠️ IMPORTANT — Model Visibility**: The `model_guides` table is now the source of truth for which models are visible to normal users. A model is only shown in the left panel if it has at least one row with `is_active = true` in this table. Admin always sees all 19 models regardless.

### `file_ratings` — star ratings for community-uploaded files ✅ CREATED Feb 23 2026
```sql
create table file_ratings (
  id         uuid primary key default gen_random_uuid(),
  file_id    uuid not null,
  user_id    uuid references auth.users(id) on delete cascade,
  rating     int  not null check (rating >= 1 and rating <= 5),
  created_at timestamptz default now(),
  unique (file_id, user_id)
);
alter table file_ratings enable row level security;
create policy "Users can insert own rating" on file_ratings for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own rating" on file_ratings for update to authenticated using (auth.uid() = user_id);
create policy "All authenticated can read"  on file_ratings for select to authenticated using (true);
```
**Purpose**: Authenticated users rate community files 1–5 stars. One rating per (file_id, user_id). Upsert on conflict allows changing rating. Average + count shown on each community FileCard.

---

## 5. SUPABASE STORAGE BUCKETS

### `live-files` — Admin uploads only
| Policy | Operation | Status |
|--------|-----------|--------|
| Admin can upload to live-files | INSERT | ✅ |
| Authenticated can download live-files | SELECT | ✅ |
| Admin can delete live-files | DELETE | ❌ NOT YET CREATED |

### `community-files` — Any authenticated user
| Policy | Operation | Status |
|--------|-----------|--------|
| Authenticated can upload | INSERT | ✅ |
| Authenticated can download | SELECT | ✅ |
| Admin can delete | DELETE | ✅ |

---

## 6. ContentPage.jsx — ARCHITECTURE (~2815 lines)

### Admin Detection
```jsx
const ADMIN_EMAIL = 'amitjoh@gmail.com';
function isAdmin(user) { return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(); }
```

### Claude API Integration
```jsx
// Line ~823 in ContentPage.jsx
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_KEY || '';
```
- Used only for notebook validation (non-admin uploads)
- Calls `claude-haiku-4-5` via direct browser fetch with header `'anthropic-dangerous-direct-browser-access': 'true'`
- Reads first 25 cells of `.ipynb`, max 6,000 chars total
- Returns strict JSON: `{ relevant: bool, safe: bool, relevance_reason: string, safety_reason: string }`

### Model Visibility Filter (✅ ADDED Mar 6 2026)

Normal users only see models that have at least one active guide in `model_guides`. Admin always sees all 19 models.

**State added to `ContentPage`:**
```js
const [guidedModelIds, setGuidedModelIds] = useState(null); // null = loading; Set = loaded
```

**useEffect to fetch guided models:**
```js
useEffect(() => {
  if (admin) {
    setGuidedModelIds(new Set()); // admin sees all — empty Set is sentinel
    return;
  }
  supabase
    .from('model_guides')
    .select('model_id')
    .eq('is_active', true)
    .then(({ data }) => {
      setGuidedModelIds(new Set((data || []).map(r => r.model_id)));
    });
}, [admin]);
```

**Updated `filteredCats` logic:**
```js
const filteredCats = CATEGORIES.map(cat => ({
  ...cat,
  models: cat.models.filter(m => {
    if (!admin) {
      if (guidedModelIds === null) return false;      // still loading
      if (!guidedModelIds.has(m.id)) return false;   // no active guide
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) ||
           m.fullName.toLowerCase().includes(q) ||
           m.overview.toLowerCase().includes(q);
  }),
})).filter(cat => cat.models.length > 0);
```

**Model list JSX** shows three states:
- `guidedModelIds === null` (non-admin only): `"LOADING MODELS…"` in green
- `filteredCats.length === 0`: `"NO MODELS AVAILABLE"` in grey
- Normal: renders the filtered category/model tree

**To make a model visible to normal users**: Upload at least one guide via the GUIDE tab (admin only) for that model, ensuring `is_active = true` in `model_guides`.

### Key Components / Functions (in order of definition)
| Name | Type | Purpose |
|------|------|---------|
| `openNotebookInNewWindow(nb, filename)` | function | Renders `.ipynb` as dark-themed EQ HTML in new tab. Handles markdown, code, images, HTML output, stream, errors. Blob + URL.createObjectURL. |
| `openGuideInNewWindow(htmlContent, title)` | function | Opens guide HTML in new dark-themed EQ tab. If content starts with `<!DOCTYPE`/`<html` → opens as-is; otherwise wraps in EQ template. Same Blob pattern as notebooks. |
| `FileViewer` | component | Modal for **CSV files only** (50-row preview table). Notebooks bypass this. |
| `AdminInbox` | component | Slide-in panel (admin only). Reads `feedback` table, shows type badges, expand/collapse per message, status update (new→read→in_progress→resolved), admin reply textarea. |
| `FeedbackModal` | component | "✦ TALK TO US" form. Stores to `feedback` table. Types: Feedback/Suggestion/Bug Report/Question/Other. |
| `MiniChart` | component | Animated SVG forecast line in Details tab |
| `StarRating` | component | 1–5 star rating widget on community FileCards. Loads avg+count from `file_ratings`, upserts user rating on click. Shows avg score + vote count. Only visible on community files (when `showUser=true`). |
| `FileCard` | component | File row with VIEW / DOWNLOAD / DELETE buttons. Accepts `user` + `showToast` props; renders `<StarRating>` for community files. |
| `FilesTab` | component | Loads files from DB for model+bucket. `handleView()`: `.ipynb` → new window, others → FileViewer modal. Accepts + passes `user` prop. |
| `PublishTab` | component | Upload form. Admin → `live-files`, users → `community-files`. Requires `.ipynb` + data file together. Runs `validateNotebookWithClaude()` before upload for non-admin users; shows checking/pass/fail UI. |
| `PublishGuideForm` | component | Admin form inside GUIDE tab. Fields: title, description, author, HTML textarea + .html file upload. Saves to `model_guides`. |
| `GuidesTab` | component | DB-driven guide list per model. Fetches from `model_guides` by `model_id`. Shows numbered cards. Admin gets HIDE/SHOW + DELETE. All users get ▶ OPEN (calls `openGuideInNewWindow`). |
| `ModelDetail` | component | Right panel. Tabs: DETAILS / GUIDE / LIVE EXAMPLES / COMMUNITY / PUBLISH (admin). Passes `user` to community `<FilesTab>`. |
| `ContentPage` | default export | Main component: topbar (logo, nav, INBOX badge, TALK TO US, user chip), hero, model list, detail panel. |

### Claude Notebook Validation (`validateNotebookWithClaude`)
```js
// Triggered in PublishTab for non-admin users uploading .ipynb
async function validateNotebookWithClaude(notebookFile, modelId) {
  // 1. Read file as text, parse JSON
  // 2. Extract first 25 cells, max 500 chars each, total max 6000 chars
  // 3. POST to https://api.anthropic.com/v1/messages with claude-haiku-4-5
  //    Headers: 'anthropic-dangerous-direct-browser-access': 'true'
  //    Prompt: "Is this notebook relevant to [modelId] ML model? Is it safe?"
  // 4. Parse response JSON: { relevant, safe, relevance_reason, safety_reason }
  // 5. If !safe → block upload (show red FAIL box)
  // 6. If !relevant → block upload (show red FAIL box)
  // 7. If validation throws → warn but proceed (graceful degradation)
}
```

### Star Rating Component
```jsx
function StarRating({ fileId, user, showToast }) {
  // States: avg, count, userRating, hovered, loading, saving
  // On mount: SELECT rating, user_id FROM file_ratings WHERE file_id = fileId
  // On click: UPSERT INTO file_ratings (file_id, user_id, rating) ON CONFLICT DO UPDATE
  // Renders: "RATE:" label + 5 ★ spans (gold filled = rated, grey = unrated)
  //          + average score + vote count
}
```

### Tab System (per model — ALL models now have GUIDE tab)
- **Details** — overview, params, pros/cons, complexity meters, mini chart
- **Guide** — `<GuidesTab>` — DB-driven guides from `model_guides` table
- **Live Examples** — files from `live-files` bucket
- **Community** — files from `community-files` bucket (has star ratings)
- **Publish** — upload form (Claude validation for non-admin .ipynb uploads)

### Topbar Elements (left → right)
1. Chakra wheel SVG logo (green→cyan gradient, glow animation)
2. `EternalQuants` (Orbitron, gradient text)
3. Nav pills: MODELS / STRATEGIES / TOOLS / RESEARCH
4. `✉ INBOX` button with unread badge — **admin only**, opens AdminInbox
5. `✦ TALK TO US` cyan button — opens FeedbackModal (all users)
6. User chip → dropdown: username + SIGN OUT

### CSS Approach
- Single `CSS` constant string injected as `<style id="eq-styles">` on mount
- `eq-` prefixed class names
- Dark terminal aesthetic: bg `#030a06`, green `#00ff8c`, cyan `#00e5ff`, gold `#ffd166`, orange `#ff7f51`, red `#ff4d6d`
- Fonts: Orbitron (display), Rajdhani (body), Share Tech Mono (code) — Google Fonts
- Canvas particle animation: 55 nodes with connecting lines (background)
- **Font sizes bumped Feb 23 2026**: hero 36→44px, body 13→15px, labels 9→11px, etc.

### model IDs (also used as folder names in storage + `model_id` in DB)
`arima`, `garch`, `var`, `xgboost`, `svr`, `elasticnet`, `lstm-gru`, `tcn`, `transformer-tft`, `nbeats-nhits`, `arima-lstm`, `stacking`, `prophet-ml`, `kalman`, `hmm`, `bayesian`, `drl`, `portfolio`, `regime`

### File View Routing (FilesTab → handleView)
```js
if (file.name.endsWith('.ipynb'))  → download blob → openNotebookInNewWindow()
else                               → setViewer(file)  // CSV modal
```

### Guide View Routing (GuidesTab → ▶ OPEN)
```js
openGuideInNewWindow(guide.html_content, guide.title)
// → if <!DOCTYPE html> → open as-is
// → else → wrap in EQ dark-themed HTML template (same fonts, colours)
```

---

## 7. LandingPage.jsx — CHART DESIGN (updated Feb 23 2026)

### Chart Constants
```js
const TRAIN_END = 60, TEST_END = 90, FUTURE_N = 20, TOTAL_X = 110;
const W = 600, H = 460, PAD = { t: 32, r: 22, b: 50, l: 56 };
```

### Current colour scheme (matplotlib-style, updated Feb 23 2026)
| Series | Colour | Style |
|--------|--------|-------|
| Training line | `#8a9bb0` (grey) | Solid, 1.8px |
| Training area fill | `#7a8fa8` gradient | Subtle grey fill |
| Actual close (hold-out) | `#00ff8c` (bright green) | Solid, 2.4px |
| Reconstructed predicted | `#4d9de0` (blue) | Dashed `8 4`, 2.2px |
| Confidence band (test) | `rgba(77,157,224,.12)` | Light blue fill |
| Forward forecast | `#ff4d6d` (red) | Dashed `7 4`, 2.2px |
| Confidence band (forecast) | `rgba(255,77,109,.09)` | Light red fill |
| CI bounds lines | `rgba(77,157,224,.45)` | Dashed `3 4`, 0.9px |
| MA10 (training) | `rgba(0,212,255,.55)` | Cyan solid, 1.2px |
| Live dot / ring | `#ff4d6d` | Red dot with pulse animation |

### Zone labels & dividers
- `TRAINING` (grey) / `HOLD-OUT` (green) / `FORECAST` (red)
- Dividers: `▶ HOLD-OUT` (green) · `▶ FORECAST` (red)
- Chart title: `"NIFTY 50 PRICE LEVEL · ARIMA FORECAST"` (light blue text)
- Y-axis: `"PRICE LEVEL"`, X-axis: `"TIME (TRADING SESSIONS)"`
- Data generated with: `genSeries(90, 22500, 120, 3)` — simulates Nifty 50 price levels

### Legend pills (floating on chart)
- `p1` (blue): `RMSE: 138 · MAE: 97 · R²: 0.96`
- `p2` (grey): `ARIMA(2,1,2) · AIC: 2847.4`
- `p3` (red): `95% CI · HORIZON: +20 SESSIONS`

### Pipeline steps (centre panel)
`TRAIN DATA` → `HOLD-OUT ACTUAL` → `RECON-STRUCT` → `FORWARD FORECAST`

---

## 8. PENDING / KNOWN ISSUES

### 🟡 DELETE policy for `live-files` bucket — NOT YET CREATED
Run in Supabase Storage → Policies → live-files → New Policy:
- Name: `Admin can delete live-files` · Operation: DELETE · Role: authenticated
- Definition: `bucket_id = 'live-files' AND auth.email() = 'amitjoh@gmail.com'`

### 🟡 ARIMA guide not yet in `model_guides` DB
The old `ARIMA_GUIDE` JS constant (6 sections: What is ARIMA, Unit Root Problem, Pre-Processing, Model Training, Diagnostics, Forecasting) still exists in ContentPage.jsx as **dead code** (around line 687, marked with comment). This content should be converted to HTML and inserted as a new row in `model_guides` with `model_id='arima'` so the ARIMA model becomes visible to normal users and its GUIDE tab has content.

### 🟡 Only GARCH model currently visible to normal users
Only `model_id='garch'` has a row in `model_guides` with `is_active=true`. All other models are admin-only until guides are uploaded. To make more models visible, upload a guide for each via the GUIDE tab while logged in as admin.

### 🟡 DOWNLOAD button not fully tested end-to-end
SELECT policy exists on both buckets, but hasn't been verified with a real file download since storage policies were set up.

### 🟡 Notebook viewer popup blocker risk
`openNotebookInNewWindow` uses `window.open` on a blob URL. Some browsers may silently block it if triggered without direct user interaction. No fallback currently implemented.

### 🟡 Claude validation uses direct browser API call (security risk)
`validateNotebookWithClaude()` calls `https://api.anthropic.com/v1/messages` directly from the browser. The API key (`VITE_CLAUDE_KEY`) is baked into the Vite build bundle and **publicly visible** in devtools / page source. For production-grade security, proxy through a Supabase Edge Function so the key never touches the client bundle.

---

## 9. RECENT COMMITS (newest first)

```
b7135be  fix: add missing closing brace on ContentPage function
9a2c563  feat: filter model list by active guides for non-admin users
212187f  Refactor openGuideInNewWindow function
9d745f4  docs: update CLAUDE_CONTEXT.md — file_ratings, Claude validation, chart redesign, env vars
9c522ce  feat: redesign landing chart — grey training, green actual, blue reconstructed, red forecast (matplotlib style)
29918e4  ci: add VITE_CLAUDE_KEY secret to build env
9b1f435  feat: ratings, Claude notebook validation, improved aesthetics
2d64685  feat: dynamic guide system for all models via DB-driven model_guides table
5b719e2  feat: add feedback table + admin inbox panel
37c74bb  feat: add ARIMA/SARIMA comprehensive educational guide (now dead code — replaced by DB system)
a230986  feat: notebook opens as full HTML in new tab, chakra logo, EternalQuants brand, Talk to Us
```

---

## 10. IMPORTANT DESIGN DECISIONS

1. **No Tailwind** — all styles are a single CSS string injected at runtime, `eq-` prefixed
2. **Dark terminal aesthetic** — bg `#030a06`, green `#00ff8c`, cyan `#00e5ff`, gold `#ffd166`
3. **Notebook viewer = new tab** — `.ipynb` opens as self-contained HTML page (not modal)
4. **Guide viewer = new tab** — `model_guides.html_content` opens as EQ-themed HTML page
5. **CSV viewer = modal** — 50-row preview table inside the app
6. **ADMIN is email-only** — `amitjoh@gmail.com` lowercase match, no DB roles
7. **File upload requires notebook + data file together** — enforced in `PublishTab.validate()`
8. **`model_files` DB** stores metadata; actual files live in Supabase Storage
9. **Guides are DB-driven** — stored in `model_guides` table as HTML; admin publishes via UI
10. **Feedback is admin-private** — only `amitjoh@gmail.com` can read via RLS + AdminInbox UI
11. **Star ratings are per-user, per-file** — `file_ratings` table with `unique(file_id, user_id)`; only shown on community files
12. **Claude notebook validation is non-blocking on error** — if API call fails, upload proceeds with a warning toast; validation only hard-blocks on explicit `relevant=false` or `safe=false`
13. **Vite env variable for Claude key** — `import.meta.env.VITE_CLAUDE_KEY` in code; stored in `.env.local` locally (gitignored) and as GitHub Actions secret for CI builds
14. **Model visibility is guide-gated** — `model_guides` table (is_active=true) controls which models normal users see. Admin bypasses this entirely and always sees all 19 models.

---

## 11. NEXT TASKS FOR CLAUDE

1. **Upload guides for more models** — currently only GARCH is visible to normal users. Upload HTML guides for each model via the GUIDE tab (admin) to unlock them for normal users. Start with ARIMA (convert dead-code `ARIMA_GUIDE` constant at ~line 687 of ContentPage.jsx to HTML).
2. **Create DELETE policy** for `live-files` bucket in Supabase Storage (see Section 8)
3. **Test DOWNLOAD button** for files in Live Examples tab end-to-end
4. **Clean up dead code** — optionally delete the `ARIMA_GUIDE` constant (~lines 687–783) from ContentPage.jsx once its content has been migrated to the DB
5. **Supabase Edge Function proxy** — move Claude API call server-side to protect `VITE_CLAUDE_KEY` from the public bundle. This also permanently fixes the GitHub Push Protection secret scanning issue.
6. Any new features or improvements the user requests
