// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  try {
    const result = await cloud.openapi.subscribeMessage.send({
        touser: cloud.getWXContext().OPENID,
        page: 'pages/detail/detail/?id=',
        lang: 'zh_CN',
        data: {
          thing1: {
            value: event.reason//原因
          },
          time2: {
            value: event.time//时间
          },
          thing3: {
            value: event.remark//备注
          },
          thing4: {
            value: event.title//产品名称
          }
        },
        templateId: '7wC-_oB10pdLxwoZa3JGkgzKLdwudg9Y3fq7-m4GUsY',
        miniprogramState: 'developer'
      })
    return result
  } catch (err) {
    return err
  }
}