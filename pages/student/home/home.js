// pages/student/home/home.js
const api = require('../../../utils/api.js')
const config = require('../../../utils/config.js')
const util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      id: null,
      name: '加载中...',
      avatar: '',
      points: 0
    },
    todayEvaluation: null,
    stats: [
      { icon: '📚', label: '课程', value: '0', color: 'purple' },
      { icon: '⭐', label: '好评', value: '0', color: 'blue' },
      { icon: '🏆', label: '奖励', value: '0', color: 'pink' },
      { icon: '📈', label: '排名', value: '-', color: 'orange' }
    ],
    recentPhotos: [],
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
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    wx.showLoading({ title: '加载中...' })
    
    // 获取当前用户信息
    const userInfo = wx.getStorageSync(config.storageKeys.userInfo)
    if (userInfo) {
      this.setData({
        userInfo: {
          id: userInfo.id,
          name: userInfo.name || '学生',
          avatar: userInfo.avatar_url || '',
          points: 0 // 积分系统需要后端额外实现
        }
      })
      
      // 学生角色需要通过家长端API获取数据
      // 这里使用家长API作为示例，实际应该有学生专用API
      this.loadTodayEvaluation()
      this.loadRecentPhotos()
      
      wx.hideLoading()
    } else {
      // 尝试从后端获取
      api.getCurrentUser()
        .then(user => {
          this.setData({
            userInfo: {
              id: user.id,
              name: user.name || '学生',
              avatar: user.avatar_url || '',
              points: 0
            }
          })
          
          this.loadTodayEvaluation()
          this.loadRecentPhotos()
          
          wx.hideLoading()
        })
        .catch(err => {
          console.error('加载用户信息失败', err)
          wx.hideLoading()
        })
    }
  },

  /**
   * 加载今日评价
   */
  loadTodayEvaluation() {
    const studentId = this.data.userInfo.id
    if (!studentId) return
    
    // 注意：学生查看自己的评价，这里使用家长API
    // 实际项目中应该有专门的学生API
    api.getTodayEvaluation(studentId)
      .then(evaluation => {
        if (evaluation) {
          this.setData({
            todayEvaluation: {
              course: '今日评价',
              score: evaluation.score,
              comment: evaluation.content,
              teacher: '老师',
              time: util.formatTimeOnly(evaluation.created_at)
            }
          })
        }
      })
      .catch(err => {
        console.error('加载今日评价失败', err)
      })
  },

  /**
   * 加载最近照片
   */
  loadRecentPhotos() {
    const studentId = this.data.userInfo.id
    if (!studentId) return
    
    const today = util.formatDate(new Date())
    
    api.getParentStudentPhotos(studentId, today)
      .then(photos => {
        // 检查photos是否为数组
        if (photos && Array.isArray(photos) && photos.length > 0) {
          const recentPhotos = photos.slice(0, 4).map(photo => ({
            url: photo.url,
            date: util.formatDateShort(photo.photo_date)
          }))
          
          this.setData({ recentPhotos })
        }
      })
      .catch(err => {
        console.error('加载照片失败', err)
      })
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