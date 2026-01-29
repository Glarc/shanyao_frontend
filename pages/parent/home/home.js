// pages/parent/home/home.js
const api = require('../../../utils/api.js')
const config = require('../../../utils/config.js')

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
      id: null,
      name: '加载中...',
      avatar: '',
      className: '',
      weekScore: 0
    },
    childStats: [
      { icon: '📚', label: '课程', value: '0' },
      { icon: '⭐', label: '好评', value: '0' },
      { icon: '📷', label: '照片', value: '0' },
      { icon: '🏆', label: '奖励', value: '0' }
    ],
    todayEvaluations: [],
    trendPeriod: 'week',
    trendData: [],
    averageScore: 0,
    recentPhotos: [],
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
    this.loadUserInfo();
    this.loadChildInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync(config.storageKeys.userInfo)
    if (userInfo && userInfo.name) {
      this.setData({
        'parentInfo.name': userInfo.name,
        'parentInfo.avatar': userInfo.avatar_url || ''
      })
    }
  },

  /**
   * 加载孩子信息
   */
  loadChildInfo() {
    wx.showLoading({ title: '加载中...' })
    
    // 获取家长关联的学生列表
    api.getParentStudents()
      .then(students => {
        if (students && students.length > 0) {
          // 选择第一个学生
          const student = students[0]
          this.setData({
            childInfo: {
              id: student.id,
              name: student.name,
              avatar: student.avatar_url || '',
              className: student.class_name || '未分配班级',
              weekScore: 0 // 从评价趋势计算
            }
          })
          
          // 加载该学生的数据
          this.loadTodayEvaluations()
          this.loadTrendData()
          this.loadRecentPhotos()
        } else {
          // 没有关联学生
          this.setData({
            'childInfo.name': '暂无关联学生',
            'childInfo.className': ''
          })
          wx.hideLoading()
          wx.showToast({
            title: '暂无关联学生',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        console.error('加载学生信息失败', err)
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      })
  },

  /**
   * 加载今日评价
   */
  loadTodayEvaluations() {
    const studentId = this.data.childInfo.id
    if (!studentId) return
    
    api.getTodayEvaluation(studentId)
      .then(evaluation => {
        if (evaluation) {
          // 将单个评价转换为数组格式
          const todayEvaluations = [{
            id: evaluation.id,
            course: '今日评价', // 后端没有返回课程，使用固定文本
            score: evaluation.score,
            comment: evaluation.content,
            teacher: '老师', // 可以从teacher_id获取
            time: this.formatTime(evaluation.created_at),
            tags: this.extractTags(evaluation.content)
          }]
          
          this.setData({ todayEvaluations })
        } else {
          this.setData({ todayEvaluations: [] })
        }
      })
      .catch(err => {
        console.error('加载今日评价失败', err)
        this.setData({ todayEvaluations: [] })
      })
  },

  /**
   * 加载趋势数据
   */
  loadTrendData() {
    const studentId = this.data.childInfo.id
    if (!studentId) return
    
    // 获取最近7天的数据
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
    
    const params = {
      date_from: this.formatDate(weekAgo),
      date_to: this.formatDate(today)
    }
    
    api.getEvaluationTrend(studentId, params)
      .then(trend => {
        if (trend && trend.length > 0) {
          // 转换为前端格式
          const trendData = trend.map(item => ({
            label: this.formatDateLabel(item.date),
            score: item.score
          }))
          
          this.setData({ trendData })
          this.calculateAverage()
          this.calculateWeekScore()
        } else {
          this.setData({ trendData: [], averageScore: 0 })
        }
        
        wx.hideLoading()
      })
      .catch(err => {
        console.error('加载趋势数据失败', err)
        wx.hideLoading()
      })
  },

  /**
   * 加载最近照片
   */
  loadRecentPhotos() {
    const studentId = this.data.childInfo.id
    if (!studentId) return
    
    // 获取最近几天的照片（这里只获取今天的，实际可以循环多天）
    const today = this.formatDate(new Date())
    
    api.getParentStudentPhotos(studentId, today)
      .then(photos => {
        if (photos && photos.length > 0) {
          const recentPhotos = photos.map(photo => ({
            id: photo.id,
            url: photo.url,
            date: this.formatDateShort(photo.photo_date)
          }))
          
          this.setData({ recentPhotos })
        }
      })
      .catch(err => {
        console.error('加载照片失败', err)
      })
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
   * 计算本周表现分
   */
  calculateWeekScore() {
    const scores = this.data.trendData.map(d => d.score);
    if (scores.length === 0) {
      this.setData({ 'childInfo.weekScore': 0 });
      return;
    }
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    this.setData({ 'childInfo.weekScore': avg });
  },

  /**
   * 格式化时间
   */
  formatTime(datetime) {
    if (!datetime) return ''
    const date = new Date(datetime)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
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
   * 格式化日期为短格式 MM-DD
   */
  formatDateShort(dateStr) {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length >= 3) {
      return `${parts[1]}-${parts[2]}`
    }
    return dateStr
  },

  /**
   * 格式化日期标签
   */
  formatDateLabel(dateStr) {
    const date = new Date(dateStr)
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  },

  /**
   * 从评价内容提取标签（简单实现）
   */
  extractTags(content) {
    if (!content) return ''
    // 简单提取：如果包含"认真"、"积极"等关键词
    const keywords = ['认真', '积极', '进步', '优秀', '努力']
    const foundTags = keywords.filter(keyword => content.includes(keyword))
    return foundTags.join(' ')
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
    
    // 重新加载数据
    if (period === 'month') {
      // 加载月度数据
      const studentId = this.data.childInfo.id
      if (!studentId) return
      
      const today = new Date()
      const monthAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)
      
      const params = {
        date_from: this.formatDate(monthAgo),
        date_to: this.formatDate(today)
      }
      
      api.getEvaluationTrend(studentId, params)
        .then(trend => {
          if (trend && trend.length > 0) {
            // 按周聚合数据
            const weeklyData = this.aggregateByWeek(trend)
            this.setData({ trendData: weeklyData })
            this.calculateAverage()
          }
        })
        .catch(err => {
          console.error('加载月度数据失败', err)
        })
    } else {
      // 加载周数据
      this.loadTrendData()
    }
  },

  /**
   * 按周聚合数据
   */
  aggregateByWeek(trend) {
    // 简单实现：每7天一组
    const weeks = []
    for (let i = 0; i < trend.length; i += 7) {
      const weekData = trend.slice(i, i + 7)
      const avgScore = Math.round(
        weekData.reduce((sum, item) => sum + item.score, 0) / weekData.length
      )
      weeks.push({
        label: `第${Math.floor(i / 7) + 1}周`,
        score: avgScore
      })
    }
    return weeks
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