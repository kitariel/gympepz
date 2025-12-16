"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function PreferencesCard() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<string>("en");
  const [units, setUnits] = useState<"kg" | "lb">("kg");

  return (
    <Card className="bg-card text-card-foreground from-primary to-primary/80 rounded-xl border border-none shadow-sm">
      <CardHeader className="border-b py-4">
        <div>
          <div className="text-sm font-semibold">Preferences</div>
          <div className="text-muted-foreground text-xs">App experience</div>
        </div>
      </CardHeader>
      <CardContent className="text-card-foreground rounded-b-xl pb-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Theme</div>
              <div className="text-muted-foreground text-xs capitalize">{theme ?? "system"}</div>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>Light</Button>
              <Button type="button" size="sm" variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>Dark</Button>
              <Button type="button" size="sm" variant={!theme || theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")}>System</Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Language</div>
              <div className="text-muted-foreground text-xs">{language === "en" ? "English" : language === "es" ? "Spanish" : language}</div>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={language === "en" ? "default" : "outline"} onClick={() => setLanguage("en")}>English</Button>
              <Button type="button" size="sm" variant={language === "es" ? "default" : "outline"} onClick={() => setLanguage("es")}>Spanish</Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Units</div>
              <div className="text-muted-foreground text-xs">{units === "kg" ? "Kilograms" : "Pounds"}</div>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={units === "kg" ? "default" : "outline"} onClick={() => setUnits("kg")}>kg</Button>
              <Button type="button" size="sm" variant={units === "lb" ? "default" : "outline"} onClick={() => setUnits("lb")}>lb</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
