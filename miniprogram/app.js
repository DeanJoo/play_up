const config = require('./config')

/**
 * @fileOverview 微信小程序的入口文件
 */
App({
  /**
   * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
   */
  onLaunch (options) {
    let app = this
    let opts = []
    for (let k in options.query) {
      opts.push([k, options.query[k]].join('='))
    }
    app.homePage = '/' + options.path + (opts.length == 0 ? '' : ('?' + opts.join('&')))

    if (wx.cloud) {
      wx.cloud.init({
        env: 'playup-c4b115'
      })
    }
    
    let userInfo = wx.getStorageSync(config.storage.userInfo)
    if (userInfo !== '') {
      app.setUserInfo(userInfo)
    } else {
      wx.reLaunch({
        url: '/pages/accept/accept',
      })
    }
  },

  /**
   * 授权后返回初始页面
   */
  goBack () {
    let app = this
    wx.reLaunch({
      url: app.homePage,
    })
  },

  /**
   * 保存用户信息
   */
  saveUserInfo (data) {
    this.setUserInfo(data)
    wx.setStorage({
      key: 'user_info',
      data: data,
    })
  },

  /**
   * 设置用户信息
   */
  setUserInfo (data) {
    this.userInfo = {
      openId: data.openId,
      nickName: data.nickName,
      avatarUrl: data.avatarUrl
    }
  }
})
