import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection("journal", ({ data }) => !data.draft);
  const paths = ["/", "/journal", ...posts.map((post) => `/journal/${post.id}`)];
  const urls = site ? paths.map((path) => `<url><loc>${escapeXml(new URL(path, site).href)}</loc></url>`).join("") : "";
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
