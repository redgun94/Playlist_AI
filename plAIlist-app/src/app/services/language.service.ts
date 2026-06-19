import { Injectable } from '@angular/core';

export type SupportedLanguage = 'es' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'plAIlist_lang';

  detectLanguage(): SupportedLanguage {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
    }

    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language?.split('-')[0];
      if (browserLang === 'es') return 'es';
    }

    try {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      if (locale?.startsWith('es')) return 'es';
    } catch {}

    return 'en';
  }

  saveLanguage(lang: SupportedLanguage): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }
}
