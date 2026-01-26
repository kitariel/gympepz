#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const getArg = (key) => {
  const found = args.find((arg) => arg.startsWith(`${key}=`));
  return found ? found.slice(key.length + 1) : null;
};

const apiKey = 'AIzaSyCnTJG5J8rUlS6GyNsNnsYL-7pyBauacDs'
// const apiKey = 'AIzaSyC0ms-duYyOlLDcBTf1I0P-eVxjKrG4jNQ'
// const apiKey = 'AIzaSyDSdgZq0iyCX0yzit1kGI47x7x6dhlUTz0'
const queryName = getArg("--name");
const limit = Number(getArg("--limit") || "100");
const maxResults = Number(getArg("--maxResults") || "5");
const delayMs = Number(getArg("--delayMs") || "10000");

if (!apiKey) {
  console.error("Missing YOUTUBE_API_KEY or YT_API_KEY environment variable.");
  process.exit(1);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchVideos(query) {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    maxResults: String(maxResults),
    type: "video",
    safeSearch: "strict",
    key: apiKey,
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${text}`);
  }
  const data = await res.json();
  return (data.items || [])
    .map((item) => item.id?.videoId)
    .filter(Boolean);
}

async function main() {
  const exercises = await prisma.exercise.findMany({
    select: { id: true, name: true, youtubeVideoIds: true },
  });

  const targets = queryName
    ? exercises.filter((ex) => ex.name.toLowerCase() === queryName.toLowerCase())
    : exercises.filter((ex) => !ex.youtubeVideoIds || ex.youtubeVideoIds.length === 0);

  const slice = targets.slice(0, limit);
  console.log(`Updating ${slice.length} exercises (maxResults=${maxResults}, delayMs=${delayMs})`);

  for (let i = 0; i < slice.length; i += 1) {
    const ex = slice[i];
    const query = `${ex.name} exercise form`;
    console.log(`[${i + 1}/${slice.length}] ${ex.name}`);

    try {
      const videoIds = await fetchVideos(query);
      await prisma.exercise.update({
        where: { id: ex.id },
        data: { youtubeVideoIds: videoIds },
      });
      console.log(`  -> ${videoIds.length} videos saved`);
    } catch (err) {
      console.error(`  ! failed: ${err.message}`);
    }

    if (i < slice.length - 1) {
      await delay(delayMs);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
