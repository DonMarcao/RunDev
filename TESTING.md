# 🧪 RunDev — Testing Documentation

This document covers manual and automated testing performed on RunDev prior to submission.

---

## Table of Contents

1. [Automated Testing](#automated-testing)
2. [Manual Testing — User Stories](#manual-testing--user-stories)
3. [Manual Testing — Features](#manual-testing--features)
4. [Browser Compatibility](#browser-compatibility)
5. [Responsiveness Testing](#responsiveness-testing)
6. [Code Validation](#code-validation)
7. [Known Issues](#known-issues)
8. [Bugs Fixed During Development](#bugs-fixed-during-development)

---

## Automated Testing

```bash
python manage.py test
```

| App | Tests | Result |
|-----|-------|--------|
| accounts | 8 | ✅ Pass |
| game | 8 | ✅ Pass |
| leaderboard | 9 | ✅ Pass |
| payments | 6 | ✅ Pass |
| **Total** | **31** | **✅ All passing** |

Tests were re-run after all leaderboard view changes (best-score-per-world annotation, world filter, total score ranking) to confirm no regressions.

---

## Manual Testing — User Stories

### 🔐 Authentication

| # | User Story | Test Steps | Result |
|---|-----------|------------|--------|
| 1 | Register for an account | Navigate to `/accounts/register/`, fill form, submit | ✅ Pass — account created, redirected to login |
| 2 | Log in with username/password | Navigate to `/accounts/login/`, enter valid credentials | ✅ Pass — redirected to `/game/` |
| 3 | Log out | Click "Logout" in navbar | ✅ Pass — session ended, redirected to home |
| — | Access game without login | Visit `/game/` while logged out | ✅ Pass — redirected to login (`@login_required`) |

### 🎮 Game

| # | User Story | Test Steps | Result |
|---|-----------|------------|--------|
| 4 | Play World 1 for free | Log in as non-premium user, navigate to `/game/` | ✅ Pass — Web Ocean loads |
| 5 | Navigate with arrow keys | Press ↑↓←→ during gameplay | ✅ Pass — player moves in 8 lanes |
| 6 | See elapsed time | Observe HUD during gameplay | ✅ Pass — timer updates every frame |
| 7 | See score on completion | Reach the finish line | ✅ Pass — score calculated and displayed |
| 8 | Restart after game over | Collide with obstacle, press SPACE | ✅ Pass — scene restarts cleanly |
| — | Give up mid-run | Click "Give Up" button during gameplay | ✅ Pass — triggers Game Over state |

### 💳 Premium

| # | User Story | Test Steps | Result |
|---|-----------|------------|--------|
| 9 | See showroom after World 1 (free user) | Complete Web Ocean as free user | ✅ Pass — redirected to `/game/showroom/` |
| 10 | Pay via Stripe | Click "Unlock Now", complete Stripe checkout | ✅ Pass — `is_premium` set to True via webhook |
| 11 | Auto-progress to next world (premium) | Complete a world as premium user | ✅ Pass — redirects to next `?world=` param |

### 🏆 Leaderboard & CRUD

| # | User Story | Test Steps | Result |
|---|-----------|------------|--------|
| 12 | View Hall of Senior Devs | Premium user navigates to `/leaderboard/` | ✅ Pass — total score + per-world rankings shown |
| 13 | Add label to a score | Enter text in label field, click Save | ✅ Pass — label persists (Update) |
| 14 | Delete a score | Click Delete, confirm | ✅ Pass — score removed (Delete) |
| — | Filter leaderboard by world | Click world filter buttons (Ocean/Cloud/Space/Matrix) | ✅ Pass — table filters correctly |
| — | View total score ranking | Complete multiple worlds, check Total Score table | ✅ Pass — sums best scores per world |
| — | Non-premium tries to access leaderboard | Visit `/leaderboard/` as free user | ✅ Pass — shown `locked.html` with upgrade CTA |

---

## Manual Testing — Features

| Feature | Test | Result |
|---------|------|--------|
| Navbar — Play/Store/Leaderboard/Logout links | Click each link while logged in | ✅ All routes correctly |
| Navbar — Login/Register links | Click each link while logged out | ✅ All routes correctly |
| Navbar — premium-only Leaderboard link | Confirm link shows "Unlock Premium" for free users | ✅ Pass |
| Store — world previews display | Visit `/store/` | ✅ Pass — real images for all 4 worlds |
| Store — developer previews (coming soon) | Visit `/store/` | ✅ Pass — 3 character images displayed |
| Showroom — world grid 2x2 | Visit after completing World 1 | ✅ Pass |
| Stripe Checkout — cancel flow | Start checkout, click back/cancel | ✅ Pass — `cancel.html` shown, no charge |
| Stripe Checkout — success flow | Complete payment with test card | ✅ Pass — `success.html` shown, premium unlocked |
| Desktop-only disclaimer | Visit home and game pages | ✅ Pass — disclaimer visible on both |
| "Thanks for playing" banner | Complete Binary Matrix (final world) | ✅ Pass — banner shown on leaderboard with `?completed=true` |
| Background video covers canvas correctly (all 4 worlds) | Visit `/game/` for each world, hard-clear browser cache, observe canvas edges | ✅ Pass — no letterboxing after SAR fix (see Bugs Fixed) |

---

## Browser Compatibility

| Browser | Tested | Result |
|---------|--------|--------|
| Google Chrome | ✅ | Pass |
| Opera GX | ✅ | Pass |
| Microsoft Edge | ✅ | Pass |

---

## Responsiveness Testing

Django pages (home, login, register, leaderboard, store, checkout) were tested using Chrome DevTools responsive mode across breakpoints (375px, 768px, 1024px, 1440px). All pages use Bootstrap 5's grid system and remain usable across screen sizes.

The game itself (`/game/`) requires keyboard input and is explicitly marked as desktop-only via an on-page disclaimer. Mobile on-screen controls are planned for V2.

---

## Code Validation

### W3C HTML Validation

All pages tested via [W3C Markup Validator](https://validator.w3.org/) using rendered HTML (post-Django-render) submitted via Direct Input, since pages behind `@login_required` cannot be validated by URI directly.

| Page | Result |
|------|--------|
| Home | ✅ 0 errors |
| Login | ✅ 0 errors |
| Register | ✅ 0 errors |
| Game | ✅ 0 errors |
| Showroom | ✅ 0 errors |
| Leaderboard | ✅ 0 errors |
| Store | ✅ 0 errors |
| Checkout | ✅ 0 errors |

Issues found and fixed during validation:
- Heading hierarchy errors (skipped levels, missing `<h1>`) corrected across `login.html`, `register.html`, `showroom.html`, `leaderboard.html`, `store.html`
- Missing `aria-hidden` attribute added to background video element in `game.html` (the video is purely decorative, so it is hidden from assistive technology rather than given alt text)
- `{{ form.as_p }}` replaced with `{{ form.as_div }}` in `register.html` to fix invalid nested `<ul>` inside `<p>` from Django's password help text

### CSS Validation

`static/css/style.css` validated via [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) — ✅ 0 errors.

### JavaScript Code Quality (ESLint)

`static/assets/game.js` validated using ESLint (flat config, `eslint.config.js`):

```bash
npx eslint static/assets/game.js
```

✅ 0 errors, 0 warnings.

Configuration notes:
- Browser/Phaser globals (`Phaser`, `window`, `fetch`, `setTimeout`, etc.) and the Django-template-injected variables (`IS_PREMIUM`, `CURRENT_WORLD`, `WORLD_OBS_*`, `FINISH_*`) are declared as globals to avoid false `no-undef` errors
- `giveUp()` is explicitly allowed to appear "unused" within the file, since it is intentionally exposed globally and called via `onclick="giveUp()"` from `game.html`, not from within `game.js` itself

### Python Code Quality (PEP8)

All Python files validated using `pycodestyle` (excluding `venv`, `migrations` and `staticfiles`):

```bash
pycodestyle --exclude=venv,migrations,staticfiles .
```

✅ 0 errors after fixes.

Issues found and fixed:
- Missing newline at end of file (`W292`) — present in nearly every app file, fixed in bulk
- Lines exceeding 79 characters (`E501`) — fixed in `accounts/models.py`, `payments/models.py` and `rundev/settings.py` by extracting intermediate variables (e.g. `status`) or wrapping long string concatenations across multiple lines
- Missing 2 blank lines before a function definition (`E302`) — fixed in `payments/views.py`
- Missing whitespace after `:` and trailing whitespace (`E231`, `W291`) — introduced by editor autoformatting while wrapping `AUTH_PASSWORD_VALIDATORS` entries in `rundev/settings.py`, fixed by rewriting the block manually

---

## Known Issues

### Game Over / Level Complete overlap (rare)

In rare cases, if the player crosses the finish line at the exact same frame an obstacle collision is detected, both the "Game Over" and "Level Complete" messages can render simultaneously. The win condition is checked before the collision check in `update()` to minimise this, but the edge case can still occur under specific timing. This does not affect score submission or game functionality and is difficult to reproduce intentionally.

---

## Bugs Fixed During Development

| Bug | Cause | Fix |
|-----|-------|-----|
| Game Over + Level Complete simultaneous | Win condition checked after collision loop | Win condition moved before collision check with early `return` |
| Leaderboard showing only one player's repeated runs | No aggregation — raw score list ordered by score | Added `Max()`/`Min()` annotation grouping by player + world |
| `TemplateSyntaxError: 'block' title appears more than once` | Old template content not fully replaced before pasting new content | Full file content cleared before pasting replacement |
| `completed` banner causing `TemplateSyntaxError` | `{% if completed %}` placed before `{% extends %}` | Moved inside `{% block content %}` |
| `oc_ladybug.jpg` 404 on Heroku | File renamed to `.png` locally but template still referenced `.jpg` | Updated `game.html` static reference to match renamed file |
| CSS button colors not changing despite `!important` | Bootstrap's own specificity and class structure conflicting with override attempts | Switched strategy — edited button classes directly in HTML templates instead of fighting Bootstrap via CSS |
| `NameError: name 'completed' is not defined` | Context variable referenced before being defined in view | Added `completed = request.GET.get('completed', False)` before `render()` call |
| `giveUp is not defined` | Browser cache serving stale `game.js` without the new function | Hard refresh (`Ctrl+Shift+R`); function also explicitly attached to `window` for robustness |
| Text colour leaking onto buttons/elements inside tables | Generic `.table` selector in `style.css` forced `color: #ff6b6b !important`, which was inherited by child elements (buttons, badges) inside table cells | Removed `.table` from the generic text-colour selector, keeping the coral colour rule scoped to `td`/`th` text only |
| Background videos appeared squashed in game canvas (letterboxing) after GIF → WebM conversion | `ffprobe` showed all 4 WebM files were correctly encoded at 960x540 pixels but carried an incorrect Sample Aspect Ratio (SAR) in their metadata (e.g. `1093:960` instead of `1:1`), causing browsers to apply automatic letterboxing based on the stored aspect ratio rather than actual pixel size | Re-encoded all 4 background videos with `ffmpeg -vf "setsar=1:1"` to force a 1:1 pixel aspect ratio, restoring the correct 16:9 display ratio |
| Fixed background video appeared unchanged after deploy despite correct file on Heroku | Browser was serving the cached (pre-fix) video file from its local media cache; a hard refresh (`Ctrl+Shift+R`) reloads HTML/CSS/JS but does not reliably bust cached `<video>` sources | Verified fix by testing in a private/incognito window (no cache) and by manually clearing cached images/files via browser settings |
| Lighthouse Performance score stuck below 90 (desktop) despite optimisations | Global `bg_main.png` background image (used on every page) was 1.68MB, uncompressed; this was the single largest opportunity flagged by Lighthouse's "Improve image delivery" audit | Compressed `bg_main.png` to an optimised JPEG (164KB, quality 80, ~90% size reduction) using Pillow; desktop Performance score rose from 89 to 91 |
| Lighthouse re-test showed no improvement immediately after the image fix | Browser/Lighthouse was reusing cached version of the old 1.68MB image from a previous visit in the same tab | Re-ran Lighthouse in a fresh private/incognito window, confirming the real score (91) |