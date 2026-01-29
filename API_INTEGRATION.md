# API接口对齐文档

本文档说明前端与后端 API 的对齐情况和使用方法。

## 概述

前端已完成与 `Glarc/shanyao_backend` 后端 API 的完整对齐。所有接口调用都通过统一的 API 工具进行，支持自动认证、错误处理和数据缓存。

## 配置

### 1. 后端 API 地址配置

编辑 `utils/config.js` 文件，设置后端 API 地址：

```javascript
const config = {
  // 后端API基础URL
  apiBaseUrl: 'http://localhost:8000/api/v1',  // 开发环境
  // apiBaseUrl: 'https://your-domain.com/api/v1',  // 生产环境
  
  // 微信小程序配置
  wechat: {
    appId: '', // 在微信公众平台获取
  }
}
```

### 2. 微信小程序 AppID

在 `project.config.json` 中配置微信小程序的 AppID（如果还没有配置）。

## 已实现的功能

### 认证流程

1. **微信登录** (`app.js`)
   - 应用启动时自动调用 `wx.login()` 获取 code
   - 调用后端 `/api/v1/auth/wechat-login` 换取 token
   - 自动保存 token 和用户信息到本地存储

2. **角色选择** (`pages/role-select/role-select.js`)
   - 用户选择角色（家长/学生/教师）
   - 调用 `/api/v1/auth/select-role` 更新角色
   - 根据角色跳转到对应首页

3. **自动认证**
   - 所有需要认证的请求自动添加 `Authorization: Bearer <token>` 头
   - Token 失效时自动清除并跳转到登录页

### 教师端功能

**页面**: `pages/teacher/home/home.js`

- ✅ 获取教师班级列表
- ✅ 获取班级学生数量
- ✅ 获取本周评价统计
- ✅ 计算平均分

**API 调用**:
```javascript
const api = require('../../../utils/api.js')

// 获取班级列表
api.getTeacherClasses()

// 获取班级学生
api.getClassStudents(classId, { page: 1, page_size: 20 })

// 获取评价列表（用于统计）
api.getEvaluations({ date_from: '2026-01-20', date_to: '2026-01-27' })

// 创建评价（已封装，待实现评价页面时使用）
api.createEvaluation({
  student_id: 1,
  eval_date: '2026-01-27',
  score: 95.5,
  content: '今天表现很好'
})
```

### 家长端功能

**页面**: `pages/parent/home/home.js`

- ✅ 获取家长关联学生
- ✅ 获取今日评价
- ✅ 获取评价趋势（周/月）
- ✅ 获取学生照片
- ✅ 数据聚合和可视化

**API 调用**:
```javascript
const api = require('../../../utils/api.js')

// 获取关联学生
api.getParentStudents()

// 获取今日评价
api.getTodayEvaluation(studentId)

// 获取评价趋势
api.getEvaluationTrend(studentId, {
  date_from: '2026-01-20',
  date_to: '2026-01-27'
})

// 获取学生照片
api.getParentStudentPhotos(studentId, '2026-01-27')

// 获取历史评价（已封装）
api.getEvaluationHistory(studentId, { page: 1, page_size: 20 })
```

### 学生端功能

**页面**: `pages/student/home/home.js`

- ✅ 获取学生用户信息
- ✅ 获取今日评价
- ✅ 获取学生照片

**注意**: 学生端当前使用家长端 API，因为后端暂未提供学生专用 API。

## API 工具使用说明

### 基本用法

所有页面都可以引入 API 工具：

```javascript
const api = require('../../utils/api.js')
const config = require('../../utils/config.js')
```

### 通用请求方法

```javascript
// GET 请求
api.get('/endpoint', { param1: 'value1' })

// POST 请求
api.post('/endpoint', { data: 'value' })

// PUT 请求
api.put('/endpoint', { data: 'value' })

// DELETE 请求
api.del('/endpoint')

// 不需要认证的请求
api.get('/public-endpoint', {}, { auth: false })
```

### 错误处理

所有 API 调用都返回 Promise，建议使用 `.then()/.catch()` 或 `async/await` 处理：

```javascript
// 使用 .then()/.catch()
api.getTeacherClasses()
  .then(classes => {
    // 处理成功响应
    this.setData({ classes })
  })
  .catch(err => {
    // 处理错误
    console.error('加载失败', err)
  })

// 使用 async/await
async loadData() {
  try {
    const classes = await api.getTeacherClasses()
    this.setData({ classes })
  } catch (err) {
    console.error('加载失败', err)
  }
}
```

### 自动错误提示

API 工具已内置错误提示：

