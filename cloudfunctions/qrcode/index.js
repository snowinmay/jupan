// 云函数入口文件
const cloud = require('wx-server-sdk')
const appid = 'wx2492ede92f947fd2'; //你的小程序appid
const secret = 'cdcadbe6031a0cdd9298c04ad8f30518'; //你的小程序secret
const envName = 'aikan-4gyg06pf350949b1'; // 小程序云开发环境ID
cloud.init({
      env: envName
})

// 云函数入口函数
exports.main = async(event, context) => {
      //先判断云存储是否存在此二维码
      try {
            await cloud.downloadFile({
                  fileID: 'share/' + event.scene + '.jpeg',
            })
            console.log('get from cos')
            return 'share/' + event.scene + '.jpeg'
       //不存在则进行生成
      } catch (e) {
            console.log('creat start')
            //先获取
            const bufferContent = await cloud.openapi.wxacode.getUnlimited({
                  scene: event.scene,
                  page: 'pages/detail/detail'
            })
            console.log(bufferContent)
            //再上传云存储
            const fileContent = await cloud.uploadFile({
                  cloudPath: 'share/' + event.scene + '.jpeg',
                  fileContent: bufferContent.buffer
            })
            return fileContent.fileID
      }
}