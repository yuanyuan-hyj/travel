<template>
  <div class="page-container">
    <van-nav-bar title="智能旅游助手" />

    <div class="page-content">
      <van-notice-bar
        left-icon="volume-o"
        text="基于 AI 的智能景点介绍与行程规划系统"
      />  
      <div class="card" style="margin-top: 16px;">
        <div class="section-title">
          规划你的旅程
        </div>
        <van-field
          label="目的地"
          is-link
          readonly
          @click="showCityPicker = true"
          v-model="formData.city"
          placeholder="请选择城市"
          style="background-color: #f7f7f7; border-radius: 8px; margin-bottom: 8px;"
        />
        <van-field
          label="预算（元）"
          v-model="formData.budget"
          placeholder="请输入预算金额"
          style="background-color: #f7f7f7; border-radius: 8px; margin-bottom: 8px;"
        />
        <van-field
          label="天数"
          v-model="formData.days"
          placeholder="请输入天数"
          style="background-color: #f7f7f7; border-radius: 8px; margin-bottom: 8px;"
        />
        <van-button type="primary" size="large" @click="handleSubmit">
          开始规划
        </van-button>
      </div>

      <!-- 快捷入口 -->
      <div class="card">
        <div class="section-title">
          快捷入口
        </div>
        <div class="quick-entry">
          <div @click="goPage('/chat')" class="entry-item">
            <van-icon size="30" name="chat-o" />
            <span>AI 对话</span>
          </div>
          <div @click="goPage('/profile')" class="entry-item">
            <van-icon size="30" name="user-o" />
            <span>我的</span>
          </div>
        </div>
      </div>

      <!-- 热门目的地 -->
      <div class="card">
        <div class="section-title">热门目的地</div>
        <van-grid :gutter="12" :column-num="4">
          <van-grid-item @click="selectedCity(city)" v-for="city in hotCities" :key="city">
          <div class="city-tag" :class="{ active: formData.city === city }">
            {{city}}
          </div>
          </van-grid-item>
        </van-grid>

      </div>
    </div>

    <!-- 底部导航 -->
    <van-tabbar route>
      <van-tabbar-item to="/" icon="wap-home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/chat" icon="chat-o">对话</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 选择目的地弹窗 -->
    <van-popup
      round="bottom"
      v-model:show="showCityPicker"
      position="bottom">
      <van-picker
        title="选择目的地"
        :columns="columns"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant';

const router = useRouter()

const showCityPicker = ref(false)

const formData = reactive({
  "city":"",
  "budget": null,
  "days": null
})

const allCities = [
  '北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆',
  '南京', '武汉', '苏州', '长沙', '天津', '郑州', '济南', '青岛',
  '大连', '沈阳', '哈尔滨', '长春', '福州', '厦门', '南昌', '合肥',
  '昆明', '贵阳', '南宁', '桂林', '海口', '三亚', '丽江', '大理',
  '西安', '兰州', '乌鲁木齐', '拉萨', '呼和浩特', '太原', '石家庄'
]
const columns = allCities.map(city => ({ text: city,value: city}))

const hotCities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆']

const onConfirm = ({ selectedOptions}) => {
  console.log(selectedOptions[0])
  formData.city = selectedOptions[0].value
  showCityPicker.value = false
}
const onCancel = () =>{
  showCityPicker.value = false
}

//跳转页面
const goPage = (path) => {
  router.push(path)
}

//选择城市
const selectedCity = (city) => {
  formData.city = city
}

//旅游规划提交
const handleSubmit = () =>{
  console.log(formData)
  //校验
  if(!formData.city) {
    showToast('请选择目的地')
    return
  }
  if(!formData.budget || formData.budget < 100) {
    showToast('预算不能低于100元')
    return
  }
  if(!formData.days || formData.days < 1 || formData.days > 30) {
    showToast('天数必须在1到30天之间')
    return
  }
  router.push({
    path: '/detail',
    query: {
      city: formData.city,
      budget: formData.budget,
      days: formData.days
    }
  })
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 70px;
}

.page-content {
  padding: 16px;
}

/* 卡片 */
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

/* 提示栏 */
.notice-bar {
  display: flex;
  align-items: center;
  background-color: #fffbe6;
  color: #d48806;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
}
.notice-icon {
  margin-right: 12px;
  font-size: 20px;
}

/* 表单输入框 */
.form-field {
  background-color: #f7f7f7;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 0 12px;
}
.form-field :deep(.van-field__label) {
  width: 80px;
}

/* 提交按钮 */
.submit-btn {
  margin-top: 16px;
  height: 44px;
  font-size: 16px;
}

/* 快捷入口 */
.quick-entry {
  display: flex;
  justify-content: space-between;
}
.entry-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  border-radius: 8px;
  background-color: #f7f8fa;
  margin-right: 12px;
  
}
.entry-item:last-child{
  margin-right: 0;
}
.entry-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #646566;
  margin-bottom: 8px;
}
.entry-icon svg {
  width: 24px;
  height: 24px;
}
.entry-text{
  font-size: 14px;
  color: #646566;
}

/* 热门目的地 */
.hot-destinations {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.city-tag {
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
  background: #f7f8fa;
  transition: all 0.3s;
}
.city-tag.active {
  background-color: #007AFF;
  color: #fff;
}
</style>
