// app.js
const api = require('./utils/api.js')
const config = require('./utils/config.js')

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 微信登录
    this.doWechatLogin()
  },
  
  globalData: {
    userInfo: null
  },
  
  /**
   * 执行微信登录
   */
  doWechatLogin() {
    wx.login({
      success: res => {
        if (res.code) {
          // 调用后端接口，发送 code 换取 token
          api.wechatLogin(res.code)
            .then(data => {
              // 保存token和用户信息
              if (data.access_token) {
                wx.setStorageSync(config.storageKeys.token, data.access_token)
              }
              if (data.user) {
                wx.setStorageSync(config.storageKeys.userInfo, data.user)
                this.globalData.userInfo = data.user
                
                // 如果用户已选择角色，跳转到对应页面
                if (data.user.role) {
                  // 根据角色跳转
                  this.redirectByRole(data.user.role)
                }
              }
              console.log('微信登录成功', data)
            })
            .catch(err => {
              console.error('微信登录失败', err)
              // 登录失败时可以继续使用，稍后再试
            })
        } else {
          console.error('微信登录失败，未获取到code', res.errMsg)
        }
      },
      fail: err => {
        console.error('wx.login调用失败', err)
      }
    })
  },
  
  /**
   * 根据角色跳转到对应页面
   * @param {String} role - 用户角色
   */
  redirectByRole(role) {
    const routeMap = {
      parent: '/pages/parent/home/home',
      student: '/pages/student/home/home',
      teacher: '/pages/teacher/home/home'
    }
    
    const url = routeMap[role]
    if (url) {
      wx.reLaunch({ url })
    }
  },
  
  /**
   * 获取用户信息（优先从缓存）
   */
  getUserInfo() {
    if (this.globalData.userInfo) {
      return Promise.resolve(this.globalData.userInfo)
    }
    
    const cachedUser = wx.getStorageSync(config.storageKeys.userInfo)
    if (cachedUser) {
      this.globalData.userInfo = cachedUser
      return Promise.resolve(cachedUser)
    }
    
    // 从后端获取
    return api.getCurrentUser()
      .then(user => {
        this.globalData.userInfo = user
        wx.setStorageSync(config.storageKeys.userInfo, user)
        return user
      })
  }
})
