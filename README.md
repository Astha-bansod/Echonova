# ECHONOVA — JCOET Creator Platform
**"Your Voice. Your Universe."**

ECHONOVA is a full-stack podcast and video creator platform engineered for the student and faculty innovators of **Jagadambha College of Engineering & Technology (JCOET)**.

---

## 🌟 Architecture & Features

- **Original Brand Aesthetics**: Midnight ink background (`#07070d`), deep violet gradients, lavender accents, coral highlights, and modern editorial typography.
- **Original Logo**: Celestial orbit and acoustic soundwave emblem symbolizing student voices in the cosmos.
- **Dual Persistent Engine**:
  - **Supabase Cloud Mode**: Seamlessly connects to Supabase Auth, PostgreSQL (with Row Level Security), and Supabase Storage (`media`, `covers`) when credentials are provided in `.env`.
  - **Local Studio Engine**: Built-in IndexedDB engine that stores user accounts, profiles, and actual audio/video binary blobs with zero fake simulations.
- **Real Publishing System**:
  - **Option A (Audio Podcast)**: Supports MP3, M4A, WAV, AAC uploads, metadata validation, in-app preview, and cover artwork.
  - **Option B (Video Podcast)**: Supports MP4, WebM, MOV, mobile gallery file selection, drag-and-drop on desktop, custom thumbnail uploads, and client-side format/duration inspection.
- **Audio & Video Players**:
  - **Custom Video Player**: Play/pause, scrubbing seek bar, current/total time, volume slider, fullscreen toggle, playback speed options (0.75x to 2x), and error handling.
  - **Global Audio Player**: Persistent bottom bar with audio waveform bars, seek controls, speed selectors, volume controls, and single-audio-playback guarantee.
- **Creator Dashboard**:
  - Profile customization (display name, bio, avatar).
  - Real database metrics (total episodes, published count, drafts count, video vs. podcast distribution, total storage utilized).
  - Filters: *All Content*, *Audio*, *Videos*, *Drafts*, *Published*.
  - Full CRUD: Create, View, Edit, and Delete episodes.
- **Discovery & Search**:
  - Search by episode title, description, or creator username.
  - Filter by media type and categories.
  - Dedicated public channel pages (`/creator/:username`).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router v7.
- **Backend / Database**: Supabase (PostgreSQL with RLS), Supabase Auth, Supabase Storage.
- **Testing**: Node.js built-in test runner (`node:test`, `node:assert/strict`) via `tsx`.

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

To connect to your cloud Supabase instance, set:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

*Note: If these keys are not set, ECHONOVA automatically operates in its high-performance Local Browser Engine using IndexedDB to store real media files and session records.*

### 2. Supabase Database Migration

Execute the migration file located at:

```
/supabase/migrations/20261102_init_echonova.sql
```

In your Supabase project's **SQL Editor**. This sets up:
1. `profiles` table with foreign key to `auth.users(id)`
2. `episodes` table with indexes for `creator_id`, `status`, `media_type`, `category`, and `slug`
3. Row Level Security (RLS) policies ensuring drafts remain private to creators while published episodes are public
4. `handle_new_user` trigger for automatic profile generation on signup
5. `media` and `covers` storage buckets with public read policies

### 3. Running the App

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 4. Running Unit Tests

```bash
npx --yes tsx --test src/utils/rules.test.ts
```

---

## 🛡️ Row Level Security (RLS) Matrix

| Table | Operation | Target | Condition |
|---|---|---|---|
| `profiles` | SELECT | Public | Everyone can read public creator profiles |
| `profiles` | INSERT / UPDATE | Authenticated | `auth.uid() = id` |
| `episodes` | SELECT | Public | `status = 'published'` |
| `episodes` | SELECT | Creator | `auth.uid() = creator_id` (access to own drafts) |
| `episodes` | INSERT / UPDATE / DELETE | Creator | `auth.uid() = creator_id` |

---

## 🎓 Jagadambha College of Engineering & Technology (JCOET)
Yavatmal, Maharashtra, India.
Student Innovation Cell · ECHONOVA Media Hub
