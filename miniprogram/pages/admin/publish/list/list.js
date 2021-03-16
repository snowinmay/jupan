const app = getApp()
const db = wx.cloud.database();
const config = require("../../../../config.js");
const _ = db.command;
Page({

      /**
       * 页面的初始数据
       */
      data: {
            list: [],
            page: 1,
            scrollTop: 0,
            nomore: false,
            collegeCur:-1
      },

      /**
       * 生命周期函数--监听页面加载
       */
      onLoad: function(options) {
            wx.showLoading({
                  title: '加载中',
            })
            this.getList();
      },
      getList() {
            let that = this;
            if (that.data.collegeCur == -1) {
                  var kindid = _.neq(-1); //除-2之外所有
            } else {
                  var kindid = parseInt(that.data.collegeCur) //小程序搜索必须对应格式
            }
            db.collection('publish').where({
                  status: kindid
            }).orderBy('creat', 'desc').limit(20).get({
                  success: function(res) {
                        wx.hideLoading();
                        wx.stopPullDownRefresh(); //暂停刷新动作
                        that.setData({
                              list: res.data,
                              nomore: false,
                              page: 0,
                        })
                        console.log(res.data)
                  }
            })
      },
      //学院选择
      collegeSelect(e) {
            this.setData({
                  collegeCur: e.currentTarget.dataset.id,
                  scrollLeft: (e.currentTarget.dataset.id - 3) * 100,
                  showList: false,
            })
            this.getList();
      },
      //选择全部
      selectAll() {
            this.setData({
                  collegeCur: -1,
                  scrollLeft: -200,
                  showList: false,
            })
            this.getList();
      },
      //删除
      del(e) {
            let that = this;
            let del = e.currentTarget.dataset.del;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要删除此条订单吗？',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在删除'
                              })
                              db.collection('publish').doc(del._id).remove({
                                    success() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '成功删除',
                                          })
                                          that.getList();
                                    },
                                    fail() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '删除失败',
                                                icon: 'none'
                                          })
                                    }
                              })
                        }
                  }
            })
      },
      //撤销
      cancel(e) {
            let that = this;
            let cancel = e.currentTarget.dataset.cancel;
            wx.showModal({
                  title: '温馨提示',
                  content: '信息撤销后将不会在首页展示，只能在【我的发布】中看到。您确定要撤销此条信息吗？',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在撤销'
                              })

                              wx.cloud.callFunction({
                                 // 云函数名称
                                 name: 'cancelP',
                                 // 传给云函数的参数
                                 data: {
                                    _id: cancel._id,
                                    _openid: app.openid,
                                    status:1,
                                 },
                                 success: res => {
                                          console.log(res)
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '撤销成功',
                                          })
                                          that.getList();
                                          //给用户发送撤销的消息
                                          that.sendMessageToAuthor(cancel)
                                    },
                                    fail: err => {
                                          console.error(err)
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '撤销失败',
                                                icon: 'none'
                                          })
                                    }
                              })
                              // wx.cloud.callFunction({
                              //       name: 'publish',
                              //       data: {
                              //             $url: "cancel", //云函数路由参数
                              //             _id: cancel._id,
                              //             _openid: app.openid,
                              //             status:1,
                              //       },
                              //       success: res => {
                              //             console.log(res)
                              //             wx.hideLoading();
                              //             wx.showToast({
                              //                   title: '撤销成功',
                              //             })
                              //             that.getList();
                              //             //给用户发送撤销的消息
                              //             // that.sendMessageToAuthor(cancel)
                              //       },
                              //       fail: err => {
                              //             console.error(err)
                              //             wx.hideLoading();
                              //             wx.showToast({
                              //                   title: '撤销失败',
                              //                   icon: 'none'
                              //             })
                              //       }
                              // })
                              // db.collection('publish').doc(cancel._id).update({
                              // db.collection('publish').where({
                              //       _id: cancel._id,
                              //       _openid: app.openid,
                              // }).update({
                              //       data: {
                              //             canceled_at: new Date().getTime(),
                              //             status:1
                              //       },
                              //       success() {
                              //             wx.hideLoading();
                              //             wx.showToast({
                              //                   title: '撤销成功',
                              //             })
                              //             that.getList();
                              //             //给用户发送撤销的消息
                              //             that.sendMessageToAuthor(cancel)
                              //       },
                              //       fail() {
                              //             wx.hideLoading();
                              //             wx.showToast({
                              //                   title: '撤销失败',
                              //                   icon: 'none'
                              //             })
                              //       }
                              // })
                        }
                  }
            })
      },
      sendMessageToAuthor(item){
            console.log(item.myTicketInfo.showName)
               wx.cloud.callFunction({
                  name: 'messageSend',
                  data:{
                    'id': item._id,
                    'templateId': JSON.parse(config.data).subscribeIds.orderStatus,
                    'status': '已撤销',
                    'price': item.price,
                    'time': new Date().getTime(),
                    'title': (item.myTicketInfo.showName).replace(/\s+/g,"").substr(0,20),//商品名称
                    'remark': '请上传真实的包含实付价格的截图'//备注
                  }    
                }).then(res=>{
                     console.log(res)
                })  
      },
      //擦亮
      crash(e) {
            let that = this;
            let crash = e.currentTarget.dataset.crash;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要擦亮此条订单吗？',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在擦亮'
                              })
                              db.collection('publish').doc(crash._id).update({
                                    data: {
                                          creat: new Date().getTime(),
                                          dura: new Date().getTime() + 7 * (24 * 60 * 60 * 1000), //每次擦亮管7天
                                    },
                                    success() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '成功擦亮',
                                          })
                                          that.getList();
                                    },
                                    fail() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '操作失败',
                                                icon: 'none'
                                          })
                                    }
                              })
                        }
                  }
            })
      },
      //查看详情
      detail(e) {
            let that = this;
            let detail = e.currentTarget.dataset.detail;
            wx.navigateTo({
                  url: '/pages/detail/detail?scene=' + detail._id,
            })
      },
      //下拉刷新
      onPullDownRefresh() {
            this.getList();
      },
      //至顶
      gotop() {
            wx.pageScrollTo({
                  scrollTop: 0
            })
      },
      //监测屏幕滚动
      onPageScroll: function(e) {
            this.setData({
                  scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
            })
      },
      onReachBottom() {
            this.more();
      },
      //加载更多
      more() {
            let that = this;
            if (that.data.nomore || that.data.list.length < 20) {
                  return false
            }
            let page = that.data.page + 1;
            db.collection('publish').where({
                  _openid: app.openid
            }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
                  success: function(res) {
                        if (res.data.length == 0) {
                              that.setData({
                                    nomore: true
                              })
                              return false;
                        }
                        if (res.data.length < 20) {
                              that.setData({
                                    nomore: true
                              })
                        }
                        that.setData({
                              page: page,
                              list: that.data.list.concat(res.data)
                        })
                  },
                  fail() {
                        wx.showToast({
                              title: '获取失败',
                              icon: 'none'
                        })
                  }
            })
      },
})