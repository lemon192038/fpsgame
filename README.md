# Iron Dusk
Touch-first Three.js FPS for iPad: CPU matches (8 difficulties, 4 modes) and online rooms with Google sign-in via Supabase.

**Modes:** 1v1 · 5v5 · 1v1v1v1v1 · Wave (horde). **CPU levels:** Very Easy, Easy, Normal, Hard, Expert, Master, Pro, Cheater (see `LV` in `modes.js`).
**Controls:** left stick moves, drag right side to look, FIRE / AIM / JUMP / RELOAD buttons, MENU button.

## Setup
1. Create a Supabase project, run `supabase/schema.sql` in the SQL editor.
2. Authentication > Providers > Google: create an OAuth client in Google Cloud (redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`) and paste its ID/secret.
3. Authentication > URL Configuration: add your GitHub Pages URL (`https://<user>.github.io/iron-dusk/`) to Site URL / Redirect URLs.
4. Put the project URL and anon key in `config.js`.
5. Push to GitHub and enable Settings > Pages (deploy from `main`, root).

Without `config.js` filled in, CPU matches still work as a guest; online needs Google sign-in.

## Known limits
Online play uses Supabase Realtime broadcast with client-trusted hits (no server authority), so it suits friendly rooms, not competitive play. CPU levels are tuned by reasoning, not playtesting.
