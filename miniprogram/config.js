const env = __wxConfig.envVersion
console.log(env)
if(!env){
  console.error("获取运行环境失败!");
}

const cloudEnvID = {
  // 开发版 
  develop: "aikan-4gyg06pf350949b1",
  // 体验版
  trial: "aikan-prod-7g6ftqaraa5e6df0",
  // 正式版
  release: "aikan-prod-7g6ftqaraa5e6df0"
};
var data = {
      //云开发环境id
      env: cloudEnvID[env],//cloudEnvID[env],//'aikan-4gyg06pf350949b1',//aikan-prod-7g6ftqaraa5e6df0
      //分享配置
      share_title: '一个查询演出信息，发布转票信息的神器~',
      share_img: '/images/poster.jpg', //可以是网络地址，本地文件路径要填绝对位置
      share_poster:'https://mmbiz.qpic.cn/mmbiz_jpg/nJPznPUZbhpA064Cl78xxvzBYTDa6O1Kl7RY1K6TerBaXcUf5AoN6x7s8q7xHgeu0Cl5qarPzE6ibbQZasWRErg/640',//必须为网络地址
      //客服联系方式
      kefu: {
            weixin: 'xuhuai66',
            qq: '1604026596',
            gzh: 'https://mmbiz.qpic.cn/mmbiz_png/nJPznPUZbhpKCwnibUUqnt7BQXr3MbNsasCfsBd0ATY8udkWPUtWjBTtiaaib6rTREWHnPYNVRZYgAesG9yjYOG7Q/640', //公众号二维码必须为网络地址
            phone: '' //如果你不设置电话客服，就留空
      },
      //默认启动页背景图，防止请求失败完全空白 
      //可以是网络地址，本地文件路径要填绝对位置
      bgurl: '/images/startBg.jpg',
      //配置学院，建议不要添加太多，不然前端不好看
      college: [
            // {
            //       name: '转票',
            //       id: 0
            // },
            // {
            //       name: '换票',
            //       id: 1
            // }
      ],
      subscribeIds:{
            'goodsOn':'oQU1_dIR318I7sOu-UhJkIM4WQMOP3tP6zx6ZMtdQIc',
            'orderStatus':'GXr22RQxNU7C3SIpXWHS0eFPqFN_13ff_RZxCDI-VuM',
      }
}
//下面的就别动了
function formTime(creatTime) {
      let date = new Date(creatTime),
            Y = date.getFullYear(),
            M = date.getMonth() + 1,
            D = date.getDate(),
            H = date.getHours(),
            m = date.getMinutes(),
            s = date.getSeconds();
      if (M < 10) {
            M = '0' + M;
      }
      if (D < 10) {
            D = '0' + D;
      }
      if (H < 10) {
            H = '0' + H;
      }
      if (m < 10) {
            m = '0' + m;
      }
      if (s < 10) {
            s = '0' + s;
      }
      return Y + '-' + M + '-' + D + ' ' + H + ':' + m + ':' + s;
}

function days() {
      let now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth() + 1;
      let day = now.getDate();
      if (month < 10) {
            month = '0' + month;
      }
      if (day < 10) {
            day = '0' + day;
      }
      let date = year + "" + month + day;
      return date;
}
module.exports = {
      data: JSON.stringify(data),
      formTime: formTime,
      days: days
}