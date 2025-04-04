<template>
  <div class="chart-variants-container">
    <h3 class="variants-title">环形图样式预览</h3>

    <div class="variants-grid">
      <!-- 基础样式 -->
      <div class="variant-card">
        <h4>基础样式</h4>
        <div class="chart-container">
          <BasicDonut :value="0.78" color="#4da6ff" />
        </div>
      </div>

      <!-- 渐变样式 -->
      <div class="variant-card">
        <h4>渐变样式</h4>
        <div class="chart-container">
          <GradientDonut :value="0.78" />
        </div>
      </div>

      <!-- 带刻度样式 -->
      <div class="variant-card">
        <h4>带刻度样式</h4>
        <div class="chart-container">
          <TickedDonut :value="0.78" color="#4da6ff" />
        </div>
      </div>

      <!-- 仪表盘样式 -->
      <div class="variant-card">
        <h4>仪表盘样式</h4>
        <div class="chart-container">
          <GaugeDonut :value="0.78" color="#4da6ff" />
        </div>
      </div>

      <!-- 双环样式 -->
      <div class="variant-card">
        <h4>双环样式</h4>
        <div class="chart-container">
          <DoubleDonut :value="0.78" :secondary-value="0.45" />
        </div>
      </div>

      <!-- 动画样式 -->
      <div class="variant-card">
        <h4>动画样式</h4>
        <div class="chart-container">
          <AnimatedDonut :value="0.78" color="#4da6ff" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 基础环形图组件
const BasicDonut = {
  props: ['value', 'color', 'size'],
  template: `
    <div class="donut-container" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size || 120" :height="size || 120" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.915" stroke="rgba(255, 255, 255, 0.1)" stroke-width="3" fill="none" />
        <circle
          cx="18" cy="18" r="15.915"
          :stroke="color"
          stroke-width="3"
          fill="none"
          :stroke-dasharray="value * 100 + ' 100'"
          stroke-dashoffset="25"
          stroke-linecap="round"
        />
      </svg>
      <div class="donut-label">{{ Math.round(value * 100) }}%</div>
    </div>
  `,
  setup() {
    return {};
  }
};

// 渐变环形图组件
const GradientDonut = {
  props: ['value', 'size'],
  template: `
    <div class="donut-container" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size || 120" :height="size || 120" viewBox="0 0 36 36">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#00e5ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4da6ff;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="15.915" stroke="rgba(255, 255, 255, 0.1)" stroke-width="3" fill="none" />
        <circle
          cx="18" cy="18" r="15.915"
          stroke="url(#grad)"
          stroke-width="3"
          fill="none"
          :stroke-dasharray="value * 100 + ' 100'"
          stroke-dashoffset="25"
          stroke-linecap="round"
        />
      </svg>
      <div class="donut-label">{{ Math.round(value * 100) }}%</div>
    </div>
  `,
  setup() {
    return {};
  }
};

// 带刻度环形图组件
const TickedDonut = {
  props: ['value', 'color', 'size'],
  template: `
    <div class="donut-container" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size || 120" :height="size || 120" viewBox="0 0 36 36">
        <!-- 背景圆环 -->
        <circle cx="18" cy="18" r="15.915" stroke="rgba(255, 255, 255, 0.1)" stroke-width="3" fill="none" />

        <!-- 刻度线 -->
        <g>
          <line v-for="n in 12"
            :transform="'rotate('+ (n * 30) +', 18, 18)'"
            x1="18" y1="5" x2="18" y2="7"
            stroke="rgba(255, 255, 255, 0.3)"
            stroke-width="1" />
        </g>

        <!-- 进度条 -->
        <circle
          cx="18" cy="18" r="15.915"
          :stroke="color"
          stroke-width="3"
          fill="none"
          :stroke-dasharray="value * 100 + ' 100'"
          stroke-dashoffset="25"
          stroke-linecap="round"
        />
      </svg>
      <div class="donut-label">{{ Math.round(value * 100) }}%</div>
    </div>
  `,
  setup() {
    return {};
  }
};

