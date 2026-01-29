const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} date - 日期对象
 * @returns {String} 格式化后的日期字符串
 */
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期为短格式 MM-DD
 * @param {String} dateStr - 日期字符串 YYYY-MM-DD
 * @returns {String} 格式化后的日期字符串
 */
const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length >= 3) {
    return `${parts[1]}-${parts[2]}`
  }
  return dateStr
}

/**
 * 格式化时间为 HH:MM
 * @param {String} datetime - ISO 8601 日期时间字符串
 * @returns {String} 格式化后的时间字符串
 */
const formatTimeOnly = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * 格式化日期标签（显示星期）
 * @param {String} dateStr - 日期字符串
 * @returns {String} 星期标签
 */
const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

module.exports = {
  formatTime,
  formatNumber,
  formatDate,
  formatDateShort,
  formatTimeOnly,
  formatDateLabel
}
