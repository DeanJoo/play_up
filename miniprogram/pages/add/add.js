// pages/add/add.js
const config = require('../../config')
const amapFile = require('../../vendor/amap-wx')
const moment = require('../../vendor/moment')
const db = wx.cloud.database()
const app = getApp()
var amap

Page({
  selectedMarker: -1,
  commonMarkers: [],
  commonMappings: [-1, -1, -1, -1, -1, -1],

  /**
   * 页面的初始数据
   */
  data: {
    title: '出来耍耍吧！',
    content: '吃、喝、玩、乐。',
    contentCount: 16,
    contentTotal: 100,
    place: '',
    address: '',
    currentDate: '',
    startDate: '',
    currentTime: '',
    fundsIndex: 0,
    fundsOptions: ['老子请了', 'A吧', '抱大腿'],
    addressKey: '',
    markers: [],
    showTopTips: false,
    showAddressList: false,
    topTips: '',
    commonPlaces: [],
    cardSaved: false,
    isBeggar: false,
    isTreat: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let page = this

    let type = options.type
    type = type ? type : ''
    let guestId = options.guest
    guestId = guestId ? guestId : ''
    page.guestId = guestId

    // 获取当前日期
    let now = [
      moment().format(config.format.date),
      moment().format(config.format.time)
    ]

    // 获取常用信息
    let data = {}
    data.currentDate = now[0]
    data.startDate = now[0]
    data.currentTime = now[1]
    data.isTreat = type === 'treat'

    let info = wx.getStorageSync('common_info')
    if (info) {
      page.commonMarkers = info.markers
      let commonPlaces = page.commonMarkers.slice(0, 6).map(item => {
        return item.title
      })
      data.title = info.title
      data.content = info.content
      data.contentCount = info.content.length
      data.currentTime = info.time
      data.commonPlaces = commonPlaces
    }
    page.setData(data)
    console.log(data)

    // 初始化地图服务
    amap = new amapFile.AMapWX({
      key: config.amapKey
    })
    
    // 获取当前位置
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        let location = [res.longitude, res.latitude]
        page.setData({
          location: location
        })
        // 获取位置详情
        amap.getRegeo({
          location: location.join(','),
          success: function (data) {
            if (data && data[0]) {
              page.meComponent = data[0].regeocodeData.addressComponent
              let markers = page.data.markers
              let marker = JSON.parse(JSON.stringify(config.marker.me))
              marker.longitude = location[0]
              marker.latitude = location[1],
              marker.address = data[0].name
              markers.push(marker)
              page.setData({
                markers: markers
              })
            }
          }
        })
      }
    })

    wx.hideShareMenu()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 用户点击转发按钮
   */
  onShareAppMessage: function () {
    let card = {
      title: this.data.title
    }

    if (this.data.isBeggar) {
      let id = app.userInfo.openId
      let title = this.data.title
      let content = this.data.content

      card.path = '/pages/msg/msg?type=beggar&id=' + encodeURIComponent(id) 
        + '&title=' + encodeURIComponent(title) 
        + '&content=' + encodeURIComponent(content)
      card.imageUrl = '/images/beggar.jpg'
    } else {
      card.path = '/pages/info/info?id=' + this.cardID + '&mode=invite',
      card.imageUrl = '/images/card.png'
    }
    console.log(card)
    return card
  },

  /**
   * 用户点击地点常用列表
   */
  showCommon: function () {
    let page = this
    wx.showActionSheet({
      itemList: page.data.commonPlaces,
      success: res => {
        let id = page.commonMappings[res.tapIndex]
        if (id === -1) {
          let markers = page.data.markers
          let marker = page.commonMarkers[res.tapIndex]
          marker = JSON.parse(JSON.stringify(marker))
          id = markers.length
          marker.id = id
          markers.push(marker)
          page.commonMappings[res.tapIndex] = id
          page.setData({
            markers: markers
          })
        }

        page.selectMarker({ markerId: id })
      }
    })
  },

  /**
   * 标题发生变化
   */
  bindTitleChange: function (e) {
    this.setData({
      title: e.detail.value
    })
  },

  /**
   * 活动内容发生变化
   */
  bindContentChange: function (e) {
    this.setData({
      content: e.detail.value,
      contentCount: e.detail.value.length
    })
  },

  /**
   * 用户选择新的日期
   */
  bindDateChange: function (e) {
    this.setData({
      currentDate: e.detail.value
    })
  },

  /**
   * 用户选择新的时间
   */
  bindTimeChange: function (e) {
    this.setData({
      currentTime: e.detail.value
    })
  },

  /**
   * 用户选择新的经费出处
   */
  bindFundsChange: function (e) {
    let index = e.detail.value
    let data = {
      fundsIndex: index
    }

    if (index === '2') {
      data.isBeggar = true
      this.oldTitle = this.data.title
      this.oldContent = this.data.content
      data.title = ''
      data.content = ''
    } else {
      data.isBeggar = false
      data.title = this.oldTitle
      data.content = this.oldContent
    }
    
    this.setData(data)
  },

  /**
   * 用户输入地址关键字
   */
  typingAddress: function (e) {
    this.setData({
      addressKey: e.detail.value
    })
  },

  /**
   * 搜索地址
   */
  searchAddress: function (e) {
    var page = this
    var address = page.data.addressKey

    amap.getInputtips({
      keywords: address,
      location: page.data.location.join(','),
      city: page.meComponent.citycode,
      citylimit: true,
      success: function (data) {
        if (data && data.tips) {
          page.setData({
            addressTips: data.tips,
            showAddressList: true
          })
        }
      }
    })
  },

  /**
   * 选择搜索到的地址
   */
  selectAddress: function (e) {
    let page = this
    let index = e.currentTarget.dataset.index
    let address = page.data.addressTips[index]
    let location = address.location.split(',')
    let markers = page.data.markers
    let marker = JSON.parse(JSON.stringify(config.marker.other))
    marker.id = markers.length
    marker.longitude = location[0]
    marker.latitude = location[1]
    marker.title = address.name
    marker.address = address.address
    marker.callout.content = address.name
    markers.push(marker)
    page.setData({
      markers: markers,
      location: location,
      showAddressList: false
    })
  },

  /**
   * 隐藏地址列表
   */
  switchAddressList: function (e) {
    let state = this.data.showAddressList
    this.setData({
      showAddressList: !state
    })
  },

  /**
   * 选择一个标记点
   */
  selectMarker: function (e) {
    let selected = this.selectedMarker
    let markers = this.data.markers
    if (selected === e.markerId) {
      return
    } else if (selected !== -1) {
      let color = config.marker.blue
      if (selected === 0) {
        color = config.marker.red
      }
      markers[selected].iconPath = color
    }

    let marker = markers[e.markerId]
    marker.iconPath = config.marker.green
    this.selectedMarker = e.markerId
    this.setData({
      markers: markers,
      location: [marker.longitude, marker.latitude],
      place: marker.title,
      address: marker.address
    })
  },

  /**
   * 用户点击清除地点关键字按钮
   */
  clearAddressKey: function (e) {
    this.setData({
      addressKey: ''
    })
  },

  /**
   * 显示顶端提示信息
   */
  showTips: function (msg) {
    let page = this
    page.setData({
      topTips: msg,
      showTopTips: true
    })
    setTimeout(function () {
      page.setData({
        showTopTips: false
      });
    }, 5000);
  },

  /**
   * 用户点击完成按钮
   */
  saveCard: function (e) {
    let page = this
    let data = e.detail.value
    if (page.selectedMarker !== -1) {
      let marker = page.data.markers[page.selectedMarker]
      let cm = page.commonMarkers.find(val => {
        return marker.longitude === val.longitude && marker.latitude === val.latitude
      })
      if (cm) {
        marker = cm
        marker.stars += 1
      } else {
        marker = JSON.parse(JSON.stringify(marker))
        marker.title = data.place
        marker.callout.content = data.place
        marker.address = data.address
        marker.stars = 1
        page.commonMarkers.push(marker)
      }
      
      page.commonMarkers = page.commonMarkers.sort((a, b) => {
        return a.stars - b.stars
      })
      wx.setStorage({
        key: 'common_info',
        data: {
          title: data.title,
          content: data.content,
          time: data.time,
          markers: page.commonMarkers
        }
      })
    } else {
      page.showTips('请在地图上选择一个位置标记以便小伙伴们导航邀约之地')
      return
    }

    wx.showLoading({ title: '保存中……', mask: true })
    let card = {
      title: data.title,
      content: data.content,
      place: data.place,
      address: data.address,
      datetime: moment(data.date + ' ' + data.time, config.format.datetime).toDate(),
      funds: page.data.fundsOptions[data.funds],
      location: this.data.location.join(','),
      guests: []
    }

    if (page.data.isTreat) {
      card.guests.push(page.guestId)
    }

    let label = config.db.cardInfo
    db.collection(label).add({
      data: card
    }).then(res => {
      wx.hideLoading()
      page.cardID = res._id
      page.setData({
        cardSaved: true
      })
      wx.showToast({ title: '保存成功，可以发帖了。', icon: 'success' })
    }).catch(err => {
      wx.hideLoading()
      wx.showModal({
        title: '异常',
        content: '系统繁忙请稍后再试。',
        showCancel: false
      })
    })
  },
})
