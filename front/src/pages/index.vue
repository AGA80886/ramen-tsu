<template>
  <main class="home-page">
    <section
      ref="carouselRef"
      class="home-carousel"
      aria-roledescription="carousel"
      aria-label="拉麵通首頁輪播"
      tabindex="0"
      @keydown="handleKeydown"
      @mouseenter="pauseAutoplay"
      @mouseleave="resumeAutoplay"
      @focusin="pauseAutoplay"
      @focusout="resumeAutoplay"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
    >
      <article
        v-for="(slide, index) in slides"
        :key="slide.id"
        :ref="(element) => setSlideRef(element as Element | null, index)"
        class="home-carousel__slide"
        :class="{
          'home-carousel__slide--active': activeIndex === index,
          'home-carousel__slide--link': Boolean(slide.to),
        }"
        :aria-hidden="activeIndex !== index"
        :aria-label="`${index + 1} / ${slides.length}：${slide.alt}`"
        @click="handleSlideClick(index)"
      >
        <img
          class="home-carousel__image"
          :src="slide.image"
          :alt="slide.alt"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
          :loading="index === 0 ? 'eager' : 'lazy'"
          draggable="false"
        />

        <div
          v-if="slide.to"
          class="home-carousel__click-hint"
          aria-hidden="true"
        >
          點擊圖片前往
        </div>
      </article>

      <button
        class="home-carousel__arrow home-carousel__arrow--prev"
        type="button"
        aria-label="上一張"
        @click.stop="previousSlide"
      >
        ‹
      </button>

      <button
        class="home-carousel__arrow home-carousel__arrow--next"
        type="button"
        aria-label="下一張"
        @click.stop="nextSlide"
      >
        ›
      </button>

      <div
        class="home-carousel__controls"
        @click.stop
      >
        <div
          class="home-carousel__dots"
          role="tablist"
          aria-label="選擇輪播頁面"
        >
          <button
            v-for="(slide, index) in slides"
            :key="`dot-${slide.id}`"
            class="home-carousel__dot"
            :class="{ 'home-carousel__dot--active': activeIndex === index }"
            type="button"
            role="tab"
            :aria-selected="activeIndex === index"
            :aria-label="`前往第 ${index + 1} 張`"
            @click="goToSlide(index)"
          />
        </div>

        <div
          class="home-carousel__counter"
          aria-live="polite"
        >
          <span>{{ String(activeIndex + 1).padStart(2, '0') }}</span>
          <span class="home-carousel__counter-divider">/</span>
          <span>{{ String(slides.length).padStart(2, '0') }}</span>
        </div>
      </div>

      <button
        v-if="currentSlide.to"
        class="home-carousel__mobile-cta"
        type="button"
        @click.stop="openCurrentSlide"
      >
        {{ currentSlide.linkLabel }}
        <span aria-hidden="true">→</span>
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { useSnackbarStore } from '@/stores/snackbar'

import heroWelcome from '@/assets/home/hero-welcome.png'
import heroArticle from '@/assets/home/hero-article.png'
import heroShop from '@/assets/home/hero-shop.png'
import heroMap from '@/assets/home/hero-map.png'
import heroStore from '@/assets/home/hero-store.png'

interface HomeSlide {
  id: number
  image: string
  alt: string
  to?: string
  linkLabel?: string
}

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

/*
 * 如果你的自動路由實際網址不同，只需要修改這裡的 to。
 * 例如店家頁若是 /ramen-shop，就把 /shops 改成 /ramen-shop。
 */
const slides: HomeSlide[] = [
  {
    id: 1,
    image: heroWelcome,
    alt: '歡迎來到拉麵通，探索論壇、拉麵店家、拉麵地圖與拉麵商城',
  },
  {
    id: 2,
    image: heroArticle,
    alt: '拉麵論壇，分享心得、交流評價與熱門話題',
    to: '/articles',
    linkLabel: '前往拉麵論壇',
  },
  {
    id: 3,
    image: heroShop,
    alt: '拉麵店家，瀏覽精選店家與真實評價',
    to: '/shops',
    linkLabel: '前往拉麵店家',
  },
  {
    id: 4,
    image: heroMap,
    alt: '拉麵地圖，探索附近拉麵店與熱門名單',
    to: '/map',
    linkLabel: '前往拉麵地圖',
  },
  {
    id: 5,
    image: heroStore,
    alt: '拉麵商城，一蘭拉麵與泡麵系列特價中',
    to: '/online-store',
    linkLabel: '前往拉麵商城',
  },
]

const activeIndex = ref(0)
const isAnimating = ref(false)
const isPaused = ref(false)
const carouselRef = ref<HTMLElement | null>(null)
const slideRefs = ref<HTMLElement[]>([])

