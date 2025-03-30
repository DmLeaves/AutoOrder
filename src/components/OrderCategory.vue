<template>
  <div class="category-container">
    <h3 class="category-title">订单分类菜单</h3>

    <ul class="category-menu">
      <li v-for="category in categories" :key="category.value" class="category-item" :class="{ active: activeCategory === category.value }" @click="toggleCategory(category.value)">
        <div class="category-header">
          <span class="category-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" v-if="expandedCategories.includes(category.value)"></polyline>
              <polyline points="6 9 12 15 18 9" v-else></polyline>
            </svg>
          </span>
          <span class="category-name">{{ category.name }}</span>
        </div>

        <transition name="slide">
          <ul v-if="expandedCategories.includes(category.value)" class="subcategory-menu">
            <li v-for="month in category.months" :key="`${category.value}-${month}`"
                class="subcategory-item"
                :class="{ active: activeSubcategory === `${category.value}-${month}` }"
                @click.stop="selectSubcategory(category.value, month)">
              <span class="month-label">{{ month }}</span>
            </li>
          </ul>
        </transition>
      </li>
    </ul>
  </div>
</template>

<script>
import ordersData from '../mock/orders.json';

export default {
  name: 'OrderCategory',
  data() {
    return {
      categories: ordersData.categories,
      expandedCategories: [],
      activeCategory: null,
      activeSubcategory: null
    };
  },
  methods: {
    toggleCategory(categoryValue) {
      if (this.expandedCategories.includes(categoryValue)) {
        this.expandedCategories = this.expandedCategories.filter(cat => cat !== categoryValue);
      } else {
        this.expandedCategories.push(categoryValue);
      }
      this.activeCategory = categoryValue;

      // Emit event for parent components
      this.$emit('category-selected', categoryValue);
    },
    selectSubcategory(categoryValue, month) {
      this.activeSubcategory = `${categoryValue}-${month}`;

      // Emit event for parent components
      this.$emit('subcategory-selected', {
        category: categoryValue,
        month: month
      });
    }
  }
}
</script>

<style scoped>
.category-container {
  padding: var(--spacing-md);
}

.category-title {
  font-size: 16px;
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.category-menu {
  list-style: none;
}

.category-item {
  margin-bottom: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  transition: background-color var(--transition-fast);
}

.category-header {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  border-radius: var(--border-radius-sm);
}

.category-header:hover {
  background-color: rgba(77, 166, 255, 0.08);
}

.category-icon {
  margin-right: var(--spacing-sm);
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.category-name {
  font-weight: 500;
}

.subcategory-menu {
  list-style: none;
  margin-top: var(--spacing-xs);
  border-left: 1px solid rgba(77, 166, 255, 0.2);
  margin-left: var(--spacing-md);
  padding-left: var(--spacing-sm);
}

.subcategory-item {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  margin: 4px 0;
  font-size: 13px;
  position: relative;
  display: flex;
  align-items: center;
}

.category-item.active {
  background-color: rgba(77, 166, 255, 0.15);
  border-left: 2px solid var(--accent-blue);
}

.category-item.active .category-name {
  color: var(--accent-blue);
  font-weight: 600;
}

.subcategory-item::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--text-disabled);
  margin-right: 8px;
  transition: all var(--transition-normal);
}

.subcategory-item:hover {
  background-color: rgba(77, 166, 255, 0.1);
  transform: translateX(2px);
}

.subcategory-item:hover::before {
  background-color: var(--accent-blue);
}

.subcategory-item.active {
  background-color: rgba(77, 166, 255, 0.15);
  color: var(--accent-blue);
  box-shadow: 0 0 6px rgba(77, 166, 255, 0.3);
}

.subcategory-item.active::before {
  background-color: var(--accent-blue);
  box-shadow: 0 0 5px var(--accent-blue);
}

/* Slide animation */
.slide-enter-active, .slide-leave-active {
  transition: all var(--transition-normal);
  max-height: 300px;
  overflow: hidden;
}

.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>