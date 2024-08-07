import request from '@/utils/request'

export function getCount() {
  return request({
    url: '/song/get-count',
    method: 'get'
  })
}
