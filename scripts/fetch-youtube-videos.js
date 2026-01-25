#!/usr/bin/env node

const query = process.argv.slice(2).join(" ") || "bench press";
const maxResults = Number(process.env.YT_MAX_RESULTS || "5");
const apiKey = 'AIzaSyDSdgZq0iyCX0yzit1kGI47x7x6dhlUTz0'

if (!apiKey) {
  console.error("Missing YOUTUBE_API_KEY or YT_API_KEY environment variable.");
  process.exit(1);
}

const params = new URLSearchParams({
  part: "snippet",
  q: query,
  maxResults: String(maxResults),
  type: "video",
  safeSearch: "strict",
  key: apiKey,
});

const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;

async function main() {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${text}`);
  }
  const data = await res.json();
  const items = (data.items || []).map((item) => {
    const id = item.id?.videoId || "";
    return {
      id,
      title: item.snippet?.title || "",
      channelTitle: item.snippet?.channelTitle || "",
      url: id ? `https://www.youtube.com/watch?v=${id}` : "",
    };
  });
  console.log(JSON.stringify({ query, results: items }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