- **401 未授权**: 自动清除 token 并跳转到登录页
- **其他错误**: 自动显示 Toast 提示错误信息
- **网络错误**: 显示"网络请求失败"提示

如果不需要自动提示，可以在 catch 中处理。

## 数据格式

### 用户信息

```javascript
{
  id: 1,
  openid: "oxxxxxx",
  phone: "13800138000",
  role: "teacher",  // teacher | parent | student
  name: "张老师",
  avatar_url: "https://example.com/avatar.jpg",
  created_at: "2026-01-27T00:00:00",
  updated_at: "2026-01-27T00:00:00"
}
```

### 评价数据

```javascript
{
  id: 1,
  student_id: 1,
  class_id: 1,
  teacher_id: 1,
  eval_date: "2026-01-27",
  score: 95.5,
  content: "今天表现很好",
  created_at: "2026-01-27T00:00:00",
  updated_at: "2026-01-27T00:00:00",
  student_name: "小明",
  student_avatar_url: "https://example.com/avatar.jpg"
}
```

### 分页数据

```javascript
{
  items: [...],      // 数据列表
  total: 100,        // 总数
  page: 1,           // 当前页
  page_size: 20,     // 每页数量
  total_pages: 5     // 总页数
}
```

## 本地存储

API 工具使用以下本地存储键：

- `access_token`: JWT 访问令牌
- `user_info`: 用户信息
- `role`: 用户角色（备用）

可以通过 `config.storageKeys` 访问：

```javascript
const token = wx.getStorageSync(config.storageKeys.token)
const userInfo = wx.getStorageSync(config.storageKeys.userInfo)
```

## 测试建议

### 1. 本地开发测试

1. 启动后端服务（参考 `shanyao_backend` 仓库）
2. 确保后端运行在 `http://localhost:8000`
3. 在微信开发者工具中打开项目
4. 测试各个页面的数据加载

### 2. 模拟登录

如果微信登录暂时不可用，可以：

1. 手动设置 token 到本地存储
2. 手动设置用户信息
3. 直接访问各角色首页

```javascript
// 在调试器控制台执行
wx.setStorageSync('access_token', 'your_test_token')
wx.setStorageSync('user_info', {
  id: 1,
  name: '测试用户',
  role: 'teacher'
})
```

### 3. 网络调试

在微信开发者工具中：

1. 打开"调试器" -> "Network"
2. 观察 API 请求和响应
3. 检查请求头是否包含正确的 Authorization
4. 检查响应状态码和数据格式

## 降级策略

为了保证用户体验，所有页面都实现了降级策略：

1. **API 失败时**: 保持现有数据，不影响 UI 显示
2. **加载提示**: 使用 `wx.showLoading()` 和 `wx.hideLoading()`
3. **空数据处理**: 所有列表都检查空数组情况
4. **默认值**: 统计数据失败时显示 0 或默认值

## 待实现功能

以下功能的 API 已封装，但需要创建对应页面：

1. **教师评价页面**: 创建和编辑学生评价
2. **教师照片上传**: 上传学生每日照片
3. **家长历史记录页**: 查看完整评价历史
4. **学生成绩单页**: 查看详细成绩
5. **手机号绑定**: 绑定手机号功能

## API 参考

完整的后端 API 文档请参考：
- [shanyao_backend/API_DOCUMENTATION.md](https://github.com/Glarc/shanyao_backend/blob/main/API_DOCUMENTATION.md)

## 故障排查

### 问题：API 请求失败

1. 检查后端服务是否运行
2. 检查 `utils/config.js` 中的 `apiBaseUrl` 配置
3. 检查网络权限（微信开发者工具中需要配置合法域名或开启"不校验合法域名"）
4. 查看控制台的错误日志

### 问题：401 未授权

1. 检查 token 是否过期
2. 尝试重新登录
3. 检查后端的 JWT 配置

### 问题：数据格式不匹配

1. 查看后端 API 文档
2. 检查 API 版本是否一致
3. 在 `utils/api.js` 中添加数据转换逻辑

## 贡献

如果需要添加新的 API：

1. 在 `utils/api.js` 中添加新的函数
2. 使用统一的命名规范（动词 + 名词）
3. 添加 JSDoc 注释说明参数和返回值
4. 更新本文档

## 更新日志

### 2026-01-29

- ✅ 创建 `utils/config.js` 和 `utils/api.js`
- ✅ 实现认证流程（微信登录、角色选择）
- ✅ 集成教师端 API（班级、学生、评价）
- ✅ 集成家长端 API（学生、评价、趋势、照片）
- ✅ 集成学生端 API（用户信息、评价、照片）
- ✅ 实现统一错误处理和降级策略
