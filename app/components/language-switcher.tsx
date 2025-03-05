"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/app/i18n";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-TW' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <Languages className="h-4 w-4" />
      {language === 'en' ? '中文' : 'English'}
    </Button>
  );
} 