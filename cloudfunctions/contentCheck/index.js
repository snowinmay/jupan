// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

/**
 * 文本审核云函数
 */
exports.main = async (event, context) => {
  //获取文本内容        
  const {content} = event
  try {
    //调用文本审核接口并返回接口
    return await cloud.openapi.security.msgSecCheck({
      content: content
    })    
  } catch (error) {
    return error
  }    
}