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

## World, damage numbers, controls
- 1,200 structure ids = 16 archetypes (apartments, towers, houses, shops, offices, warehouses, containers, cars, walls, crates, ruins, trees, umbrellas, beach balls, rocks, lifeguard towers) x 75 parametric variants. Buildings are hollow: doors, windows you can shoot through, floors, alternating staircases, roofs.
- 120 maps = 10 themes (Beach, Desert, Forest, Suburb, Downtown, Industrial, Snow, Ruins, Harbor, Highrise) x 12 variants (density, time of day, layout). Pick in the menu (arrows / RANDOM). Online rooms derive their map from the room name.
- Damage numbers pop up on hits (yellow = headshot); incoming damage shows near the crosshair.
- Menu > CONTROLS: TOUCH or KEYBOARD + MOUSE (WASD, Space, mouse, right click aim, R reload, Esc menu).

## v3
- Fixed online height sync (feet height + crouch are sent with every pose).
- 110 weapon models (78 primary-only, 32 secondary-only; stats generated per model from 12 families), switch with SWAP / 1,2,Q.
- Crouch (C / CROUCH), slide (crouch while sprinting), sprint (Shift / push stick to the edge).
- Weather: rain, storms with lightning, snow. New structures: container blocks, container ramp stacks, overpasses, water towers.
- QUICK MATCH: pick 1v1 (2 players), 5v5 (10) or 1v1v1v1v1 (5); the match starts when enough players are waiting; the map is random.

## Languages
Menu > top row: 日本語 / 中文 / English (saved in the browser; defaults to the browser language). UI text is translated through the phrase table in `i18n.js`; add a row there to translate new text.
