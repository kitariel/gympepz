"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Bookmark,
  Heart,
  MessageCircle,
  Eye,
  Bell,
  Droplet,
  Moon,
  CheckCircle,
  XCircle,
  Edit2,
  MoreVertical,
} from "lucide-react";

function Header() {
  return (
    <div className="mb-10 flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-light text-gray-800">Hey, Need help?</h1>
        <p className="text-gray-400">Just ask me anything!</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <div className="text-2xl">🌊</div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-light text-gray-800">19</div>
          <div className="text-sm text-gray-600">
            Tue,
            <br />
            December
          </div>
        </div>
        <Button className="h-12 rounded-full bg-emerald-800 px-8 text-white hover:bg-emerald-900">
          Show my Task
        </Button>
        <Button variant="ghost" size="icon" className="h-12 w-12">
          <Calendar className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function AISummary() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const completed = [false, true, true, true, false, false, false];

  return (
    <Card className="rounded-xl p-6 shadow-sm">
      <h3 className="mb-6 text-sm font-semibold">AI Summary</h3>

      <div className="mb-6 flex items-center justify-between">
        <div className="text-center">
          <div className="text-sm text-gray-600">648</div>
          <div className="text-xs text-gray-400">consumed</div>
        </div>

        <div className="relative h-32 w-32">
          <svg className="h-32 w-32 -rotate-90 transform">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#f0f0f0"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#10b981"
              strokeWidth="8"
              fill="none"
              strokeDasharray="352"
              strokeDashoffset="88"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-light">2,181</div>
            <div className="text-xs text-gray-400">kcal total</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-600">2,500</div>
          <div className="text-xs text-gray-400">target</div>
        </div>
      </div>

      <div className="mb-6 flex justify-between gap-4">
        <div>
          <div className="mb-1 text-xs text-gray-500">Carbohydrates</div>
          <div className="h-1 w-20 rounded-full bg-orange-500" />
          <div className="mt-1 text-xs font-medium">23/72g</div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-500">Protein</div>
          <div className="h-1 w-20 rounded-full bg-emerald-500" />
          <div className="mt-1 text-xs font-medium">15/20g</div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-500">Fat</div>
          <div className="h-1 w-20 rounded-full bg-yellow-500" />
          <div className="mt-1 text-xs font-medium">125/220g</div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-center text-xs text-gray-600">
        You&apos;re on track for your calorie goal today! Keep it up, okay!
      </div>
    </Card>
  );
}

function StreakWidget() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const completed = [false, true, true, true, false, false, false];

  return (
    <Card className="rounded-xl p-6 text-center shadow-sm">
      <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-900">
        <div className="text-5xl font-bold text-white">3</div>
      </div>
      <div className="mb-6 text-lg font-medium text-gray-800">
        day streak this week!
      </div>

      <div className="flex justify-center gap-2">
        {days.map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-1">
            <div className="text-xs text-gray-400">{day}</div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${completed[i] ? "bg-emerald-700" : "bg-gray-200"}`}
            >
              {completed[i] && <CheckCircle className="h-5 w-5 text-white" />}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 p-4">
        <div className="mb-2 text-3xl font-light">22</div>
        <div className="mb-2 text-sm font-medium text-gray-800">
          Longest Streak
        </div>
        <div className="text-xs text-gray-500">
          You are on fire! Keep using the sandow app to gain more streak!
        </div>
      </div>
    </Card>
  );
}

function WorkoutSchedule() {
  const workouts = [
    {
      time: "08:00",
      title: "Homemade Plain Waffles",
      intensity: "Intense",
      duration: "30 min",
      type: "Cardio",
    },
    {
      time: "09:00",
      title: "Homemade Plain Waffles",
      intensity: "Intense",
      duration: "30 min",
      type: "Cardio",
    },
    {
      time: "10:00",
      title: "Homemade Plain Waffles",
      intensity: "Intense",
      duration: "30 min",
      type: "Cardio",
    },
  ];

  return (
    <Card className="rounded-xl p-6 shadow-sm">
      <h3 className="mb-6 text-sm font-semibold">Workout Schedule (Daily)</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-4 border-l-2 border-emerald-700 pl-4">
          <div className="text-sm font-medium text-gray-600">08:00</div>
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-gray-200 p-3">
            <div className="h-12 w-12 rounded-lg bg-gray-100" />
            <div className="flex-1">
              <div className="mb-1 text-sm font-medium">
                Homemade Plain Waffles
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-blue-500" />
                  Intense
                </span>
                <span>30 min</span>
                <span>Cardio</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border-l-2 border-gray-200 pl-4">
          <div className="text-sm font-medium text-gray-600">07:00</div>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
          <div className="text-sm text-gray-400">No Schedule</div>
        </div>

        <div className="flex items-center gap-4 border-l-2 border-emerald-700 pl-4">
          <div className="text-sm font-medium text-gray-600">09:00</div>
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-gray-200 p-3">
            <div className="h-12 w-12 rounded-lg bg-gray-100" />
            <div className="flex-1">
              <div className="mb-1 text-sm font-medium">
                Homemade Plain Waffles
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-blue-500" />
                  Intense
                </span>
                <span>30 min</span>
                <span>Cardio</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l-2 border-emerald-700 pl-4">
          <div className="text-sm font-medium text-gray-600">10:00</div>
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-gray-200 p-3">
            <div className="h-12 w-12 rounded-lg bg-gray-100" />
            <div className="flex-1">
              <div className="mb-1 text-sm font-medium">
                Homemade Plain Waffles
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-blue-500" />
                  Intense
                </span>
                <span>30 min</span>
                <span>Cardio</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
          <div className="text-sm text-gray-400">No Schedule</div>
        </div>
      </div>
    </Card>
  );
}

function FeaturedWorkout() {
  return (
    <Card className="overflow-hidden rounded-xl bg-black text-white shadow-sm">
      <div className="relative h-64 bg-gradient-to-br from-gray-900 to-black">
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23000' width='400' height='300'/%3E%3C/svg%3E"
          alt=""
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute top-4 left-4">
          <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-medium">
            Beginner
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/10 backdrop-blur"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="mb-4 text-2xl font-semibold">Total Body Circuit</h3>

        <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
          <div className="h-6 w-6 rounded-full bg-gray-700" />
          <span>Coach Arnold White</span>
        </div>

        <div className="flex gap-6">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="text-xs text-gray-400">kcal</div>
            </div>
            <div className="text-2xl font-semibold">551</div>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="text-xs text-gray-400">minutes</div>
            </div>
            <div className="text-2xl font-semibold">25</div>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="text-xs text-gray-400">score</div>
            </div>
            <div className="text-2xl font-semibold">+3</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MyActiveWorkout() {
  return (
    <Card className="rounded-xl p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold">My Active Workout</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gray-100" />
          <div className="flex-1">
            <div className="mb-1 text-sm font-medium">
              Full-Body Strength & Conditioning Blast
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>32min</span>
              <span>HIIT</span>
            </div>
          </div>
        </div>
        <div className="h-1 w-full rounded-full bg-gray-200">
          <div className="h-1 w-full rounded-full bg-emerald-700" />
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle className="h-4 w-4" />
          <span>Completed</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gray-100" />
          <div className="flex-1">
            <div className="mb-1 text-sm font-medium">
              Full-Body Strength & Conditioning Blast
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>32min</span>
              <span>HIIT</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function NutritionScore() {
  return (
    <Card className="rounded-xl p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 p-2">
              <div className="text-emerald-700">🌿</div>
            </div>
          </div>
          <div className="text-5xl font-light">62.7</div>
          <div className="text-lg font-medium text-gray-800">
            Nutrition Score
          </div>
          <div className="text-sm text-gray-500">
            Let&apos;s start logging your first meal!
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span>1d</span>
          <span>1w</span>
          <span>1m</span>
          <span>1y</span>
          <span className="font-medium text-gray-800">All Time</span>
        </div>

        <div className="flex h-40 items-end justify-between gap-2">
          {[1200, 1800, 2000, 1900, 1600, 1400, 1900].map((val, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full overflow-hidden rounded-t-lg bg-linear-to-t from-emerald-800 to-orange-500"
                style={{ height: `${(val / 2000) * 140}px` }}
              />
              <div className="text-[10px] text-gray-400">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full rounded-full bg-emerald-800 py-6 text-white hover:bg-emerald-900">
        + Log New Meal
      </Button>
    </Card>
  );
}

function NutritionGoal() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const status = [true, false, true, false, true, true, true];

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Nutrition Goal</h3>
        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
          See All
        </Button>
      </div>

      <div className="mb-6">
        <div className="mb-2 text-3xl font-light">2,000 calorie</div>
        <div className="text-xs text-gray-500">
          Based on your health state, we recommend you eat 2,000cal daily
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 text-sm font-medium">Todays&apos; Progress</div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-gray-600">Calories</span>
          <span className="font-medium">83% (1014/1220kcal)</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700" />
        </div>
      </div>

      <div className="mb-6 flex justify-between">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${status[i] ? "border-emerald-700 bg-emerald-50" : "border-gray-300"}`}
            >
              {status[i] ? (
                <CheckCircle className="h-5 w-5 text-emerald-700" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <div className="text-xs text-gray-600">{day}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Nutrition History</h3>
        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
          See All
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100" />
          <div>
            <div className="text-sm font-medium">285kcal</div>
            <div className="text-xs text-gray-500">Morning Oatmeal</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">Jan 23</div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SocialFeed() {
  const posts = [
    {
      user: "Makise Kurisu",
      time: "Posted 3m ago",
      verified: true,
      text: "Just done a quick HIIT session with my gang! Don't forget to hydrate, Y'all! 💧 #HydrationChallenge #DrinkMoreWater",
      image: true,
      stats: { minutes: 52, kcal: 128, score: 3 },
      views: 5874,
      likes: 215,
      comments: 11,
    },
    {
      user: "Jamie D. Jones",
      time: "Posted 3m ago",
      verified: true,
      text: "Just received a personalized health insight from sandow AI. It's amazing how much data can be turned into actionable advice! ✨ What's your latest AI recommendation? #fitnessAI #SmartWellness #TechForHealth #HealthInsights",
      views: 5874,
      likes: 215,
      comments: 11,
    },
  ];

  return (
    <div className="space-y-6">
      {posts.map((post, i) => (
        <Card key={i} className="rounded-xl p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.user}</span>
                  {post.verified && (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="text-xs text-gray-500">{post.time}</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <p className="mb-4 text-sm text-gray-700">{post.text}</p>

          {post.image && (
            <div className="mb-4 overflow-hidden rounded-lg bg-gray-100">
              <div className="relative h-48 bg-gradient-to-br from-orange-200 to-pink-200">
                <div className="absolute bottom-4 left-4 flex gap-4">
                  <div className="rounded-lg bg-black/50 px-3 py-2 backdrop-blur">
                    <div className="text-xs text-white/70">Minutes</div>
                    <div className="text-xl font-semibold text-white">
                      {post.stats.minutes}
                    </div>
                  </div>
                  <div className="rounded-lg bg-black/50 px-3 py-2 backdrop-blur">
                    <div className="text-xs text-white/70">kcal</div>
                    <div className="text-xl font-semibold text-white">
                      {post.stats.kcal}
                    </div>
                  </div>
                  <div className="rounded-lg bg-black/50 px-3 py-2 backdrop-blur">
                    <div className="text-xs text-white/70">Score</div>
                    <div className="text-xl font-semibold text-white">
                      {post.stats.score}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post.comments}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              Save
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Notifications() {
  const notifications = [
    {
      icon: Droplet,
      title: "Workout Reminder",
      time: "1h ago",
      text: "You have an upcoming 'Total Body Circuit' Workout 1h from now! 🏃",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Moon,
      title: "Sleep Reminder",
      time: "1h ago",
      text: "You have a sleep schedule 30min from now. Let's turn off your phone!",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Droplet,
      title: "Time to hydrate!",
      time: "1h ago",
      text: "",
      color: "bg-cyan-100 text-cyan-600",
    },
  ];

  return (
    <Card className="rounded-xl p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
          See All
        </Button>
      </div>

      <div className="space-y-5">
        {notifications.map((notif, i) => {
          const Icon = notif.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${notif.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{notif.title}</span>
                  <span className="text-xs text-gray-400">{notif.time}</span>
                </div>
                {notif.text && (
                  <p className="text-xs text-gray-600">{notif.text}</p>
                )}
                {notif.text && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-emerald-700"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Header />

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3 space-y-8">
            <AISummary />
            <WorkoutSchedule />
          </div>

          <div className="col-span-3 space-y-8">
            <StreakWidget />
            <FeaturedWorkout />
            <MyActiveWorkout />
          </div>

          <div className="col-span-3 space-y-8">
            <NutritionScore />
            <NutritionGoal />
          </div>

          <div className="col-span-3 space-y-8">
            <SocialFeed />
            <Notifications />
          </div>
        </div>
      </div>
    </div>
  );
}
