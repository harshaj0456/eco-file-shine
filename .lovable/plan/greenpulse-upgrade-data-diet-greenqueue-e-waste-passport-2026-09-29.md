# GreenPulse upgrade (Data Diet + GreenQueue + E-Waste Passport)

This is a very large upgrade, so it is split into phases. Each phase ends with something working and tested. Everything that already works in Data Diet stays.

## Phase 1: Accounts, saved data, and the new app frame
- Turn on Lovable Cloud with email and Google sign-in. Add a sign-in page. Each user's data is saved to their own account.
- A setup wizard on first sign-in: name, mode (Personal / Student / Organization), region, and which modules to turn on. Modules that are off are hidden and left out of the score.
- Rename the app to GreenPulse and add a header with a bell icon, a search command box (Ctrl/Cmd+K), and a Settings page.
- A profile page you can edit. Some labels change with the mode (for example "devices" becomes "lab assets").

## Phase 2: Settings and a Data Diet you can set up yourself
- Settings tabs: General, Scoring, Data Diet, GreenQueue, Devices, Notifications, Appearance, Data & Privacy.
- Score weight sliders that always add up to 100%, with a live preview of the score.
- Data Diet rule builder ("IF older than N months THEN Archive"). You can drag rules to change their order, protect folders, and create your own categories. Changes apply right away.
- Units, currency and electricity price. Appearance: light, dark or system theme, 5 accent colors, spacing, text size and reduce motion.
- Export and import JSON, export CSV, a printable report page, reset demo data, and delete all data.
- Treemap view of storage. Drag files onto Keep, Compress, Archive or Delete. Select several files with shift-click. Undo and redo up to 10 steps. On phones, swipe a file to act on it.

## Phase 3: GreenQueue and E-Waste Passport
- GreenQueue: a 24-hour carbon chart you can edit by dragging bars or pasting CSV, plus region presets and quiet hours. Drag a job to any hour to compare its CO2 and cost, with deadline warnings. "Simulate day" plays the day forward with a running CO2 counter.
- Passport: device cards that flip over, a lifecycle timeline, a Repair vs Replace slider, a compliance checklist, and your own device types and fields.

## Phase 4: Goals, dashboard and game features
- Build your own goals and join challenge templates. Goals track streaks.
- Dashboard widgets you can drag, resize, hide and save as named layouts.
- Tags and notes on files, jobs and devices.
- XP, levels, badges, confetti, a streak flame and a practice leaderboard.
- "What if" toggles on action items, a guided tour, "Why?" explanations, and a Green Assistant that answers from rules (no outside AI).

## Phase 5: Notifications
- Pop-up messages, plus a notification center with groups, filters, search, read/unread, dismiss, clear all and undo.
- Browser notifications with a short explainer before asking permission. A background helper shows action buttons.
- Every trigger in the brief can be turned on or off separately, with its own limits and message template. You can also create your own reminders.
- Preferences: quiet hours, snooze, digest frequency, test messages, and a history log.
- A checker runs every 45 seconds while the app is open and avoids duplicate alerts. It also shows alerts that came due while you were away.
- Email digests are real: they are sent on a schedule through Lovable Cloud email, after you set up an email sender domain. Mobile push is shown as a demo only.

## How it's built (technical details)
- Cloud tables with row-level security: profiles, user_state (versioned JSON for settings, rules, goals, layouts and tags), notifications, reminders and devices/jobs. Roles are not needed yet.
- A shared store keeps the app in sync with Cloud and a local cache, with a schema version and migrations. Notification scheduling lives in src/lib/notifications.ts, and the checker is triggered by events and a timer.
- A registered service worker handles browser notifications. Scheduled email uses a public cron route plus pg_cron.
- Split the current single large file into feature folders. Use virtualized lists for long file tables and memoize calculations.
- Test each phase in the preview before starting the next one.

## Needs from you
- Email digests need an email sender domain. The setup step comes in Phase 5.
