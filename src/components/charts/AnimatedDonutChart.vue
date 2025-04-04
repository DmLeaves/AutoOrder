<template>
  <div class="donut-chart-container" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" viewBox="0 0 36 36">
      <!-- 背景圆环 -->
      <circle
          cx="18"
          cy="18"
          r="15.915"
          :stroke="bgColor"
          :stroke-width="thickness"
          fill="none"
          stroke-linecap="round"
      />

      <!-- 前景圆环（进度） -->
      <circle
          cx="18"
          cy="18"
          r="15.915"
          :stroke="color"
          :stroke-width="thickness"
          fill="none"
          :stroke-dasharray="`${dashArray} ${circumference}`"
          stroke-dashoffset="0"
          class="donut-segment"
          stroke-linecap="round"
      />

      <!-- 边缘脉冲效果 -->
      <circle
          v-if="showPulse"
          cx="18"
          cy="18"
          r="17"
          :stroke="color"
          stroke-width="0.5"
          fill="none"
          class="pulse-ring"
      />

      <!-- 进度点 -->
      <circle
          v-if="showProgressDot && value > 0"
          :cx="dotPosition.x"
          :cy="dotPosition.y"
          r="1.5"
          :fill="color"
          class="progress-dot"
      />
    </svg>

    <!-- 居中显示文本 -->
    <div class="donut-label">{{ formattedValue }}</div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  name: 'AnimatedDonutChart',
  props: {
    value: {
      type: Number,
      required: true,
      validator: (val) => val >= 0 && val <= 1
    },
    size: {
      type: Number,
      default: 120
    },
    thickness: {
      type: Number,
      default: 8
    },
    color: {
      type: String,
      default: 'var(--accent-blue)'
    },
    bgColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.1)'
    },
    format: {
      type: String,
      default: 'percent' // 'percent' 或 'value'
    },
    showPulse: {
      type: Boolean,
      default: true
    },
    showProgressDot: {
      type: Boolean,
      default: true
    },
    minVisible: {
      type: Number,
      default: 0.02 // 最小可见度（2%）
    }
  },
  setup(props) {
    // 计算圆的周长
    const radius = 15.915;
    const circumference = computed(() => {
      return 2 * Math.PI * radius;
    });

    // 计算仪表盘数组值
    const dashArray = computed(() => {
      // 确保超小值至少有最小可见度
      const visibleValue = props.value < props.minVisible && props.value > 0
          ? props.minVisible
          : props.value;

      return visibleValue * circumference.value;
    });

    // 格式化显示值
    const formattedValue = computed(() => {
      if (props.format === 'percent') {
        return `${Math.round(props.value * 100)}%`;
      }
      return props.value.toString();
    });

    // 计算进度点位置
    const dotPosition = computed(() => {
      // 进度点位置计算
      const angle = 2 * Math.PI * props.value - (Math.PI / 2); // -90度为起点
      const x = 18 + (15.915 * Math.cos(angle));
      const y = 18 + (15.915 * Math.sin(angle));

      return { x, y };
    });

    return {
      dashArray,
      formattedValue,
      circumference,
      dotPosition
    };
  }
}
</script>

<style scoped>
.donut-chart-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

svg {
  transform: rotate(-90deg);
  filter: drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.5));
}

.donut-segment {
  transition: stroke-dasharray 0.8s ease;
  animation: rotate 4s linear infinite;
}

.donut-label {
  position: absolute;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.pulse-ring {
  opacity: 0.6;
  animation: pulse 2s ease-out infinite;
}

.progress-dot {
  animation: pulse-dot 2s ease-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
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

@keyframes pulse-dot {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 2px currentColor);
  }
  50% {
    transform: scale(1.5);
    filter: drop-shadow(0 0 5px currentColor);
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 2px currentColor);
  }
}
</style>