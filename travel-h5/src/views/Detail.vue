<template>
  <div class="page-container">
    <van-nav-bar title="行程推荐" left-arrow @click-left="goBack" />
    <div class="page-content">
      <div v-if="loading" class="loading-container">
        <van-loading size="48px" type="spinner" />
      </div>
      <div v-else-if="error">
        <van-empty description="描述文字" >
            <van-button @click="fetchRecommend" type="primary" class="bottom-button">按钮</van-button>
        </van-empty>
      </div>
      <template v-else-if="tripData && tripData.success === true">
        <div class="card overview-card">
            <h2>{{tripData.city}} · {{tripData.days}}天的行程</h2>
        </div>
        <van-collapse v-model="activeDays">
            <van-collapse-item 
            v-for="day in tripData.dailyItinerary" 
            :key="day.days" 
            :title="'第' + day.day + '天'"
            :name="day.days">
            <div class="day-schedule">
                <div class="schedule_section">
                    <div class="section-label morning">上午</div>
                    <SpotItem :data="day.morning"/>
                </div>
                <div class="schedule_section">
                    <div class="section-label afternoon">下午</div>
                    <SpotItem :data="day.afternoon"/>
                </div>
                <div class="schedule_section">
                    <div class="section-label evening">晚上</div>
                    <SpotItem :data="day.evening"/>
                </div>
            </div>
            </van-collapse-item>
        </van-collapse>
        <div class="card budget-card">
            <div class="section-title">预算明细</div>
            <BudgetTable :data="tripData.budgetBreakdown" :total="tripData.totalBudget" />
        </div>
        <div class="card tips-card">
            <div class="section-title">温馨提示</div>
            <ul class="tips-list">
                <li v-for="tip in tripData.tips" :key="tip">{{tip}}</li>
            </ul>
        </div>
        <div class="card warnings-card">
            <div class="section-title">注意事项</div>
            <ul class="warnings-list">
                <li v-for="warning in tripData.warnings" :key="warning">{{warning}}</li>
            </ul>
        </div>
      </template>
    </div>
    <div v-if="tripData && tripData.success !==false" class="detail-footer">
        <van-button @click="goToChat" type="primary" size="large" round calss="primary-button">咨询 AI 助手</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import { post } from '@/utils/request' 
import SpotItem from '@/components/SpotItem.vue'
import BudgetTable from '@/components/BudgetTable.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const result = ref(null)
const error = ref(false)
const tripData = ref(null)
const activeDays = ref([])

const goBack = () => router.back()

const fetchRecommend = async () => {
  loading.value = true
  error.value = false

  try {
    const params = {
      city: route.query.city || '北京',
      budget: parseInt(route.query.budget) || 5000,
      days: parseInt(route.query.days) || 2
    }
    const response = await post('/api/travel/recommend', params)
    tripData.value = response.data || {}
  } catch (err) {
    error.value = true
    console.error('推荐获取失败：', err)
  } finally {
    loading.value = false
  }
}
const goToChat = () => {
    router.push({ name: 'Chat' })
}

onMounted(() => {
    fetchRecommend()
})

</script>

<style scoped>
.page-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 70px;
}
.card {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 12px;
}
.page-content {
    padding: 16px;
}
.overview-card {
  margin-bottom: 16px;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trip-header h2 {
  font-size: 20px;
  color: #323233;
  margin: 0;
}

.trip-budget {
  font-size: 16px;
  color: #ee0a24;
  font-weight: 600;
}

.trip-collapse {
  margin-bottom: 16px;
}

.day-schedule {
  padding: 8px 0;
}

.schedule-section {
  margin-bottom: 16px;
}

.schedule-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}

.section-label.morning {
  background: #fff7e6;
  color: #fa8c16;
}

.section-label.afternoon {
  background: #e6f7ff;
  color: #1890ff;
}

.section-label.evening {
  background: #f6ffed;
  color: #52c41a;
}

.budget-card,
.tips-card,
.warnings-card {
  margin-bottom: 16px;
}

.tips-list,
.warnings-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li,
.warnings-list li {
  padding: 8px 0;
  color: #666;
  font-size: 14px;
  border-bottom: 1px solid #f5f5f5;
}

.tips-list li:last-child,
.warnings-list li:last-child {
  border-bottom: none;
}

.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  max-width: 750px;
  margin: 0 auto;
}

.error-card {
  text-align: center;
  padding: 40px 16px;
}
</style>
