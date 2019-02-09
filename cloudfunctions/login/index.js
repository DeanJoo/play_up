// 云函数入口函数
exports.main = async (event, context) => {
  return {
    openId: event.userInfo.openId
  }
}