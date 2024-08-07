import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    params: { ...data }
  })
}

export function register(user) {
  return request({
    url: '/user/register',
    method: 'post',
    params: { ...user }
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout(token) {
  return request({
    url: `/user/logout/${token}`,
    method: 'post'
  })
}

export function send(user) {
  return request({
    url: '/user/send-email',
    method: 'post',
    params: { ...user }
  })
}
