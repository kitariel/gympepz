"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Settings, Palette, Globe, Scale } from "lucide-react";

export function PreferencesCard() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<string>("en");
  const [units, setUnits] = useState<"kg" | "lb">("kg");

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4 text-teal-600" />
          Preferences
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          App experience settings
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2.5">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs font-medium">Theme</div>
              <div className="text-[10px] text-muted-foreground capitalize">{theme ?? "system"}</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button 
              type="button" 
              size="sm" 
              variant={theme === "light" ? "default" : "outline"} 
              onClick={() => setTheme("light")}
              className="h-7 text-[10px] px-2"
            >
              Light
            </Button>
            <Button 
              type="button" 
              size="sm" 
              variant={theme === "dark" ? "default" : "outline"} 
              onClick={() => setTheme("dark")}
              className="h-7 text-[10px] px-2"
            >
              Dark
            </Button>
            <Button 
              type="button" 
              size="sm" 
              variant={!theme || theme === "system" ? "default" : "outline"} 
              onClick={() => setTheme("system")}
              className="h-7 text-[10px] px-2"
            >
              System
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs font-medium">Language</div>
              <div className="text-[10px] text-muted-foreground">
                {language === "en" ? "English" : language === "es" ? "Spanish" : language}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button 
              type="button" 
              size="sm" 
              variant={language === "en" ? "default" : "outline"} 
              onClick={() => setLanguage("en")}
              className="h-7 text-[10px] px-2"
            >
              EN
            </Button>
            <Button 
              type="button" 
              size="sm" 
              variant={language === "es" ? "default" : "outline"} 
              onClick={() => setLanguage("es")}
              className="h-7 text-[10px] px-2"
            >
              ES
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2.5">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs font-medium">Units</div>
              <div className="text-[10px] text-muted-foreground">
                {units === "kg" ? "Kilograms" : "Pounds"}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button 
              type="button" 
              size="sm" 
              variant={units === "kg" ? "default" : "outline"} 
              onClick={() => setUnits("kg")}
              className="h-7 text-[10px] px-2"
            >
              kg
            </Button>
            <Button 
              type="button" 
              size="sm" 
              variant={units === "lb" ? "default" : "outline"} 
              onClick={() => setUnits("lb")}
              className="h-7 text-[10px] px-2"
            >
              lb
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
