// pages/accept/accept.js
const config = require('../../config')
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    accepted: true,
    msg: ''
  },

  onLoad: function (options) {
    let page = this
    wx.getSetting({
      success: res => {
        if (res.authSetting[config.scope.userInfo]) {
          wx.cloud.callFunction({
            name: config.services.login
          }).then(res => {
            let openId = res.result.openId
            let label = config.db.userInfo

            db.collection(label).where({
              _openid: openId
            }).get().then(res => {
              if (res.data.length !== 0) {
                let data = res.data[0]
                let user = {
                  openId: data._openid,
                  nickName: data.nickName,
                  avatarUrl: data.avatarUrl
                }
                app.saveUserInfo(user)
              } else {
                page.setData({
                  accepted: false,
                })
              }
            })
          })
        } else {
          page.setData({
            accepted: false,
          })
        }
        wx.hideLoading()
      },
      fail: err => {
        page.setData({
          msg: '无法获取用户授权信息，暂时无法为您服务'
        })
        wx.hideLoading()
      }
    })
  },

  bindGetUserInfo: function (e) {
    let page = this
    if (e.detail.userInfo) {
      let userInfo = e.detail.userInfo
      page.setData({
        accepted: true,
        msg: ''
      })

      wx.cloud.callFunction({
        name: config.services.login
      }).then(res => {
        // 新用户注册
        let openId = res.result.openId
        let label = config.db.userInfo
        db.collection(label).where({
          _openid: openId
        }).get().then(res => {
          if (res.data.length === 0) {
            let user = {
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl
            }

            db.collection(label).add({
              data: user
            }).then(res => {
              user.openId = openId
              app.saveUserInfo(user)
              app.goBack()
            }).catch(err => {
              page.setData({
                msg: '服务器异常无法注册用户，请稍后再试。/n' + err
              })
            })
          } else {
            let data = res.data[0]
            let user = {
              openId: data._openid,
              nickName: data.nickName,
              avatarUrl: data.avatarUrl
            }
            app.saveUserInfo(user)
            app.goBack()
          }
        })
      })
    } else {
      page.setData({
        msg: '君拒绝于吾等，吾等只好干等。'
      })
    }
  }
})