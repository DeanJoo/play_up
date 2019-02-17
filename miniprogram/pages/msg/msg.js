// miniprogram/pages/msg/msg.js
const config = require('../../config')
const db = wx.cloud.database()
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sayYes: '碎碎的事，哥请了',
    sayNo: '地主也没余粮了'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    let page = this
    let type = options.type
    let id = options.id
    id = id ? decodeURIComponent(id) : ''
    page.guestId = id
    let title = decodeURIComponent(options.title)
    title = title ? decodeURIComponent(title) : ''
    let content = decodeURIComponent(options.content)
    content = content ? decodeURIComponent(content) : ''
    let isBeggar = (type === 'beggar')
    
    let label = config.db.userInfo
    db.collection(label).where({
      _openid: id
    }).get().then(res => {
      let info = res.data[0]
      page.setData({
        avatarUrl: info.avatarUrl,
        nickName: info.nickName,
        isBeggar,
        title,
        content
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let id = app.userInfo.openId
    let content = this.data.sayNo

    let card = {}
    card.title = content
    card.path = '/pages/msg/msg?id=' + encodeURIComponent(id)
      + '&content=' + encodeURIComponent(content)
    card.imageUrl = '/images/sayno.jpg'
    
    return card
  },

  /**
   * 我请客
   */
  myTreat: function() {
    let id = this.guestId
    wx.reLaunch({
      url: '/pages/add/add?type=treat&guest=' + encodeURIComponent(id),
    })
  }
})