let autoplayTimer: ReturnType<typeof setInterval> | undefined
let pointerStartX = 0
let pointerStartY = 0

const currentSlide = computed(() => slides[activeIndex.value])

const setSlideRef = (element: Element | null, index: number) => {
  if (element instanceof HTMLElement) {
    slideRefs.value[index] = element
  }
}

const startAutoplay = () => {
  stopAutoplay()

  autoplayTimer = setInterval(() => {
    if (!isPaused.value && !isAnimating.value) {
      void goToSlide((activeIndex.value + 1) % slides.length, 1)
    }
  }, 6500)
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = undefined
  }
}

const goToSlide = async (nextIndex: number, direction?: 1 | -1) => {
  if (
    isAnimating.value
    || nextIndex === activeIndex.value
    || nextIndex < 0
    || nextIndex >= slides.length
  ) {
    return
  }

  const currentElement = slideRefs.value[activeIndex.value]
  const nextElement = slideRefs.value[nextIndex]

  if (!currentElement || !nextElement) {
    activeIndex.value = nextIndex
    return
  }

  isAnimating.value = true

  const resolvedDirection = direction
    ?? (nextIndex > activeIndex.value ? 1 : -1)

  gsap.killTweensOf([currentElement, nextElement])

  gsap.set(nextElement, {
    autoAlpha: 1,
    zIndex: 2,
    xPercent: resolvedDirection * 4,
    scale: 1.035,
  })

  gsap.set(currentElement, {
    zIndex: 1,
  })

  const timeline = gsap.timeline({
    defaults: {
      ease: 'power3.inOut',
      duration: 1.15,
    },
    onComplete: () => {
      gsap.set(currentElement, {
        autoAlpha: 0,
        zIndex: 0,
        xPercent: 0,
        scale: 1,
      })

      gsap.set(nextElement, {
        zIndex: 1,
        xPercent: 0,
        scale: 1,
      })

      activeIndex.value = nextIndex
      isAnimating.value = false
    },
  })

  timeline
    .to(currentElement, {
      autoAlpha: 0,
      xPercent: resolvedDirection * -3,
      scale: 1.015,
    }, 0)
    .to(nextElement, {
      autoAlpha: 1,
      xPercent: 0,
      scale: 1,
    }, 0)
}

const nextSlide = () => {
  const nextIndex = (activeIndex.value + 1) % slides.length
  void goToSlide(nextIndex, 1)
}

const previousSlide = () => {
  const previousIndex = (activeIndex.value - 1 + slides.length) % slides.length
  void goToSlide(previousIndex, -1)
}

const openCurrentSlide = async () => {
  const destination = currentSlide.value.to

  if (!destination) {
    return
  }

  await router.push(destination)
}

const handleSlideClick = async (index: number) => {
  if (index !== activeIndex.value) {
    return
  }

  const destination = slides[index].to
  if (destination) {
    await router.push(destination)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextSlide()
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previousSlide()
  }

  if ((event.key === 'Enter' || event.key === ' ') && currentSlide.value.to) {
    event.preventDefault()
    void openCurrentSlide()
  }
}

const handlePointerDown = (event: PointerEvent) => {
  pointerStartX = event.clientX
  pointerStartY = event.clientY
}

const handlePointerUp = (event: PointerEvent) => {
  const diffX = event.clientX - pointerStartX
  const diffY = event.clientY - pointerStartY

  if (Math.abs(diffX) < 55 || Math.abs(diffX) < Math.abs(diffY)) {
    return
  }

  if (diffX < 0) {
    nextSlide()
  } else {
    previousSlide()
  }
}

const pauseAutoplay = () => {
  isPaused.value = true
}

const resumeAutoplay = () => {
  isPaused.value = false
}

onMounted(async () => {
  if (route.query.notice === 'admin-only') {
    snackbar.add({
      text: '此區域僅限管理員使用，已為您返回首頁',
      color: 'warning',
    })

    await router.replace({
      path: '/',
    })
  }

  await nextTick()

  slideRefs.value.forEach((slide, index) => {
    gsap.set(slide, {
      autoAlpha: index === 0 ? 1 : 0,
      zIndex: index === 0 ? 1 : 0,
    })
  })

  gsap.fromTo(
    carouselRef.value,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.8, ease: 'power2.out' },
  )

  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()

  if (carouselRef.value) {
    gsap.killTweensOf(carouselRef.value)
  }

  slideRefs.value.forEach((slide) => {
    gsap.killTweensOf(slide)
  })
})
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  background: #080706;
}

