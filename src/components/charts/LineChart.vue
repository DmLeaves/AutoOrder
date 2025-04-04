<template>
  <div class="line-chart-container">
    <canvas :id="chartId" ref="chartRef"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';

export default {
  name: 'LineChart',
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartId: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'var(--accent-blue)'
    }
  },
  setup(props) {
    const chartRef = ref(null);
    let chartInstance = null;

    const createChart = async () => {
      if (!chartRef.value) return;

      try {
        // 确保先清理旧图表
        if (chartInstance) {
          chartInstance.destroy();
          chartInstance = null;
        }

        // 动态导入Chart.js
        const { Chart } = await import('chart.js/auto');

        const canvas = document.getElementById(props.chartId);
        if (!canvas) {
          console.error('Canvas element not found:', props.chartId);
          return;
        }

        const ctx = canvas.getContext('2d');

        // 获取图表颜色（从props中或CSS变量）
        const lineColor = props.color === 'var(--accent-blue)' ? '#4da6ff' :
            props.color === 'var(--accent-purple)' ? '#7b5dfa' : props.color;

        // 解构数据集以便添加自定义样式
        const datasets = props.chartData.datasets.map(dataset => ({
          ...dataset,
          borderColor: lineColor,
          backgroundColor: `${lineColor}33`, // 添加20%透明度
          pointBackgroundColor: '#ffffff',
          pointBorderColor: lineColor,
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: '#ffffff',
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3
        }));

        // 创建新图表
        chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            ...props.chartData,
            datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                left: 10,
                right: 10,
                top: 20,
                bottom: 20
              }
            },
            animations: {
              tension: {
                duration: 1000,
                easing: 'linear',
                from: 0.3,
                to: 0.4
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                  lineWidth: 1
                },
                ticks: {
                  color: '#b8b8d4', // 使用浅色文本颜色
                  padding: 10,
                  font: {
                    size: 12,
                    weight: 'bold'
                  },
                  // 确保y轴标签完全显示
                  callback: function(value) {
                    return value;
                  }
                },
                border: {
                  display: false // 移除边框
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                  lineWidth: 1
                },
                ticks: {
                  color: '#b8b8d4', // 使用浅色文本颜色
                  padding: 10,
                  font: {
                    size: 12,
                    weight: 'bold'
                  }
                },
                border: {
                  display: false // 移除边框
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#1a1a2e',
                titleColor: '#ffffff',
                bodyColor: '#b8b8d4',
                borderColor: '#30304d',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                titleFont: {
                  size: 14,
                  weight: 'bold'
                },
                bodyFont: {
                  size: 13
                },
                callbacks: {
                  title: function(tooltipItems) {
                    return `${tooltipItems[0].label}`;
                  },
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y;
                    return `${label}: ${value}`;
                  }
                }
              }
            },
            elements: {
              line: {
                tension: 0.4
              },
              point: {
                // 添加描边使点更醒目
                borderWidth: 2
              }
            }
          }
        });
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    };

    // 监听窗口大小变化，重新渲染图表
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };

    onMounted(() => {
      // 使用setTimeout延迟创建图表，确保DOM已经渲染
      setTimeout(() => {
        createChart();
      }, 100);

      window.addEventListener('resize', handleResize);
    });

    watch(() => props.chartData, () => {
      // 延迟更新以确保之前的图表实例已被清理
      setTimeout(() => {
        createChart();
      }, 100);
    }, { deep: true });

    // 清理资源
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
    });

    return {
      chartRef
    };
  }
}
</script>

<style scoped>
.line-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 15px;
}
</style>