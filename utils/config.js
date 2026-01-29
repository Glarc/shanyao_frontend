// API配置文件
const config = {
  // 后端API基础URL
  // 开发环境使用localhost，生产环境需要替换为实际域名
  apiBaseUrl: 'http://localhost:8000/api/v1',
  
  // 微信小程序相关配置
  wechat: {
    appId: '', // 需要在微信公众平台获取
  },
  
  // 存储键名
  storageKeys: {
    token: 'access_token',
    userInfo: 'user_info',
    role: 'role'
  }
}

module.exports = config
