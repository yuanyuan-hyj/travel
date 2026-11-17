import request from '@/utils/request'

/**
 * 旅游推荐接口
 * @param {Object} params { city, budget, days }
 * @returns Promise
 */
export function recommend(params) {
  return request({
    url: '/api/travel/recommend',
    method: 'post',
    data: {
      city: params.city,
      budget: params.budget,
      days: params.days,
    },
  })
}
