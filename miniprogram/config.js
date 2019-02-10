/**
 * 小程序配置文件
 */
var config = {
  scope: {
    userInfo: 'scope.userInfo'
  },
  storage: {
    userInfo: 'user_info'
  },
  services: {
    login: 'login',
    home: 'list',
    join: 'join',
    addCard: 'add'
  },
  pages: {
    home: '/pages/list/list',
    addCard: '/pages/add/add',
    accept: 'pages/accept/accept'
  },
  state: {
    success: 0,
    fail: 1
  },
  db: {
    userInfo: 'user_info',
    cardInfo: 'card_info'
  },
  amapKey: 'cf383e27f72eae1547ddd02779cd4e4d',
  marker: {
    me: {
      id: 0,
      title: '我',
      iconPath: '/images/marker_red.png',
      width: 30,
      height: 30,
      callout: {
        content: '我',
        bgColor: '#66f9cf',
        display: 'ALWAYS'
      }
    },
    other: {
      iconPath: '/images/marker_blue.png',
      width: '30',
      height: '30',
      callout: {
        bgColor: '#66f9cf',
        display: 'ALWAYS'
      }
    },
    red: '/images/marker_red.png',
    blue: '/images/marker_blue.png',
    green: '/images/marker_green.png',
    yellow: '/images/marker_yellow.png'
  },
  icon: {
    tips: '/images/tips.png'
  },
  format: {
    datetime: 'YYYY-MM-DD HH:mm',
    date: 'YYYY-MM-DD',
    time: 'HH:mm'
  }
}

module.exports = config
