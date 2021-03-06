const app = getApp();
const config = require("../../config.js");
Page({

      /**
       * 页面的初始数据
       */
      data: {
            isAdmin:false,
            showShare: false,
            poster: JSON.parse(config.data).share_poster,
      },
      onShow() {
            console.log(app.userinfo)
            this.setData({
                  userinfo: app.userinfo
            })
            this.checkAdmin()
      },
      checkAdmin(){
            console.log(this.data.userinfo.isAdmin)
            this.setData({
                  isAdmin:this.data.userinfo.isAdmin
            })
      },
      go(e) {
            if (e.currentTarget.dataset.status == '1') {
                  if (!app.openid) {
                        wx.showModal({
                              title: '温馨提示',
                              content: '该功能需要注册方可使用，是否马上去注册',
                              success(res) {
                                    if (res.confirm) {
                                          wx.navigateTo({
                                                url: '/pages/login/login',
                                          })
                                    }
                              }
                        })
                        return false
                  }
            }
            if (e.currentTarget.dataset.go == "/pages/order/list/list") {
                  wx.showToast({
                        title: 'coming soon!!!',
                        icon: 'none'
                  })
                  return false;
            }
            wx.navigateTo({
                  url: e.currentTarget.dataset.go
            })
      },
      //展示分享弹窗
      showShare() {
            this.setData({
                  showShare: true
            });
      },
      //关闭弹窗
      closePop() {
            this.setData({
                  showShare: false,
            });
      },
      //预览图片
      preview(e) {
            wx.previewImage({
                  urls: e.currentTarget.dataset.link.split(",")
            });
      },
      onShareAppMessage() {
            return {
                  title: JSON.parse(config.data).share_title,
                  imageUrl: JSON.parse(config.data).share_img,
                  path: '/pages/start/start'
            }

      },
})