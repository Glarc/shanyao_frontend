// pages/teacher/home/home.js
const api = require('../../../utils/api.js')
const config = require('../../../utils/config.js')

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
    todayClasses: [],
    weekStats: [
      { icon: '📚', label: '授课', value: '0', color: 'blue' },
      { icon: '✍️', label: '评价', value: '0', color: 'green' },
      { icon: '📷', label: '照片', value: '0', color: 'orange' },
      { icon: '⭐', label: '平均分', value: '0', color: 'purple' }
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
    this.loadUserInfo();
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
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync(config.storageKeys.userInfo)
    if (userInfo && userInfo.name) {
      this.setData({
        'teacherInfo.name': userInfo.name,
        'teacherInfo.avatar': userInfo.avatar_url || ''
      })
    }
  },

  /**
   * 加载今日课程
   */
  loadTodayClasses() {
    wx.showLoading({ title: '加载中...' })
    
    api.getTeacherClasses()
      .then(classes => {
        // 将后端返回的班级数据转换为前端格式
        // 注意：后端返回的是班级，不是今日课程，这里做一个简单的映射
        const todayClasses = classes.map((cls, index) => ({
          id: cls.id,
          time: this.getClassTime(index), // 模拟课程时间
          name: cls.name,
          room: `教室 ${cls.grade}`, // 使用年级作为教室信息
          studentCount: 0, // 需要单独获取学生数量
          evaluatedCount: 0, // 需要单独获取评价数量
          evaluated: false
        }))
        
        this.setData({ todayClasses })
        
        // 获取每个班级的学生数量
        this.loadClassStudentCounts(classes)
        
        wx.hideLoading()
      })
      .catch(err => {
        console.error('加载班级列表失败', err)
        wx.hideLoading()
        // 失败时保持使用模拟数据，不影响UI展示
      })
  },

  /**
   * 获取课程时间（模拟）
   */
  getClassTime(index) {
    const times = [
      '09:00-10:30',
      '14:00-15:30',
      '16:00-17:30'
    ]
    return times[index] || '待定'
  },

  /**
   * 加载各班级学生数量
   */
  loadClassStudentCounts(classes) {
    classes.forEach((cls, index) => {
      api.getClassStudents(cls.id, { page: 1, page_size: 1 })
        .then(res => {
          const studentCount = res.total || 0
          this.setData({
            [`todayClasses[${index}].studentCount`]: studentCount
          })
        })
        .catch(err => {
          console.error(`加载班级${cls.id}学生数失败`, err)
        })
    })
  },

  /**
   * 加载本周统计
   */
  loadWeekStats() {
    // 获取本周的评价统计
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const params = {
      date_from: this.formatDate(weekAgo),
      date_to: this.formatDate(today),
      page: 1,
      page_size: 100 // 获取所有本周评价用于统计
    }
    
    api.getEvaluations(params)
      .then(res => {
        const evaluations = res.items || []
        const totalEvaluations = res.total || 0
        
        // 计算平均分
        let avgScore = 0
        if (evaluations.length > 0) {
          const totalScore = evaluations.reduce((sum, ev) => sum + (ev.score || 0), 0)
          avgScore = Math.round(totalScore / evaluations.length)
        }
        
        // 更新统计数据
        this.setData({
          weekStats: [
            { icon: '📚', label: '授课', value: this.data.todayClasses.length.toString(), color: 'blue' },
            { icon: '✍️', label: '评价', value: totalEvaluations.toString(), color: 'green' },
            { icon: '📷', label: '照片', value: '0', color: 'orange' }, // 照片统计需要单独接口
            { icon: '⭐', label: '平均分', value: avgScore.toString(), color: 'purple' }
          ]
        })
      })
      .catch(err => {
        console.error('加载统计数据失败', err)
        // 失败时保持使用默认数据
      })
  },

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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
    // TODO: 创建评价页面后取消注释
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
    this.loadUserInfo();
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