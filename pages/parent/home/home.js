// pages/parent/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parentInfo: {
      name: '王先生',
      avatar: ''
    },
    childInfo: {
      name: '王小明',
      avatar: '',
      className: '三年级 2 班',
      weekScore: 92
    },
    childStats: [
      { icon: '📚', label: '课程', value: '12' },
      { icon: '⭐', label: '好评', value: '35' },
      { icon: '📷', label: '照片', value: '48' },
      { icon: '🏆', label: '奖励', value: '6' }
    ],
    todayEvaluations: [
      {
        id: 1,
        course: '数学',
        score: 95,
        comment: '今天表现非常出色！能够主动思考问题，积极回答问题，作业完成质量很高。',
        teacher: '张老师',
        time: '14:30',
        tags: '认真 积极'
      },
      {
        id: 2,
        course: '语文',
        score: 88,
        comment: '课堂表现良好，朗读流利，但需要加强字词记忆。',
        teacher: '李老师',
        time: '10:30',
        tags: '进步'
      }
    ],
    trendPeriod: 'week',
    trendData: [
      { label: '周一', score: 85 },
      { label: '周二', score: 88 },
      { label: '周三', score: 92 },
      { label: '周四', score: 87 },
      { label: '周五', score: 95 },
      { label: '周六', score: 90 },
      { label: '周日', score: 93 }
    ],
    averageScore: 90,
    recentPhotos: [
      { id: 1, url: 'https://via.placeholder.com/200', date: '01-26' },
      { id: 2, url: 'https://via.placeholder.com/200', date: '01-25' },
      { id: 3, url: 'https://via.placeholder.com/200', date: '01-24' },
      { id: 4, url: 'https://via.placeholder.com/200', date: '01-23' },
      { id: 5, url: 'https://via.placeholder.com/200', date: '01-22' },
      { id: 6, url: 'https://via.placeholder.com/200', date: '01-21' }
    ],
    quickActions: [
      { icon: '📊', label: '成绩单', action: 'report', color: 'blue' },
      { icon: '📅', label: '课程表', action: 'schedule', color: 'pink' },
      { icon: '💬', label: '消息', action: 'message', color: 'green' },
      { icon: '⚙️', label: '设置', action: 'settings', color: 'purple' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadChildInfo();
    this.loadTodayEvaluations();
    this.loadTrendData();
  },

  /**
   * 加载孩子信息
   */
  loadChildInfo() {
    // TODO: 从后端API获取孩子信息
  },

  /**
   * 加载今日评价
   */
  loadTodayEvaluations() {
    // TODO: 从后端API获取今日评价
  },

  /**
   * 加载趋势数据
   */
  loadTrendData() {
    // TODO: 从后端API获取趋势数据
    this.calculateAverage();
  },

  /**
   * 计算平均分
   */
  calculateAverage() {
    const scores = this.data.trendData.map(d => d.score);
    if (scores.length === 0) {
      this.setData({ averageScore: 0 });
      return;
    }
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    this.setData({ averageScore: avg });
  },

  /**
   * 切换孩子
   */
  switchChild() {
    wx.showToast({
      title: '切换孩子功能开发中',
      icon: 'none'
    });
  },

  /**
   * 查看所有评价
   */
  viewAllEvaluations() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 改变趋势周期
   */
  changeTrendPeriod(e) {
    const period = e.currentTarget.dataset.period;
    this.setData({ trendPeriod: period });
    
    // 根据周期加载不同的数据
    if (period === 'month') {
      this.setData({
        trendData: [
          { label: '第1周', score: 87 },
          { label: '第2周', score: 89 },
          { label: '第3周', score: 91 },
          { label: '第4周', score: 93 }
        ]
      });
    } else {
      this.setData({
        trendData: [
          { label: '周一', score: 85 },
          { label: '周二', score: 88 },
          { label: '周三', score: 92 },
          { label: '周四', score: 87 },
          { label: '周五', score: 95 },
          { label: '周六', score: 90 },
          { label: '周日', score: 93 }
        ]
      });
    }
    this.calculateAverage();
  },

  /**
   * 查看所有照片
   */
  viewAllPhotos() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 预览照片
   */
  previewPhoto(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      urls: this.data.recentPhotos.map(p => p.url),
      current: this.data.recentPhotos[index].url,
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
  handleQuickAction(e) {
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
    this.loadChildInfo();
    this.loadTodayEvaluations();
    this.loadTrendData();
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
      title: `${this.data.childInfo.name}的成长记录`,
      path: '/pages/parent/home/home'
    };
  }
})