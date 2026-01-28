// pages/teacher/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teacherInfo: {
      name: '张老师',
      avatar: ''
    },
    currentDate: {
      day: '',
      month: ''
    },
    todayClasses: [
      {
        id: 1,
        time: '09:00-10:30',
        name: '三年级数学',
        room: '教室 302',
        studentCount: 35,
        evaluatedCount: 28,
        evaluated: false
      },
      {
        id: 2,
        time: '14:00-15:30',
        name: '四年级数学',
        room: '教室 405',
        studentCount: 32,
        evaluatedCount: 32,
        evaluated: true
      },
      {
        id: 3,
        time: '16:00-17:30',
        name: '五年级数学',
        room: '教室 501',
        studentCount: 30,
        evaluatedCount: 0,
        evaluated: false
      }
    ],
    weekStats: [
      { icon: '📚', label: '授课', value: '15', color: 'blue' },
      { icon: '✍️', label: '评价', value: '245', color: 'green' },
      { icon: '📷', label: '照片', value: '67', color: 'orange' },
      { icon: '⭐', label: '平均分', value: '92', color: 'purple' }
    ],
    quickActions: [
      { icon: '✏️', label: '快速评价', desc: '给学生打分评价', action: 'evaluate', color: 'purple' },
      { icon: '📊', label: '班级统计', desc: '查看班级数据', action: 'stats', color: 'blue' },
      { icon: '📷', label: '上传照片', desc: '记录精彩瞬间', action: 'upload', color: 'pink' },
      { icon: '📝', label: '历史记录', desc: '查看评价历史', action: 'history', color: 'green' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initDate();
    this.loadTodayClasses();
    this.loadWeekStats();
  },

  /**
   * 初始化日期
   */
  initDate() {
    const now = new Date();
    this.setData({
      currentDate: {
        day: now.getDate().toString(),
        month: `${now.getMonth() + 1}月`
      }
    });
  },

  /**
   * 加载今日课程
   */
  loadTodayClasses() {
    // TODO: 从后端API获取今日课程
    // wx.request({ url: '...', success: (res) => { ... } })
  },

  /**
   * 加载本周统计
   */
  loadWeekStats() {
    // TODO: 从后端API获取本周统计
  },

  /**
   * 前往评价页面
   */
  goToEvaluate(e) {
    const classId = e.currentTarget.dataset.classId;
    wx.showToast({
      title: `前往评价课程 ${classId}`,
      icon: 'none'
    });
    // wx.navigateTo({
    //   url: `/pages/teacher/evaluate/evaluate?classId=${classId}`
    // });
  },

  /**
   * 快速评价
   */
  quickEvaluate() {
    // 找到第一个未评价的课程
    const pendingClass = this.data.todayClasses.find(c => !c.evaluated);
    if (pendingClass) {
      this.goToEvaluate({ currentTarget: { dataset: { classId: pendingClass.id } } });
    } else {
      wx.showToast({
        title: '今日课程已全部评价',
        icon: 'success'
      });
    }
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
    this.loadTodayClasses();
    this.loadWeekStats();
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
      title: '我的教学管理',
      path: '/pages/teacher/home/home'
    };
  }
})