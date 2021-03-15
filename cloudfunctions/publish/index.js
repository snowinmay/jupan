// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router'); //云函数路由
const rq = require('request');

cloud.init({env: "aikan-4gyg06pf350949b1"})

const db = cloud.database();


// 云函数入口函数
exports.main = async (event, context) => {
	console.log(event)
  const app = new TcbRouter({
        event
  });
  //下架不合规宝贝
  app.router('cancel', async (ctx) => {
        try {
        		return await db.collection('publish').doc(event._id).update({
                        data: {
                        	canceled_at: new Date().getTime(),
                            status:event.status
                        }
                  })
              // return await db.collection('publish').where({
              //       _id: event._id,
              //       _openid: event._openid //***用户的openid,
	             //  }.update({
              //       data: {
              //           canceled_at: new Date().getTime(),
              //           status:event.status                  
              //       }
              // }))
        } catch (e) {
              console.error(e)
        }
  });
}