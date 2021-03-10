const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
Page({

      /**
       * 页面的初始数据
       */
      data: {
            ids: -1,
            phone: '',
            wxnum: '',
            qqnum: '',
            weibo: '',
            email: '',
            campus: JSON.parse(config.data).campus,
      },
      onLoad(){
            this.getOpenid()
      },
      choose(e) {
            let that = this;
            that.setData({
                  ids: e.detail.value
            })
            //下面这种办法无法修改页面数据
            /* this.data.ids = e.detail.value;*/
      },
      //获取用户手机号
      getPhoneNumber: function(e) {
            let that = this;
            //判断用户是否授权确认
            if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
                  wx.showToast({
                        title: '获取手机号失败',
                        icon: 'none'
                  })
                  return;
            }
            wx.showLoading({
                  title: '获取手机号中...',
            })
            wx.login({
                  success(re) {
                        wx.cloud.callFunction({
                              name: 'regist', // 对应云函数名
                              data: {
                                    $url: "phone", //云函数路由参数
                                    encryptedData: e.detail.encryptedData,
                                    iv: e.detail.iv,
                                    code: re.code
                              },
                              success: res => {
                                    console.log(res);
                                    wx.hideLoading();
                                    if (res.result == null) {
                                          wx.showToast({
                                                title: '获取失败,请重新获取',
                                                icon: 'none',
                                                duration: 2000
                                          })
                                          return false;
                                    }
                                    //获取成功，设置手机号码
                                    that.setData({
                                          phone: res.result.data.phoneNumber
                                    })
                              },
                              fail: err => {
                                    console.error(err);
                                    wx.hideLoading()
                                    wx.showToast({
                                          title: '获取失败,请重新获取',
                                          icon: 'none',
                                          duration: 2000
                                    })
                              }
                        })
                  },
                  fail: err => {
                        console.error(err);
                        wx.hideLoading()
                        wx.showToast({
                              title: '获取失败,请重新获取',
                              icon: 'none',
                              duration: 2000
                        })
                  }
            })
      },
      wxInput(e) {
            this.data.wxnum = e.detail.value;
      },
      qqInput(e) {
            this.data.qqnum = e.detail.value;
      },
      weiboInput(e) {
            this.data.weibo = e.detail.value;
      },
      getOpenid(){
            let that = this;
            wx.cloud.callFunction({
              name:'getOpenid',
              complete:res=>{
                console.log('云函数获取到的openid:',res.result.openid)
                var openid = res.result.openid;
                app.openid = openid
                that.setData({
                  openid:openid
                })
              }
            })
      },
      getUserInfo(e) {
            let that = this;
            console.log(e);
            let test = e.detail.errMsg.indexOf("ok");
            if (test == '-1') {
                  wx.showToast({
                        title: '请授权后方可使用',
                        icon: 'none',
                        duration: 2000
                  });
            } else {
                  that.setData({
                        userInfo: e.detail.userInfo
                  })
                  that.check();
            }
      },
      //校检
      check() {
            let that = this;
            //校检微博
            let weibo = that.data.weibo;
            if (weibo !== '') {
                  if (!(/@([a-zA-Z0-9_]+|\W+|[^x00-xff]+)/.test(weibo))) {
                        wx.showToast({
                              title: '请输入正确的微博昵称',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            //校检QQ号
            let qqnum = that.data.qqnum;
            if (qqnum !== '') {
                  if (!(/^\s*[.0-9]{5,11}\s*$/.test(qqnum))) {
                        wx.showToast({
                              title: '请输入正确的QQ号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            //校检微信号
            let wxnum = that.data.wxnum;
            if (wxnum !== '') {
                  if (!(/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/.test(wxnum))) {
                        wx.showToast({
                              title: '请输入正确的微信号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            wx.showLoading({
                  title: '正在提交',
            })

            var object = {
                  data: {
                        qqnum: that.data.qqnum,
                        weibo: that.data.weibo,
                        wxnum: that.data.wxnum,
                        stamp: new Date().getTime(),
                        info: that.data.userInfo,
                        useful: true,
                        parse: 0,
                  },
                  success: function(res) {
                        console.log(res)
                        db.collection('user').doc(res._id).get({
                              success: function(res) {
                                    wx.hideLoading();
                                    app.userinfo = res.data;
                                    app.openid = res.data._openid;
                                    wx.navigateBack({})
                              },
                        })
                  },
                  fail() {
                        wx.hideLoading();
                        wx.showToast({
                              title: '登陆失败，请重新提交',
                              icon: 'none',
                        })
                  }
            }
            db.collection('user').where({
              _openid: this.data.openid
            })
            .get({
              success: function(res) {
                // res.data 是包含以上定义的两条记录的数组
                console.log(res.data)
                // if ((res.data.length>0)) {
                //   let id = res.data[0]._id
                //   db.collection('user').doc(id).update(object)
                // } else {
                //   db.collection('user').add(object)
                // }
                db.collection('user').add(object)
              }
            })
            return false
            
      },
})