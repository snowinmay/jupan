// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  try {
    const result = await cloud.openapi.subscribeMessage.send({
        touser: cloud.getWXContext().OPENID,
        page: 'pages/detail/detail?scene='+event.id,
        lang: 'zh_CN',
        data: {
          thing6: {
            value: event.title//产品名称
          },
          phrase3: {
            value: event.status//状态
          },
          thing5: {
            value: event.remark//备注
          }
        },
        templateId: event.templateId,
        miniprogramState: 'developer'
      })
    return result
  } catch (err) {
    return err
  }
}