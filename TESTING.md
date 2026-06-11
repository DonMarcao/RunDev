# Testing Documentation

## Automated Tests

All automated tests can be run with:

```bash
python manage.py test
```

Total: **31 tests across 4 apps — all passing.**

---

### Accounts App (8 tests)

| Test | Description | Expected |
|------|-------------|----------|
| `test_profile_created` | New UserProfile defaults to free and world 1 | is_premium=False, worlds_unlocked=1 |
| `test_profile_str` | UserProfile string representation | Contains username |
| `test_register_view_get` | Register page loads | Status 200 |
| `test_register_view_post` | Register creates new user | User exists in database |
| `test_login_view_get` | Login page loads | Status 200 |
| `test_login_view_post` | Login redirects on success | Status 302 |
| `test_logout_redirects` | Logout redirects | Status 302 |
| `test_game_requires_login` | Game page blocked for anonymous users | Redirect to login |

---

### Leaderboard App (9 tests)

| Test | Description | Expected |
|------|-------------|----------|
| `test_score_created` | Score saves correctly | Correct values in database |
| `test_score_str` | Score string representation | Contains username |
| `test_score_label_default_empty` | New score has empty label | label='' |
| `test_leaderboard_requires_login` | Leaderboard blocked for anonymous | Status 302 |
| `test_leaderboard_blocked_for_free_user` | Free user sees locked page | locked.html template |
| `test_leaderboard_accessible_for_premium` | Premium user sees leaderboard | leaderboard.html template |
| `test_update_score_label` | User can update score label | Label saved in database |
| `test_delete_score` | User can delete own score | Score removed from database |
| `test_cannot_delete_other_user_score` | User cannot delete another user's score | Score still exists |

---

### Payments App (6 tests)

| Test | Description | Expected |
|------|-------------|----------|
| `test_checkout_requires_login` | Checkout blocked for anonymous | Status 302 |
| `test_checkout_view_get` | Checkout page loads | Status 200 |
| `test_success_sets_premium` | Payment success sets is_premium | is_premium=True |
| `test_success_unlocks_world_2` | Payment success unlocks world 2 | worlds_unlocked=2 |
| `test_cancel_view` | Cancel page loads | Status 200 |
| `test_purchase_model_str` | Purchase string representation | Contains username |

---

### Game App (8 tests)

| Test | Description | Expected |
|------|-------------|----------|
| `test_home_view` | Home page loads | Status 200 |
| `test_game_requires_login` | Game blocked for anonymous | Status 302 |
| `test_game_view_logged_in` | Game loads for logged in user | Status 200 |
| `test_game_context_free_user` | Free user context correct | is_premium=False, worlds_unlocked=1 |
| `test_game_context_premium_user` | Premium user context correct | is_premium=True |
| `test_submit_score` | Score submission returns ok | status='ok' in response |
| `test_showroom_requires_login` | Showroom blocked for anonymous | Status 302 |
| `test_showroom_view` | Showroom loads for logged in user | Status 200 |

---

## Manual Testing

### Authentication

| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Register | Go to /accounts/register/, fill form, submit | Account created, redirected to game | ✅ |
| Login | Go to /accounts/login/, fill form, submit | Logged in, redirected to game | ✅ |
| Logout | Click logout in navbar | Logged out, redirected to home | ✅ |
| Login required | Access /game/ without login | Redirected to login page | ✅ |

### Game

| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Player movement | Use arrow keys | Player moves in 4 directions | ✅ |
| Canvas boundaries | Move player to edges | Player stops at canvas limits | ✅ |
| Collision | Move player into obstacle | Game over triggered | ✅ |
| Timer | Start game, wait | Timer counts up correctly | ✅ |
| Level complete | Reach finish line | Level complete screen shown | ✅ |
| Game over restart | Press SPACE after game over | Game restarts | ✅ |
| Score submission | Complete level | Score saved to database | ✅ |
| Free user redirect | Complete level as free user | Redirected to showroom after 2s | ✅ |
| Premium user | Complete level as premium | Press SPACE to restart shown | ✅ |

### Premium Flow

| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Stripe checkout | Click Unlock Premium | Redirected to Stripe | ✅ |
| Test payment | Use card 4242 4242 4242 4242 | Payment accepted | ✅ |
| Premium activated | After payment | is_premium=True, worlds_unlocked=2 | ✅ |
| Leaderboard access | Login as premium, go to /leaderboard/ | Leaderboard visible | ✅ |
| Leaderboard locked | Login as free, go to /leaderboard/ | Locked page shown | ✅ |

### Score CRUD

| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Create score | Complete a level | Score appears in leaderboard | ✅ |
| Read scores | Go to /leaderboard/ as premium | All scores visible | ✅ |
| Update label | Type label, click Save | Label updated in database | ✅ |
| Delete score | Click Delete, confirm | Score removed from list | ✅ |
| Cannot delete other user score | Try to delete score not owned | 404 returned | ✅ |

---

## Validators

| Tool | File | Result |
|------|------|--------|
| W3C HTML Validator | All templates | Pass — no errors |
| W3C CSS Validator (Jigsaw) | static/css/style.css | Pass — no errors |
| PEP8 | All Python files | Pass — no issues |