// 仪表盘样式组件
const GaugeDonut = {
  props: ['value', 'color', 'size'],
  template: `
    <div class="donut-container" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size || 120" :height="size || 120" viewBox="0 0 36 36">
        <!-- 背景半圆 -->
        <path
          d="M18,2.5 A15.5,15.5 0 1,1 2.5,18"
          stroke="rgba(255, 255, 255, 0.1)"
          stroke-width="3"
          fill="none" />

        <!-- 进度弧 -->
        <path
          d="M18,2.5 A15.5,15.5 0 0,1 33.5,18"
          :stroke="color"
          stroke-width="3"
          fill="none"
          :stroke-dasharray="value * 50 + ' 100'"
          stroke-linecap="round" />

        <!-- 指针 -->
        <line
          :transform="'rotate('+ (value * 180) +', 18, 18)'"
          x1="18" y1="18" x2="18" y2="6"
          :stroke="color"
          stroke-width="0.8" />

        <!-- 指针中心点 -->
        <circle cx="18" cy="18" r="2" :fill="color" />
      </svg>
      <div class="donut-label">{{ Math.round(value * 100) }}%</div>
    </div>
  `,
  setup() {
    return {};
  }
};

// 双环样式组件
const DoubleDonut = {
  props: ['value', 'secondaryValue', 'size'],
  template: `
    <div class="donut-container" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size || 120" :height="size || 120" viewBox="0 0 36 36">
        <!-- 背景圆环-外 -->
        <circle cx="18" cy="18" r="15.915" stroke="rgba(255, 255, 255, 0.1)" stroke-width="3" fill="none" />

        <!-- 背景圆环-内 -->
        <circle cx="18" cy="18" r="12" stroke="rgba(255, 255, 255, 0.1)" stroke-width="3" fill="none" />

        <!-- 外环进度 -->
        <circle
          cx="18" cy="18" r="15.915"
          stroke="#4da6ff"
          stroke-width="3"
          fill="none"
          :stroke-dasharray="value * 100 + ' 100'"
          stroke-dashoffset="25"
          stroke-linecap="round"
        />

        <!-- 内环进度 -->
        <circle
          cx="18" cy="18" r="12"
          stroke="#7b5dfa"
          stroke-width="3"
          fill="none"
          :stroke-dasharray="secondaryValue * 100 + ' 100'"
          stroke-dashoffset="25"
          stroke-linecap="round"
        />
      </svg>
      <div class="donut-label">{{ Math.round(value * 100) }}%</div>
    </div>
  `,
  setup() {
    return {};
  }
};

// 动画环形图组件
const AnimatedDonut = {
  props: ['value', 'color', 'size'],
  template: `
    <div class="donut-container" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size || 120" :height="size || 120" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.915" stroke="rgba(255, 255, 255, 0.1)" stroke-width="3" fill="none" />
        <circle
          class="animated-circle"
          cx="18" cy="18" r="15.915"
          :stroke="color"
          stroke-width="3"
          fill="none"
          :stroke-dasharray="value * 100 + ' 100'"
          stroke-dashoffset="25"
          stroke-linecap="round"
        />
        <circle
          class="pulse"
          cx="18" cy="18" r="17"
          :stroke="color"
          stroke-width="0.5"
          fill="none"
          opacity="0.5"
        />
      </svg>
      <div class="donut-label">{{ Math.round(value * 100) }}%</div>
    </div>
  `,
  setup() {
    return {};
  }
};

export default {
  name: 'DonutChartVariants',
  components: {
    BasicDonut,
    GradientDonut,
    TickedDonut,
    GaugeDonut,
    DoubleDonut,
    AnimatedDonut
  }
}
</script>

<style scoped>
.chart-variants-container {
  padding: 20px;
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--card-shadow);
}

.variants-title {
  margin-bottom: 20px;
  color: var(--text-primary);
  text-align: center;
}

.variants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.variant-card {
  background-color: var(--tertiary-bg);
  border-radius: var(--border-radius-sm);
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.variant-card:hover {
  transform: translateY(-5px);
}

.variant-card h4 {
  margin-bottom: 15px;
  color: var(--text-secondary);
  font-size: 16px;
}

.chart-container {
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 圆环组件共享样式 */
.donut-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-label {
  position: absolute;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 动画效果 */
.animated-circle {
  animation: rotate 4s linear infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

.pulse {
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}
</style>