<template>
  <main class="ramen-map-page">
    <section class="map-hero">
      <div class="page-container">
        <p class="map-hero__eyebrow">
          RAMEN MAP
        </p>

        <h1>拉麵地圖</h1>

        <p class="map-hero__description">
          探索台灣各地的拉麵店，
          找到下一間想造訪的拉麵店。
        </p>
      </div>
    </section>

    <section class="map-section">
      <div class="page-container">
        <AppCard class="map-card">
          <div class="map-card__header">
            <div>
              <h2>拉麵店地圖</h2>

              <p>
                地圖資料由 Google My Maps 提供。
              </p>
            </div>
          </div>

          <div class="map-wrapper">
            <iframe
              class="ramen-map"
              src="https://www.google.com/maps/d/embed?mid=1gf91hRzym-Pfz4y3UFGiSVouk1n_2w8&ehbc=2E312F"
              title="拉麵通拉麵地圖"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
            />
          </div>

          <p class="map-card__hint">
            可在地圖中拖曳、縮放並點擊標記查看拉麵店資訊。
          </p>
        </AppCard>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.ramen-map-page {
  min-height: 100vh;
}

.page-container {
  width: min(
    1200px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.map-hero {
  padding: 72px 0 64px;

  &__eyebrow {
    margin: 0 0 10px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  h1 {
    margin: 0;
    font-size: clamp(
      2rem,
      5vw,
      3.4rem
    );
  }

  &__description {
    max-width: 620px;
    margin: 16px 0 0;
    line-height: 1.8;
    color:
      var(--color-text-secondary);
  }
}

.map-section {
  padding: 16px 0 48px;
}

.map-card {
  padding: 20px;

  &__header {
    margin-bottom: 18px;

    h2 {
      margin: 0;
      color: var(--color-text);
      font-size: 1.4rem;
    }

    p {
      margin: 8px 0 0;
      color: var(--color-text-secondary);
    }
  }

  &__hint {
    margin: 14px 0 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }
}

.map-wrapper {
  overflow: hidden;
  width: 100%;
  height: 100vh;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.ramen-map {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 768px) {
  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .map-card {
    padding: 14px;
  }

  .map-wrapper {
    aspect-ratio: 3 / 5;
  }
}
</style>

<route lang="yaml">
meta:
  title: 拉麵地圖
</route>
