// pages/student/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      name: '小明',
      avatar: '',
      points: 328
    },
    todayEvaluation: {
      course: '数学',
      score: 95,
      comment: '今天表现非常出色！能够主动思考问题，积极回答问题，作业完成质量很高。继续保持！',
      teacher: '张老师',
      time: '14:30'
    },
    stats: [
      { icon: '📚', label: '课程', value: '12', color: 'purple' },
      { icon: '⭐', label: '好评', value: '45', color: 'blue' },
      { icon: '🏆', label: '奖励', value: '8', color: 'pink' },
      { icon: '📈', label: '排名', value: 'Top 5', color: 'orange' }
    ],
    recentPhotos: [
      { url: 'https://via.placeholder.com/200', date: '01-26' },
      { url: 'https://via.placeholder.com/200', date: '01-25' },
      { url: 'https://via.placeholder.com/200', date: '01-24' },
      { url: 'https://via.placeholder.com/200', date: '01-23' }
    ],
    quickActions: [
      { icon: '📝', label: '我的作业', action: 'homework', color: 'purple' },
      { icon: '📊', label: '成绩单', action: 'report', color: 'blue' },
      { icon: '💬', label: '消息', action: 'message', color: 'pink' },
      { icon: '⚙️', label: '设置', action: 'settings', color: 'green' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserData();
    this.loadTodayEvaluation();
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    // TODO: 从后端API获取用户信息
    // wx.request({ url: '...', success: (res) => { ... } })
  },

  /**
   * 加载今日评价
   */
  loadTodayEvaluation() {
    // TODO: 从后端API获取今日评价
  },

  /**
   * 查看历史评价
   */
  goToHistory() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 查看全部照片
   */
  goToPhotos() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 预览照片
   */
  previewPhoto(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: this.data.recentPhotos.map(p => p.url),
      current: url,
      fail: (err) => {
        wx.showToast({
          title: '图片加载失败',
          icon: 'none'
        });
        console.error('Preview image failed:', err);
      }
    });
  },

  /**
   * 处理快捷操作
   */
  handleAction(e) {
    const action = e.currentTarget.dataset.action;
    wx.showToast({
      title: `${action} 功能开发中`,
      icon: 'none'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadUserData();
    this.loadTodayEvaluation();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我的学习成长记录',
      path: '/pages/student/home/home'
    };
  }
})