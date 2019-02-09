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
    wx.cloud.init()
    let userInfo = wx.getStorageSync('user_info')
    if (userInfo) {
      app.setUserInfo(userInfo)
    } else {
      wx.cloud.callFunction({
        name: config.services.login
      }).then(res => {
        let openId = res.result.openId
        let colName = config.db.userInfo
        const db = wx.cloud.database()
        db.collection(colName).where({
          _openid: openId
        }).get().then(res => {
          if (res.data.length === 0) {
            wx.getUserInfo({
              success: res => {
                let user = {
                  nickName: res.userInfo.nickName,
                  avatarUrl: res.userInfo.avatarUrl
                }

                db.collection(colName).add({
                  data: user
                }).then(res => {
                  user.openId = openId
                  app.saveUserInfo(user)
                })
              },
              fail: err => {
                console.log(err)
              }
            })
            
          } else {
            let data = res.data[0]
            let user = {
              openId: data._openid,
              nickName: data.nickName,
              avatarUrl: data.avatarUrl
            }
            app.saveUserInfo(user)
          }
        })
      })
    }
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
