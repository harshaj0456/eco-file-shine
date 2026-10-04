# Data Diet frontend

## Overview
Build a polished, mobile-first sustainability analytics app at `/` with a complete demo journey, five-tab navigation, realistic storage data, and interactive simulated cleanup actions. The app will run without sign-in or external storage access; all connections and file actions are clearly presented as demo interactions.

## Experience
- Open with a three-step onboarding flow covering the digital-footprint concept, four core benefits, and mock storage connections.
- Include a prominent **Explore Demo Data** path seeded with 38.4 GB analyzed, a 72/100 score, the requested cleanup opportunities, and 4.8 kg CO₂ / 8.6 kWh impact.
- Present the experience as a native-feeling mobile app; on larger screens, offer a control to switch between a centered phone frame and a wider dashboard view.
- Keep a persistent five-item bottom navigation: Home, Analyze, Diet, Insights, Profile.

## Screens and interactions
- **Home:** score ring, segmented storage bar, impact summary, methodology dialog, and reviewable opportunity cards.
- **Analyze:** staged scanning animation followed by a selectable donut chart and category details.
- **File review:** searchable, filterable, sortable duplicate groups and files with thumbnails, recommendations, source locations, and Keep / Compress / Archive / Delete actions.
- **Live demo state:** cleanup actions reduce used storage and estimated impact, raise the score, update charts and goals, and display toast confirmations with undo where appropriate.
- **Diet:** sustainability ladder, reduction-goal progress, and weekly challenges with point rewards.
- **Insights:** historical storage chart, CO₂ and energy savings, plus a Before/After simulator with selectable cleanup actions.
- **Profile:** mock connected sources, lifetime stats, notifications, assumptions, privacy explanation, and Green Storage education.
- Educational content will use focused dialogs or sheets for Green Storage, privacy-first metadata analysis, and carbon methodology.

## Visual direction
- Premium sustainability-tech analytics aesthetic: off-white foundation, deep charcoal typography, soft leaf green, muted teal, and restrained amber status accents.
- Compact information hierarchy, crisp low-radius surfaces, meaningful chart color differentiation, clear touch targets, and subtle motion with reduced-motion support.
- Use a distinctive editorial sans-serif pairing loaded in the document head, Lucide icons, Recharts, and CSS micro-animations.

## Technical approach
- Keep the app as a single TanStack route because the five tabs behave as one app shell rather than separate shareable pages.
- Build focused React components for onboarding, app shell/navigation, dashboard visuals, charts, file review, dialogs, and shared controls.
- Centralize mock data and demo state so actions remain synchronized across every screen during the session.
- Add app-specific metadata for title, description, Open Graph, and Twitter cards.
- Verify the complete flow in the running preview at mobile and desktop widths, including onboarding, scanning, drilldown, file actions, dialogs, simulator controls, and layout stability.
