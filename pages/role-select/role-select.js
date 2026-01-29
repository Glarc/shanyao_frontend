const api = require('../../utils/api.js')
const config = require('../../utils/config.js')

Page({
  data: {},

  onLoad() {
    // 如果已经选过角色，可直接跳转（按你需求决定是否启用）
    const userInfo = wx.getStorageSync(config.storageKeys.userInfo)
    if (userInfo && userInfo.role) {
      // 如果你希望每次都重新选择，把下面两行删掉即可
      // this.redirectByRole(userInfo.role);
    }
  },

  onSelectRole(e) {
    const role = e.currentTarget.dataset.role; // parent | student | teacher
    if (!role) return;

    // 显示加载提示
    wx.showLoading({
      title: '切换角色中...',
      mask: true
    })

    // 调用后端API选择角色
    api.selectRole(role)
      .then(() => {
        // 更新本地存储
        const userInfo = wx.getStorageSync(config.storageKeys.userInfo) || {}
        userInfo.role = role
        wx.setStorageSync(config.storageKeys.userInfo, userInfo)
        
        wx.hideLoading()
        wx.showToast({
          title: '角色切换成功',
          icon: 'success',
          duration: 1500
        })
        
        // 跳转到对应页面
        setTimeout(() => {
          this.redirectByRole(role)
        }, 1500)
      })
      .catch(err => {
        wx.hideLoading()
        console.error('角色选择失败', err)
        // 即使失败也允许跳转（降级处理）
        // 修复：应该保存实际的role值，而不是storage key
        const userInfo = wx.getStorageSync(config.storageKeys.userInfo) || {}
        userInfo.role = role
        wx.setStorageSync(config.storageKeys.userInfo, userInfo)
        this.redirectByRole(role)
      })
  },

  redirectByRole(role) {
    // 你需要在 app.json 里提前注册这些页面路径
    const routeMap = {
      parent: '/pages/parent/home/home',   // 家长首页
      student: '/pages/student/home/home', // 学生首页
      teacher: '/pages/teacher/home/home', // 老师首页
    };

    const url = routeMap[role] || '/pages/role-select/role-select';

    // 用 redirectTo 避免返回到选择页（你也可以用 navigateTo）
    wx.redirectTo({ url });
  }
});
