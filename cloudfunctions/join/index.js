// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let openId = event.userInfo.openId
  let cardID = event.cardID
  let label = 'card_info'
  let result = await db.collection(label).where({
    _id: _.eq(cardID),
    guests: _.eq(openId)
  }).count()
  let joined = result.total > 0
  if (!joined) {
    result = await db.collection(label).doc(cardID).update({
      data: {
        guests: _.push(openId)
      }
    })
    let success = false
    if (result.stats.updated > 0) success = true
    return { success }
  } else {
    return {
      success: true
    }
  }
}