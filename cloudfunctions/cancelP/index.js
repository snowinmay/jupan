// 云函数入口文件
const cloud = require('wx-server-sdk')

// 云函数入口函数
exports.main = async (event, context) => {
	 cloud.init({
        env: event.env,
        traceUser: true
    })

    const db = cloud.database({
        env: event.env
    })
 try {
  return await db.collection('publish').doc(event._id).update({
   // data 传入需要局部更新的数据
   data: {
   	canceled_at: new Date().getTime(),
    status:event.status
   }
  })
 } catch (e) {
  console.error(e)
 }
}