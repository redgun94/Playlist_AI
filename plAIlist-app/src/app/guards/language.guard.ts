import { CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

const routeMap: Record<string, Record<string, string>> = {
  'iniciar-sesion': { es: 'iniciar-sesion', en: 'login' },
  'registro':        { es: 'registro',        en: 'signup' },
  'login':           { es: 'iniciar-sesion',  en: 'login' },
  'signup':          { es: 'registro',        en: 'signup' },
};

export const languageGuard: CanActivateChildFn = (_route, state) => {
  const translate = inject(TranslateService);
  const router = inject(Router);
  const langService = inject(LanguageService);

  const lang = langService.detectLanguage();
  langService.saveLanguage(lang);

  translate.setDefaultLang('en');
  translate.use(lang);

  const currentPath = state.url.split('?')[0].replace(/^\//, '');
  const mappedPath = routeMap[currentPath]?.[lang];

  if (mappedPath && mappedPath !== currentPath) {
    router.navigate([`/${mappedPath}`], { replaceUrl: true });
    return false;
  }

  return true;
};
