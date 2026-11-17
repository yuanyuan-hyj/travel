
<template>
  <div class="page-container chat-page">
    <div class="page-header" style="height: 46px;">
      <van-nav-bar
        title="AI旅游助手"
        left-arrow
        left-text="返回"
        fixed
        @click-left="onBack"
        />
    </div>
    <div class="chat-container" ref="chatContainer">
    <!-- 还没有进行对话 -->
      <div v-if="messages.length === 0" class="chat-empty">
        <van-empty description="开始和 AI旅游助手 对话" />
        <div class="quick-questions">
          <div class="quick-title">常见问题</div>
          <van-tag class="quick-tag" v-for="question in quickQuestions" :key="question" mark size="large">{{ question }}</van-tag>
        </div>
      </div>
      <!-- 有对话内容 -->
      <div  class="message-list" v-else>
        <ChatBubble v-for="message in messages" :key="message.id" :message="message" />
        <div v-if="isStreaming" class="streaming-indicator">
          <van-loading type="spinner" size="20px" />
          <span>AI正在思考中...</span>
        </div>
      </div>   
    </div>
    <div class="chat-input-area">
        <van-field
            v-model="inputMessage"
            placeholder="输入您的问题..."
            :disabled="isStreaming"
        >
            <template #button>
            <van-button :disabled="!inputMessage.trim()" @click="sendMessage" size="small" type="primary">发送</van-button>
            </template>
        </van-field>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { fetchStream } from '@/utils/request'
import { showToast } from 'vant'
import ChatBubble from '@/components/ChatBubble.vue'

//聊天容器
const chatContainer = ref(null)

//滚动条
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const router = useRouter()
const onBack = () => {
  router.back()
}

const inputMessage = ref('')
const isStreaming = ref(false)

//发送消息
const sendMessage = () => {
  const msg = inputMessage.value.trim()
  if (!msg || isStreaming.value){
    return
  }
  //创建用户的会话消息
  addUserMessage(msg)
  const userMsg = inputMessage.value
  inputMessage.value = ''
  //调用流式响应方法
  fetchAIResponse(userMsg)
}

const addUserMessage = (msg) => {
  messages.value.push({
    id: Date.now() + 1,
    role: 'user',
    content: msg,
    timestamp: new Date().toISOString()
  })
}

//获取流式响应
const fetchAIResponse = (userMsg) =>{
  isStreaming.value = true
  //添加AI返回的消息
  messages.value.push({
    id: Date.now() + 2,
    role: 'ai',
    content: '',
    timestamp: new Date().toISOString()
  })

  let fullResponse = ''

  fetchStream('chat', { message: userMsg }, (chunk) => {
    fullResponse += chunk
    //AI正在回复的消息
    const lastMsg = messages.value[messages.value.length - 1]
    if(lastMsg && lastMsg.role === 'ai'){
      lastMsg.content = fullResponse
    }
    scrollToBottom()
  }, () => {
    //AI回复完成
    isStreaming.value = false
    scrollToBottom()
  }, (errMsg) => {
    const lastMsg = messages.value[messages.value.length - 1]
    if(lastMsg && lastMsg.role === 'ai'){
      lastMsg.content = '抱歉，AI发生错误：${errMsg}'
    }
    isStreaming.value = false
    showToast('AI回复失败，请稍后重试')
    scrollToBottom()
  })
}

const quickQuestions = ref([
  '北京有哪些必去的景点？',
  '上海美食推荐',
  '成都三日游攻略',
  '如何选择旅行保险？'
])
const messages = ref([])
</script>


<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-bottom: 50px;
}

.chat-container {
  height: 640px;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 60px;
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.quick-questions {
  margin-top: 32px;
  text-align: center;
}

.quick-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

.quick-tag {
  margin: 8px;
  cursor: pointer;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #999;
  font-size: 14px;
}

.chat-input-area {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  background: #fff;
  padding: 8px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  max-width: 750px;
  margin: 0 auto;
}

.chat-input-area :deep(.van-field) {
  background: #f7f8fa;
  border-radius: 20px;
  padding: 8px 16px;
}
</style>