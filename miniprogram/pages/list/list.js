// pages/list/list.js
const config = require('../../config')
const moment = require('../../vendor/moment')
const db = wx.cloud.database()
const _ = db.command
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ['邀请函', '参与中', '未加入'],
    activeTab: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    sponsoredList: [],
    joinedList: [],
    refusedList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let page = this
    wx.showLoading({ title: '加载中……', mask: true })

    //加载未加入的聚会
    let key = 'refused_list'
    wx.getStorage({
      key: key,
      success: function(res) {
        let cards = res.data
        let i = cards.findIndex(card => moment().isAfter(moment(card.datetime)))
        if (i >= 0) {
          cards = cards.slice(i + 1)
          wx.setStorage({
            key: key,
            data: cards,
          })
        }
        app.refusedList = cards
        page.setData({
          refusedList: cards
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadDateInfo()
  },

  /**
   * 加载约会信息
   */
  loadDateInfo() {
    let page = this
    if (app.userInfo) {
      let openId = app.userInfo.openId
      let label = config.db.cardInfo

      //加载邀请函
      db.collection(label).where({
        _openid: _.eq(openId),
        datetime: _.gte(db.serverDate())
      }).get().then(res => {
        app.sponsoredList = res.data
        for (let c of app.sponsoredList) {
          c.sponsor = app.userInfo
        }

        page.setData({
          sponsoredList: app.sponsoredList
        })
      })

      //加载已加入的聚会
      db.collection(label).where({
        guests: _.eq(openId),
        datetime: _.gte(db.serverDate())
      }).get().then(res => {
        app.joinedList = res.data
        if (app.joinedList.length > 0) {
          let sponsorList = Array.from(app.joinedList, c => c._openid)
          label = config.db.userInfo
          db.collection(label).where({
            _openid: _.in(sponsorList)
          }).get().then(res => {
            for (let c of app.joinedList) {
              c.sponsor = res.data.find(s => s._openid === c._openid)
            }

            page.setData({
              joinedList: app.joinedList
            })
            wx.hideLoading()
          })
        } else {
          wx.hideLoading()
        }
      })
    } else {
      setTimeout(page.loadDateInfo, 1000)
    }
  },

  /**
   * 用户点击选项卡
   */
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeTab: e.currentTarget.id
    });
  },

  /**
   * 用户点击发起邀请
   */
  addCard: function () {
    wx.navigateTo({
      url: config.pages.addCard,
    })
  }
})