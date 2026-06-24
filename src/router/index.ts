import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { APP } from '@/config/app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/public/LandingView.vue'),
      meta: { title: APP.name },
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('@/views/public/CoursesView.vue'),
      meta: { title: 'Cursos' },
    },
    {
      path: '/courses/:id',
      name: 'course-detail',
      component: () => import('@/views/public/CourseDetailView.vue'),
      meta: { title: 'Detalle del Curso' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/public/LoginView.vue'),
      meta: { title: 'Iniciar Sesión' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/public/RegisterView.vue'),
      meta: { title: 'Registrarse' },
    },
    {
      path: '/payment/result',
      name: 'payment-result',
      component: () => import('@/views/public/PaymentResultView.vue'),
      meta: { title: 'Resultado del Pago' },
    },
    {
      path: '/instructor',
      name: 'instructor',
      component: () => import('@/views/public/InstructorView.vue'),
      meta: { title: 'Instructor' },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/public/PrivacyView.vue'),
      meta: { title: 'Política de Privacidad' },
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/public/ContactView.vue'),
      meta: { title: 'Contacto' },
    },
    {
      path: '/support',
      name: 'support',
      component: () => import('@/views/public/SupportView.vue'),
      meta: { title: 'Centro de Ayuda' },
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('@/views/public/BlogView.vue'),
      meta: { title: 'Blog' },
    },
    {
      path: '/blog/:id',
      name: 'blog-post',
      component: () => import('@/views/public/BlogPostView.vue'),
      meta: { title: 'Artículo' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/public/AboutView.vue'),
      meta: { title: 'Quiénes Somos' },
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: () => import('@/views/public/JobsView.vue'),
      meta: { title: 'Trabaja con Nosotros' },
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          meta: { title: 'Mi Aprendizaje' },
        },
        {
          path: 'my-courses',
          name: 'my-courses',
          component: () => import('@/views/dashboard/MyCoursesView.vue'),
          meta: { title: 'Mis Cursos' },
        },
        {
          path: 'agenda',
          name: 'agenda',
          component: () => import('@/views/dashboard/AgendaView.vue'),
          meta: { title: 'Agenda de Clases' },
        },
        {
          path: 'chat',
          name: 'chat',
          component: () => import('@/views/dashboard/ChatView.vue'),
          meta: { title: 'Mensajes' },
        },
        {
          path: 'support',
          name: 'dashboard-support',
          component: () => import('@/views/dashboard/SupportView.vue'),
          meta: { title: 'Ayuda y Soporte' },
        },
        {
          path: 'learn/:courseId',
          name: 'course-learn',
          component: () => import('@/views/dashboard/CourseLearnView.vue'),
          meta: { title: 'Mi Curso' },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin',
          component: () => import('@/views/admin/AdminCoursesView.vue'),
          meta: { title: 'Panel de Administración' },
        },
        {
          path: 'agenda',
          name: 'admin-agenda',
          component: () => import('@/views/admin/AdminAgendaView.vue'),
          meta: { title: 'Gestionar Agenda' },
        },
        {
          path: 'lessons',
          name: 'admin-lessons',
          component: () => import('@/views/admin/AdminLessonsView.vue'),
          meta: { title: 'Gestionar Lecciones' },
        },
        {
          path: 'support',
          name: 'admin-support',
          component: () => import('@/views/admin/AdminSupportTicketsView.vue'),
          meta: { title: 'Tickets de Soporte' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth || to.meta.requiresAdmin) {
    const authStore = useAuthStore()
    if (!authStore.sessionReady) {
      await authStore.initSession()
    }
    if (!authStore.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      return { name: 'dashboard' }
    }
  }
})

router.afterEach((to) => {
  const pageTitle = to.meta.title as string | undefined
  document.title = pageTitle ? `${pageTitle} | ${APP.name}` : APP.name
})

export default router
