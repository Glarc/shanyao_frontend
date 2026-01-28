Page({
  data: {},

  onLoad() {
    // 如果已经选过角色，可直接跳转（按你需求决定是否启用）
    const role = wx.getStorageSync('role');
    if (role) {
      // 如果你希望每次都重新选择，把下面两行删掉即可
      //this.redirectByRole(role);
    }
  },

  onSelectRole(e) {
    const role = e.currentTarget.dataset.role; // parent | student | teacher
    if (!role) return;

    wx.setStorageSync('role', role);

    // 这里先直接跳转到对应首页/绑定页
    // 实际上你后面会在这里插入：手机号绑定 / 学生号关联 / 老师权限校验 等流程
    this.redirectByRole(role);
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
