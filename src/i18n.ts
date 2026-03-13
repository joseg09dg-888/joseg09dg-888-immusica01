import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "catalog": "Catalog",
        "stats": "Stats",
        "splits": "Splits",
        "wallet": "Wallet",
        "services": "Services",
        "plans": "Plans",
        "connect": "Connect Spotify",
        "disconnect": "Disconnect Account"
      },
      "home": {
        "hero_title": "Neural Music",
        "hero_subtitle": "Rebellion",
        "hero_desc": "The first AI-powered ecosystem for independent artists. Take control of your career with neural data and elite strategy.",
        "get_started": "Initialize Neural Link",
        "view_plans": "View Plans"
      },
      "dashboard": {
        "welcome": "Welcome back,",
        "core_online": "Neural Core Online",
        "current_tier": "Current Tier",
        "performance": "Neural Performance",
        "streams": "Global Streams",
        "revenue": "Neural Revenue",
        "analytics": "View Neural Analytics"
      }
    }
  },
  es: {
    translation: {
      "nav": {
        "dashboard": "Panel",
        "catalog": "Catálogo",
        "stats": "Estadísticas",
        "splits": "Splits",
        "wallet": "Billetera",
        "services": "Servicios",
        "plans": "Planes",
        "connect": "Conectar Spotify",
        "disconnect": "Desconectar Cuenta"
      },
      "home": {
        "hero_title": "Música Neural",
        "hero_subtitle": "Rebelión",
        "hero_desc": "El primer ecosistema impulsado por IA para artistas independientes. Toma el control de tu carrera con datos neurales y estrategia de élite.",
        "get_started": "Iniciar Enlace Neural",
        "view_plans": "Ver Planes"
      },
      "dashboard": {
        "welcome": "Bienvenido de nuevo,",
        "core_online": "Núcleo Neural Online",
        "current_tier": "Nivel Actual",
        "performance": "Rendimiento Neural",
        "streams": "Reproducciones Globales",
        "revenue": "Ingresos Neurales",
        "analytics": "Ver Analítica Neural"
      }
    }
  },
  pt: {
    translation: {
      "nav": {
        "dashboard": "Painel",
        "catalog": "Catálogo",
        "stats": "Estatísticas",
        "splits": "Divisões",
        "wallet": "Carteira",
        "services": "Serviços",
        "plans": "Planos",
        "connect": "Conectar Spotify",
        "disconnect": "Desconectar Conta"
      }
    }
  },
  fr: {
    translation: {
      "nav": {
        "dashboard": "Tableau",
        "catalog": "Catalogue",
        "stats": "Stats",
        "splits": "Partages",
        "wallet": "Portefeuille",
        "services": "Services",
        "plans": "Plans",
        "connect": "Connexion Spotify",
        "disconnect": "Déconnexion"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
