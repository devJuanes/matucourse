<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { dbService } from '@/services'
import type { Course, CourseLesson } from '@/services'
import { useLessonProgress, countCourseLessons } from '@/composables/useLessonProgress'
import { useGamification } from '@/composables/useGamification'
import { formatLessonContent } from '@/utils/formatLessonContent'
import {
  ArrowLeft, Lock, PlayCircle, CheckCircle2, BookOpen, ChevronDown, ChevronRight,
  Flame, Award, Video, List, X,
} from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const course = ref<Course | null>(null)
const loading = ref(true)
const enrolled = ref(false)
const openModule = ref<number | null>(1)
const activeLesson = ref<CourseLesson | null>(null)
const streak = ref(0)
const achievements = ref<{ id: string; label: string; done: boolean }[]>([])

const courseId = computed(() => route.params.courseId as string)

const progress = computed(() => {
  if (!authStore.user?.id || !course.value) return 0
  const p = useLessonProgress(authStore.user.id, course.value.id)
  return p.getProgressPercent(countCourseLessons(course.value))
})

const courseComplete = computed(() => progress.value >= 100)
const mobileCurriculumOpen = ref(false)

let unsubscribe: (() => void) | null = null

function syncGamification(c: Course) {
  if (!authStore.user?.id) return
  const g = useGamification(authStore.user.id, c.id)
  streak.value = g.recordVisit()
  achievements.value = g.getAchievements(c)
}

function applyCourseUpdate(c: Course) {
  course.value = c
  if (activeLesson.value) {
    for (const mod of c.modules) {
      const found = mod.lessons?.find((l) => l.id === activeLesson.value!.id)
      if (found) {
        activeLesson.value = found
        break
      }
    }
  }
  syncGamification(c)
}

