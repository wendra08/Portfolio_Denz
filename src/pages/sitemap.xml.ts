import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { projects } from "../data/portfolio";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection("journal", ({ data }) => !data.draft);
  const paths = ["/", "/journal", "/portfolio", ...posts.map((post) => `/journal/${post.id}`), ...projects.map((project) => `/portfolio/${project.slug}`)];
  const urls = site ? paths.map((path) => `<url><loc>${escapeXml(new URL(path, site).href)}</loc></url>`).join("") : "";
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
