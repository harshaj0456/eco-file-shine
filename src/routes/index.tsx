import { createFileRoute } from "@tanstack/react-router";
import { DataDietApp } from "@/components/data-diet/DataDietApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Data Diet — Digital Storage Sustainability" },
      { name: "description", content: "Analyze digital storage, reduce file waste, and understand your estimated energy and carbon impact." },
      { property: "og:title", content: "Data Diet — Digital Storage Sustainability" },
      { property: "og:description", content: "Clean your digital footprint. Keep what matters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DataDietApp,
});
