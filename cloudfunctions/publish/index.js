// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const TcbRouter = require('tcb-router'); //云函数路由
const rq = require('request');

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
        event
  });
  //下架不合规宝贝
  app.router('cancel', async (ctx) => {
  		const wxContext = cloud.getWXContext();
        try {
              return await db.collection('publish').where({
                    _id: event._id,
                    _openid: wxContext.OPENID //***用户的openid,
	              }.update({
                    data: {
                        canceled_at: new Date().getTime(),
                        status:event.status                  
                    }
              })
        } catch (e) {
              console.error(e)
        }
  });
}