onMounted(async () => {
  if (!authStore.user?.id) {
    router.push('/login')
    return
  }
  const enrollments = await dbService.getEnrollments(authStore.user.id)
  enrolled.value = enrollments.some((e) => e.course_id === courseId.value)
  if (!enrolled.value) {
    router.push(`/courses/${courseId.value}`)
    return
  }

  unsubscribe = dbService.subscribeCourse(courseId.value, (c) => {
    if (!c) {
      loading.value = false
      return
    }
    applyCourseUpdate(c)
    if (!activeLesson.value) {
      for (const mod of c.modules) {
        const unlocked = mod.lessons?.find((l) => l.unlocked)
        if (unlocked) {
          activeLesson.value = unlocked
          openModule.value = mod.id
          break
        }
      }
    }
    loading.value = false
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

function toggleModule(id: number) {
  openModule.value = openModule.value === id ? null : id
}

function selectLesson(lesson: CourseLesson) {
  if (!lesson.unlocked) return
  activeLesson.value = lesson
  mobileCurriculumOpen.value = false
  if (authStore.user?.id && course.value) {
    useLessonProgress(authStore.user.id, course.value.id).markComplete(lesson.id)
    syncGamification(course.value)
  }
}

function lessonIcon(lesson: CourseLesson) {
  if (!lesson.unlocked) return Lock
  if (authStore.user?.id && course.value) {
    const done = useLessonProgress(authStore.user.id, course.value.id).getCompleted()
    if (done.includes(lesson.id)) return CheckCircle2
  }
  return PlayCircle
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
    <div class="w-8 h-8 border-4 border-[#5624d0] border-t-transparent rounded-full animate-spin"></div>
  </div>

  <div v-else-if="course" class="flex flex-col min-h-[calc(100dvh-3.5rem)] lg:min-h-[calc(100vh-56px)] -mx-4 md:mx-0">

    <!-- Top bar -->
    <div class="border-b border-[#d1d7dc] bg-white px-3 sm:px-6 py-3 flex-shrink-0">
      <div class="flex items-center gap-2 sm:gap-4">
        <RouterLink to="/dashboard/my-courses" class="text-[#6a6f73] hover:text-[#1c1d1f] flex items-center gap-1 text-xs sm:text-sm font-semibold flex-shrink-0">
          <ArrowLeft :size="16" /> <span class="hidden sm:inline">Mis Cursos</span>
        </RouterLink>
        <button
          type="button"
          class="md:hidden flex items-center gap-1.5 text-xs font-bold text-[#5624d0] border border-[#5624d0] px-2.5 py-1.5 flex-shrink-0"
          @click="mobileCurriculumOpen = true"
        >
          <List :size="14" /> Contenido
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="font-extrabold text-[#1c1d1f] text-sm truncate">{{ course.title }}</h1>
          <div class="flex items-center gap-2 mt-1">
            <div class="h-1.5 bg-[#d1d7dc] w-32 rounded-full">
              <div class="h-1.5 bg-[#5624d0] rounded-full transition-all" :style="{ width: `${progress}%` }"></div>
            </div>
            <span class="text-[10px] text-[#6a6f73]">{{ progress }}% completado</span>
          </div>
        </div>
      </div>

      <!-- Racha, logros y certificado -->
      <div class="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-[#d1d7dc]">
        <div class="flex items-center gap-1.5 text-xs font-bold text-[#1c1d1f] bg-[#f7f9fa] border border-[#d1d7dc] px-3 py-1.5">
          <Flame :size="14" class="text-orange-500" />
          Racha: {{ streak }} día{{ streak !== 1 ? 's' : '' }}
        </div>
        <div
          v-for="ach in achievements"
          :key="ach.id"
          :class="[
            'flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 border',
            ach.done ? 'border-green-600 text-green-700 bg-green-50' : 'border-[#d1d7dc] text-[#6a6f73] bg-white',
          ]"
        >
          <Award :size="12" />
          {{ ach.label }}
        </div>
        <div
          :class="[
            'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border w-full sm:w-auto sm:ml-auto',
            courseComplete
              ? 'border-[#5624d0] text-[#5624d0] bg-[#ede8f5]'
              : 'border-[#d1d7dc] text-[#6a6f73] bg-[#f7f9fa] opacity-70',
          ]"
        >
          <Lock v-if="!courseComplete" :size="13" />
          <Award v-else :size="13" />
          {{ courseComplete ? 'Certificado disponible' : 'Certificado (completa el curso)' }}
        </div>
      </div>
    </div>

    <!-- Mobile curriculum drawer -->
    <div v-if="mobileCurriculumOpen" class="fixed inset-0 z-50 md:hidden">
      <div class="absolute inset-0 bg-black/40" @click="mobileCurriculumOpen = false" />
      <aside class="absolute left-0 top-0 bottom-0 w-[min(320px,92vw)] bg-[#f7f9fa] border-r border-[#d1d7dc] overflow-y-auto shadow-xl">
        <div class="p-4 border-b border-[#d1d7dc] bg-white flex items-center justify-between">
          <p class="text-xs font-bold text-[#6a6f73] uppercase">Contenido del curso</p>
          <button type="button" class="p-1" @click="mobileCurriculumOpen = false">
            <X :size="20" />
          </button>
        </div>
        <div v-for="mod in course.modules" :key="'m-' + mod.id" class="border-b border-[#d1d7dc]">
          <button type="button" @click="toggleModule(mod.id)" class="w-full flex items-center gap-2 px-4 py-3 text-left bg-white">
            <component :is="openModule === mod.id ? ChevronDown : ChevronRight" :size="14" class="text-[#5624d0]" />
            <span class="text-xs font-bold leading-snug">{{ mod.title }}</span>
          </button>
          <div v-if="openModule === mod.id" class="bg-white pb-2">
            <button
              v-for="lesson in mod.lessons ?? []"
              :key="lesson.id"
              type="button"
              @click="selectLesson(lesson)"
              :disabled="!lesson.unlocked"
              :class="[
                'w-full flex items-start gap-2 px-4 py-2.5 text-left text-xs',
                activeLesson?.id === lesson.id ? 'bg-[#ede8f5] border-l-4 border-[#5624d0]' : 'border-l-4 border-transparent',
                !lesson.unlocked && 'opacity-50',
              ]"
            >
              <component :is="lessonIcon(lesson)" :size="14" class="mt-0.5 flex-shrink-0" />
              <span class="font-semibold">{{ lesson.title }}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>

    <div class="flex flex-1 min-h-0">

      <!-- Sidebar -->
      <aside class="w-80 border-r border-[#d1d7dc] bg-[#f7f9fa] overflow-y-auto flex-shrink-0 hidden md:block">
        <div class="p-4 border-b border-[#d1d7dc] bg-white">
          <p class="text-xs font-bold text-[#6a6f73] uppercase tracking-wide">Contenido del curso</p>
        </div>
        <div v-for="mod in course.modules" :key="mod.id" class="border-b border-[#d1d7dc]">
          <button
            type="button"
            @click="toggleModule(mod.id)"
            class="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-[#ede8f5] transition-colors"
          >
            <div class="flex items-center gap-2 min-w-0">
              <component :is="openModule === mod.id ? ChevronDown : ChevronRight" :size="14" class="text-[#5624d0] flex-shrink-0" />
              <span class="text-xs font-bold text-[#1c1d1f] leading-snug">{{ mod.title }}</span>
            </div>
          </button>
          <div v-if="openModule === mod.id" class="bg-white pb-2">
            <button
              v-for="lesson in mod.lessons ?? []"
              :key="lesson.id"
              type="button"
              @click="selectLesson(lesson)"
              :disabled="!lesson.unlocked"
              :class="[
                'w-full flex items-start gap-2.5 px-4 py-2.5 text-left text-xs transition-colors',
                activeLesson?.id === lesson.id ? 'bg-[#ede8f5] border-l-4 border-[#5624d0]' : 'border-l-4 border-transparent',
                lesson.unlocked ? 'hover:bg-[#f7f9fa] cursor-pointer' : 'opacity-50 cursor-not-allowed',
              ]"
            >
              <component
                :is="lessonIcon(lesson)"
                :size="14"
                :class="lesson.unlocked ? 'text-[#5624d0] mt-0.5 flex-shrink-0' : 'text-[#6a6f73] mt-0.5 flex-shrink-0'"
              />
              <div class="min-w-0">
                <p class="font-semibold text-[#1c1d1f] leading-snug">{{ lesson.title }}</p>
                <p v-if="lesson.duration" class="text-[10px] text-[#6a6f73] mt-0.5">{{ lesson.duration }}</p>
                <p v-if="!lesson.unlocked" class="text-[10px] text-[#eb6a00] mt-0.5">Próximamente</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto bg-white">
        <div v-if="activeLesson" class="max-w-3xl mx-auto p-4 sm:p-6 md:p-10">
          <div class="mb-6">
            <p class="text-xs font-bold text-[#5624d0] uppercase tracking-wide mb-2">Lección actual</p>
            <h2 class="text-2xl font-extrabold text-[#1c1d1f]">{{ activeLesson.title }}</h2>
            <p v-if="activeLesson.description" class="text-[#6a6f73] text-sm mt-2">{{ activeLesson.description }}</p>
          </div>

          <img
            v-if="activeLesson.imageUrl"
            :src="activeLesson.imageUrl"
            alt=""
            class="max-w-full border border-[#d1d7dc] mb-4"
          />

          <div v-if="activeLesson.content" class="border border-[#d1d7dc] p-6 bg-[#f7f9fa] text-sm text-[#1c1d1f] leading-relaxed">
            <div v-html="formatLessonContent(activeLesson.content)"></div>
          </div>

          <div v-else-if="!activeLesson.codeExample" class="border border-[#d1d7dc] p-8 text-center">
            <BookOpen :size="40" class="mx-auto text-[#d1d7dc] mb-3" />
            <p class="text-[#6a6f73] text-sm">
              El material de esta lección estará disponible cuando el instructor la habilite en clase.
            </p>
          </div>

          <pre
            v-if="activeLesson.codeExample"
            class="mt-4 bg-[#1c1d1f] text-[#f7f9fa] p-4 text-xs font-mono overflow-x-auto rounded-sm"
          ><code>{{ activeLesson.codeExample }}</code></pre>

          <div class="flex flex-wrap gap-3 mt-6">
            <a
              v-if="activeLesson.videoUrl"
              :href="activeLesson.videoUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 bg-[#5624d0] text-white font-bold text-sm px-6 py-3 hover:bg-[#3d1a9e] transition-colors"
            >
              <PlayCircle :size="16" /> Ver video de la clase
            </a>
            <a
              v-if="activeLesson.meetingUrl"
              :href="activeLesson.meetingUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 border-2 border-[#5624d0] text-[#5624d0] font-bold text-sm px-6 py-3 hover:bg-[#ede8f5] transition-colors"
            >
              <Video :size="16" /> Unirse a la clase en vivo
            </a>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-full p-8 text-center">
          <div>
            <Lock :size="40" class="mx-auto text-[#d1d7dc] mb-3" />
            <p class="text-[#6a6f73] text-sm">Selecciona una lección disponible del menú lateral.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
