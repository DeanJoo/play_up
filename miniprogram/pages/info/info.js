// pages/info/info.js
const config = require('../../config')
const moment = require('../../vendor/moment')
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
const loadMode = {
  invite: 'invite',
  sponsored: 'sponsored',
  joined: 'joined'
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    content: '',
    location: ['0', '0'],
    place: '',
    address: '',
    date: '',
    time: '',
    funds: '',
    sponsor: {},    
    guests: [],
    markers: [{}, {}],
    isSponsor: false,
    joined: false,
    refused: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    let page = this
    let markers = page.data.markers
    //自身位置标识
    wx.getLocation({
      success: res => {
        let marker = JSON.parse(JSON.stringify(config.marker.me))
        marker.longitude = res.longitude
        marker.latitude = res.latitude
        markers[0] = marker
      },
    })

    let id = options.id
    let mode = options.mode
    let loadinfo = info => {
      let card = info
      page.card = card
      let datetime = moment(card.datetime)
      card.date = datetime.format(config.format.date)
      card.time = datetime.format(config.format.time)

      let location = card.location
      if (typeof (location) === 'string') {
        location = location.split(',')
      }
      let marker = JSON.parse(JSON.stringify(config.marker.other))
      marker.id = 1
      marker.title = card.place
      marker.callout.content = card.place
      marker.longitude = location[0]
      marker.latitude = location[1]
      markers[1] = marker

      let label = config.db.userInfo
      let queryList = []
      queryList.push(db.collection(label).where({
        _openid: card._openid
      }).get())
      queryList.push(db.collection(label).where({
        _openid: _.in(card.guests)
      }).get())
      Promise.all(queryList).then(res => {
        let sponsor = res[0].data[0]
        let guests = res[1].data

        page.setData({
          title: card.title,
          content: card.content,
          location: location,
          place: card.place,
          address: card.address,
          date: card.date,
          time: card.time,
          funds: card.funds,
          sponsor: sponsor,
          guests: guests,
          markers: markers,
          isSponsor: sponsor._openid === app.userInfo.openId,
          joined: guests.findIndex(n => n._openid === app.userInfo.openId) !== -1
        })
      })
    }

    if (mode === loadMode.invite) {
      let label = config.db.cardInfo
      db.collection(label).doc(id).get().then(res => {
        if (Object.keys(res.data).length > 0) {
          loadinfo(res.data)
        } else {
          wx.showModal({
            title: '异常',
            content: '邀请函已被删除或过期！',
            showCancel: false
          })
        }
      })
    } else if (mode === loadMode.sponsored) {
      loadinfo(app.sponsoredList.find(c => c._id === id))
    } else if (mode === loadMode.joined) {
      loadinfo(app.joinedList.find(c => c._id === id))
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 用户打开地图
   */
  openMap: function () {
    let page = this
    wx.openLocation({
      longitude: parseFloat(page.data.location[0]),
      latitude: parseFloat(page.data.location[1]),
      name: page.data.place,
      address: page.data.address
    })
  },

  /**
   * 用户点击转发按钮
   */
  onShareAppMessage: function () {
    let id = app.userInfo.openId
    let card = {}
    card.imageUrl = '/images/card.png'
    if (this.data.isSponsor) {
      card.title = this.data.title
      card.path = '/pages/info/info?id=' + this.id + '&mode=invite'
    } else if (this.data.joined) {
      let content = '算我一个'
      card.title = content
      card.path = '/pages/msg/msg?id=' + encodeURIComponent(id)
        + '&content=' + encodeURIComponent(content)
    } else {
      let content = '不去' 
      card.title = content
      card.path = '/pages/msg/msg?id=' + encodeURIComponent(id)
        + '&content=' + encodeURIComponent(content)
    }
    
    return card
  },

  /***
   * 用户拒绝参加聚会
   */
  refuseIt: function () {
    this.setData({
      refused: true
    })
    let page = this
    let key = 'refused_list'
    let info = {
      _id: page.card._id,
      title: page.card.title,
      content: page.card.content,
      datetime: page.card.datetime,
      sponsor: page.data.sponsor
    }
    let cards = wx.getStorageSync(key)
    if (cards) {
      if (cards.findIndex(card => card.id === info._id) === -1) {
        cards.push(info)
        cards = cards.sort((a, b) => {
          let am = moment(a)
          let bm = moment(b)
          if (am.isBefore(bm)) {
            return -1
          } else if (am.isAfter(bm)) {
            return 1
          } else {
            return 0
          }
        })
      }
    } else {
      cards = [info]
    }
    app.refusedList = cards
    wx.setStorageSync(key, cards)
  },

  /**
   * 用户参加聚会
   */
  joinIt: function () {
    wx.showLoading({ title: '保存中……', mask: true })
    let page = this
    wx.cloud.callFunction({
      name: config.services.join,
      data: {
        cardID: page.card._id
      }
    }).then(res => {
      wx.hideLoading()
      if (res && res.result.success) {
        page.setData({
          joined: true
        })
        wx.showToast({
          title: '加入成功',
          icon: 'success'
        })
      } else {
        wx.showModal({
          title: '异常',
          content: '系统繁忙请稍后再试。',
          showCancel: false
        })
      }
    })
  }
})