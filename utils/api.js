// API请求工具
const config = require('./config.js')

/**
 * 统一的网络请求封装
 * @param {Object} options - 请求选项
 * @param {String} options.url - 请求路径（相对于apiBaseUrl）
 * @param {String} options.method - 请求方法，默认GET
 * @param {Object} options.data - 请求数据
 * @param {Boolean} options.auth - 是否需要认证，默认true
 * @param {Object} options.header - 额外的请求头
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      auth = true,
      header = {}
    } = options

    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${config.apiBaseUrl}${url}`

    // 构建请求头
    const headers = {
      'Content-Type': 'application/json',
      ...header
    }

    // 添加认证token
    if (auth) {
      const token = wx.getStorageSync(config.storageKeys.token)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // 发起请求
    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: headers,
      success: (res) => {
        // 处理响应
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // 未授权，清除token并跳转到登录
          wx.removeStorageSync(config.storageKeys.token)
          wx.removeStorageSync(config.storageKeys.userInfo)
          wx.showToast({
            title: '请重新登录',
            icon: 'none'
          })
          // 跳转到首页重新登录
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }, 800)
          reject(new Error('未授权'))
        } else {
          // 其他错误
          const errorMsg = res.data && res.data.message ? res.data.message : `请求失败: ${res.statusCode}`
          wx.showToast({
            title: errorMsg,
            icon: 'none'
          })
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * GET请求
 */
function get(url, params = {}, options = {}) {
  // 将params转换为查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  })
}

/**
 * POST请求
 */
function post(url, data = {}, options = {}) {
  return request({
    url: url,
    method: 'POST',
    data: data,
    ...options
  })
}

/**
 * PUT请求
 */
function put(url, data = {}, options = {}) {
  return request({
    url: url,
    method: 'PUT',
    data: data,
    ...options
  })
}

/**
 * DELETE请求
 */
function del(url, options = {}) {
  return request({
    url: url,
    method: 'DELETE',
    ...options
  })
}

// ==================== 认证相关API ====================

/**
 * 微信登录
 * @param {String} code - 微信登录code
 */
function wechatLogin(code) {
  return post('/auth/wechat-login', { code }, { auth: false })
}

/**
 * 选择角色
 * @param {String} role - 角色: teacher, parent, student
 */
function selectRole(role) {
  return post('/auth/select-role', { role })
}

/**
 * 获取当前用户信息
 */
function getCurrentUser() {
  return get('/auth/me')
}

/**
 * 绑定手机号
 * @param {String} encryptedData - 加密数据
 * @param {String} iv - 加密算法初始向量
 */
function bindPhone(encryptedData, iv) {
  return post('/auth/bind-phone', { encrypted_data: encryptedData, iv })
}

// ==================== 教师相关API ====================

/**
 * 获取教师的班级列表
 */
function getTeacherClasses() {
  return get('/teacher/classes')
}

/**
 * 获取班级学生列表
 * @param {Number} classId - 班级ID
 * @param {Object} params - 查询参数 {kw, page, page_size}
 */
function getClassStudents(classId, params = {}) {
  return get(`/teacher/classes/${classId}/students`, params)
}

/**
 * 创建或更新评价
 * @param {Object} data - 评价数据 {student_id, eval_date, score, content}
 */
function createEvaluation(data) {
  return post('/teacher/evaluations', data)
}

/**
 * 获取评价列表
 * @param {Object} params - 查询参数 {class_id, student_id, date_from, date_to, page, page_size}
 */
function getEvaluations(params = {}) {
  return get('/teacher/evaluations', params)
}

/**
 * 获取上传凭证
 */
function getUploadCredential() {
  return post('/teacher/uploads/credential')
}

/**
 * 创建学生每日照片
 * @param {Number} studentId - 学生ID
 * @param {Object} data - 照片数据 {student_id, photo_date, photos: [{url, thumb_url, width, height}]}
 */
function createDailyPhotos(studentId, data) {
  return post(`/teacher/students/${studentId}/daily-photos`, data)
}

/**
 * 获取学生每日照片
 * @param {Number} studentId - 学生ID
 * @param {String} photoDate - 照片日期 YYYY-MM-DD
 */
function getStudentDailyPhotos(studentId, photoDate) {
  return get(`/teacher/students/${studentId}/daily-photos`, { photo_date: photoDate })
}

// ==================== 家长相关API ====================

/**
 * 获取家长的学生列表
 */
function getParentStudents() {
  return get('/parent/students')
}

/**
 * 获取今日评价
 * @param {Number} studentId - 学生ID
 */
function getTodayEvaluation(studentId) {
  return get('/parent/evaluations/today', { student_id: studentId })
}

/**
 * 获取历史评价
 * @param {Number} studentId - 学生ID
 * @param {Object} params - 查询参数 {page, page_size}
 */
function getEvaluationHistory(studentId, params = {}) {
  return get('/parent/evaluations/history', { student_id: studentId, ...params })
}

/**
 * 获取评价趋势
 * @param {Number} studentId - 学生ID
 * @param {Object} params - 查询参数 {date_from, date_to}
 */
function getEvaluationTrend(studentId, params = {}) {
  return get('/parent/evaluations/trend', { student_id: studentId, ...params })
}

/**
 * 获取学生每日照片（家长）
 * @param {Number} studentId - 学生ID
 * @param {String} photoDate - 照片日期 YYYY-MM-DD
 */
function getParentStudentPhotos(studentId, photoDate) {
  return get(`/parent/students/${studentId}/daily-photos`, { photo_date: photoDate })
}

module.exports = {
  // 通用请求方法
  request,
  get,
  post,
  put,
  del,
  
  // 认证API
  wechatLogin,
  selectRole,
  getCurrentUser,
  bindPhone,
  
  // 教师API
  getTeacherClasses,
  getClassStudents,
  createEvaluation,
  getEvaluations,
  getUploadCredential,
  createDailyPhotos,
  getStudentDailyPhotos,
  
  // 家长API
  getParentStudents,
  getTodayEvaluation,
  getEvaluationHistory,
  getEvaluationTrend,
  getParentStudentPhotos
}
