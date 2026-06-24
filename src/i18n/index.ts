import { createI18n } from 'vue-i18n'

const messages = {
  es: {
    nav: {
      courses: 'Cursos',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      myAccount: 'Mi Cuenta',
      explore: 'Explorar',
    },
    hero: {
      title: 'Aprende programación y música',
      subtitle: 'con expertos, en vivo',
      search: '¿Qué quieres aprender hoy?',
      searchBtn: 'Buscar',
    },
    footer: {
      rights: 'Todos los derechos reservados',
      product: 'Un producto de',
    },
    common: {
      viewAll: 'Ver todos',
      learnMore: 'Saber más',
      buy: '¡Inscribirme ahora!',
      processing: 'Procesando...',
      continue: 'Continuar',
    },
  },
  en: {
    nav: {
      courses: 'Courses',
      login: 'Log In',
      register: 'Sign Up',
      myAccount: 'My Account',
      explore: 'Explore',
    },
    hero: {
      title: 'Learn programming and music',
      subtitle: 'with experts, live',
      search: 'What do you want to learn?',
      searchBtn: 'Search',
    },
    footer: {
      rights: 'All rights reserved',
      product: 'A product of',
    },
    common: {
      viewAll: 'View all',
      learnMore: 'Learn more',
      buy: 'Enroll now!',
      processing: 'Processing...',
      continue: 'Continue',
    },
  },
  pt: {
    nav: {
      courses: 'Cursos',
      login: 'Entrar',
      register: 'Cadastrar',
      myAccount: 'Minha Conta',
      explore: 'Explorar',
    },
    hero: {
      title: 'Aprenda programação e música',
      subtitle: 'com especialistas, ao vivo',
      search: 'O que você quer aprender?',
      searchBtn: 'Buscar',
    },
    footer: {
      rights: 'Todos os direitos reservados',
      product: 'Um produto de',
    },
    common: {
      viewAll: 'Ver todos',
      learnMore: 'Saiba mais',
      buy: 'Inscrever-me agora!',
      processing: 'Processando...',
      continue: 'Continuar',
    },
  },
}

export const i18n = createI18n({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'es',
  messages,
})