.home-carousel {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 1672 / 941;
  overflow: hidden;
  isolation: isolate;
  background: #080706;
  outline: none;
  touch-action: pan-y;
  user-select: none;
  opacity: 0;

  &::after {
    position: absolute;
    inset: auto 0 0;
    z-index: 4;
    height: 18%;
    pointer-events: none;
    content: '';
    background: linear-gradient(to top, rgba(0, 0, 0, 0.34), transparent);
  }
}

.home-carousel__slide {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  visibility: hidden;
  opacity: 0;
  will-change: transform, opacity;

  &--active {
    visibility: visible;
  }

  &--link.home-carousel__slide--active {
    cursor: pointer;
  }
}

.home-carousel__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
}

.home-carousel__click-hint {
  position: absolute;
  right: clamp(18px, 3vw, 56px);
  bottom: clamp(82px, 9vh, 124px);
  z-index: 3;
  padding: 8px 14px;
  color: rgba(255, 239, 213, 0.88);
  font-size: 13px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(217, 164, 91, 0.3);
  border-radius: 999px;
  background: rgba(12, 8, 5, 0.56);
  backdrop-filter: blur(8px);
  transition: opacity 0.25s ease;
}

.home-carousel__arrow {
  position: absolute;
  top: 50%;
  z-index: 8;
  display: grid;
  width: clamp(42px, 3.8vw, 62px);
  height: clamp(42px, 3.8vw, 62px);
  padding: 0;
  color: #f5d59e;
  font-family: Georgia, serif;
  font-size: clamp(34px, 3vw, 50px);
  line-height: 1;
  cursor: pointer;
  place-items: center;
  border: 1px solid rgba(231, 181, 100, 0.46);
  border-radius: 50%;
  background: rgba(10, 7, 5, 0.5);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  transform: translateY(-50%);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba(255, 203, 122, 0.9);
    background: rgba(142, 28, 21, 0.72);
  }

  &:active {
    transform: translateY(-50%) scale(0.94);
  }

  &--prev {
    left: clamp(12px, 2.2vw, 36px);
  }

  &--next {
    right: clamp(12px, 2.2vw, 36px);
  }
}

.home-carousel__controls {
  position: absolute;
  bottom: clamp(20px, 3.2vh, 38px);
  left: 50%;
  z-index: 8;
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 10px 16px;
  border: 1px solid rgba(222, 173, 95, 0.2);
  border-radius: 999px;
  background: rgba(8, 5, 4, 0.56);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transform: translateX(-50%);
}

.home-carousel__dots {
  display: flex;
  gap: 9px;
  align-items: center;
}

.home-carousel__dot {
  width: 9px;
  height: 9px;
  padding: 0;
  cursor: pointer;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.36);
  transition:
    width 0.25s ease,
    border-radius 0.25s ease,
    background-color 0.25s ease;

  &--active {
    width: 28px;
    border-radius: 999px;
    background: #e3322b;
  }
}

.home-carousel__counter {
  display: flex;
  gap: 5px;
  align-items: center;
  color: rgba(255, 242, 221, 0.92);
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  letter-spacing: 0.06em;
}

.home-carousel__counter-divider {
  color: rgba(220, 170, 93, 0.72);
}

.home-carousel__mobile-cta {
  display: none;
}

@media (max-width: 900px) {
  .home-carousel__image {
    object-position: center center;
  }

  .home-carousel__arrow {
    top: auto;
    bottom: 20px;
    width: 40px;
    height: 40px;
    font-size: 32px;
    transform: none;

    &:active {
      transform: scale(0.94);
    }

    &--prev {
      left: 14px;
    }

    &--next {
      right: 14px;
    }
  }

  .home-carousel__controls {
    bottom: 22px;
    padding: 8px 12px;
  }

  .home-carousel__click-hint {
    display: none;
  }

  .home-carousel__mobile-cta {
    position: absolute;
    right: 16px;
    bottom: 78px;
    z-index: 8;
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 11px 16px;
    color: #fff7eb;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid rgba(255, 192, 110, 0.44);
    border-radius: 999px;
    background: rgba(196, 36, 28, 0.82);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(8px);
  }
}

@media (max-width: 600px) {
  .home-carousel__image {
    object-position: center center;
  }

  .home-carousel__controls {
    gap: 10px;
  }

  .home-carousel__counter {
    display: none;
  }

  .home-carousel__mobile-cta {
    right: 50%;
    bottom: 74px;
    transform: translateX(50%);
    white-space: nowrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-carousel__arrow,
  .home-carousel__dot {
    transition: none;
  }
}
</style>


<route lang="yaml">
meta:
  title: 首頁
</route>
