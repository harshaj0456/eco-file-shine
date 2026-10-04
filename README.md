# Data Diet Dashboard

Build a polished, modern mobile-first frontend for "Data Diet", a sustainability-focused digital storage optimization app.

Key requirements:
1. Product Concept & Design:
- Tagline: "Clean your digital footprint. Keep what matters."
- Aligned with SDG 12 (Responsible Consumption) and SDG 13 (Climate Action).
- Aesthetics: Premium sustainability-tech / fintech analytics dashboard feel (not generic phone cleaner). Soft green and muted teal accents on off-white/light background with deep charcoal text. Responsive mobile-first design (centered mobile phone frame on desktop with toggle option).

2. Core Navigation (5 tabs):
- Home, Analyze, Diet, Insights, Profile with smooth bottom navigation bar.

3. Onboarding & Demo Flow:
- 3-screen onboarding: Welcome (footprint concept), What Data Diet Does (4 feature cards), Connect Storage (Google Drive, Device, OneDrive, Dropbox mock connections).
- Prominent "Explore Demo Data" mode preloaded with 38.4 GB analyzed, 72/100 score, 12 GB duplicates, 8 GB old videos, 5 GB downloads, 7 GB rarely accessed, 4.8 kg CO2, 8.6 kWh.

4. Screens & Features:
- Home Dashboard: Circular score ring (72/100, +8 pts), segmented storage footprint bar (38.4 GB / 100 GB across Photos, Videos, Documents, Downloads, Backups, Other), Quick Impact card (CO2, kWh) with "How is this calculated?" modal, Biggest Opportunities cards with review CTAs.
- Analyze Screen: Animated multi-stage scanning simulation (Reading metadata, Detecting duplicates, Checking file age, Calculating impact) -> Interactive Recharts Donut chart with selectable category drilldown.
- Duplicate Files & File Review Screen: Recoverable duplicate groups (thumbnails, copy count, location, smart recommendations), individual file actions (Keep, Compress, Archive, Delete) with clear impact consequences. Simulated actions dynamically update storage, score, and impact with toast notifications.
- Diet Screen: Sustainability status ladder (0-100: Heavy to Excellent), personal reduction goals with progress bars, weekly gamified challenges with points.
- Insights Screen: Storage over time historical chart, CO2 & kWh savings visualization, interactive Before/After Digital Diet Simulator (toggle actions to preview savings).
- Educational / Green IT: Green Storage explainer modal/page (why storage uses energy, SSD vs HDD vs Cloud), Carbon calculation methodology modal, Privacy First metadata analysis explainer.
- Profile Screen: Connected sources, stats, notification toggles, calculation assumptions.

5. Reusable Components & Realistic Mock Data:
- Build with React, Tailwind CSS, Lucide icons, Recharts, and Framer Motion / CSS micro-animations. Support search/filter, sorting, and seamless demo storyline.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8f4e2cf8-5bf1-4a47-b878-8e3b2c4db932).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
