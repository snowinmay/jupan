const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
const util = require("../../util.js");
Page({
      data: {
            systeminfo: app.systeminfo,
            entime: {
                  enter: 600,
                  leave: 300
            }, //进入褪出动画时长
            college: JSON.parse(config.data).college.splice(1),
            steps: [{
                        text: '步骤一',
                        desc: '选择演出'
                  },
                  {
                        text: '步骤二',
                        desc: '补充详细信息'
                  },
                  {
                        text: '步骤三',
                        desc: '发布成功'
                  },
            ],
      },
      //恢复初始态
      initial() {
            let that = this;
            that.setData({
                  key:'',
                  dura: 30,
                  price: '',//售价
                  quantity: 1,//数量
                  contact:'',//联系方式
                  orderImage:'',//实付截图"cloud://aikan-4gyg06pf350949b1.6169-aikan-4gyg06pf350949b1-1305127265/uploads/422561"
                  contactIndex:-1,
                  show_a: true,
                  show_b: false,
                  show_c: false,
                  active: 0,
                  note_counts: 0,
                  notes: '',
                  kindid: 0,
                  selectShow:{},
                  kind: [{
                        name: '转票',
                        id: 0,
                        check: true,
                  }, {
                        name: '换票',
                        id: 1,
                        check: false
                  }],
                  contactType: [{
                        name: '微博',
                        id: 0,
                        value:'weibo',
                        check: true,
                  }, {
                        name: '微信',
                        id: 1,
                        value:'wxnum',
                        check: false
                  } ,{
                        name: 'QQ',
                        id: 2,
                        value:'qqnum',
                        check: false
                  } ,{
                        name: '其他',
                        id: 3,
                        value:'other',
                        check: false
                  }],
            })
      },
      onLoad() {
            this.initial();
      },
      onShow(){
            console.log(app.userinfo)
      },
      confirm() {
            //
            let that = this;
            let isbn = that.data.isbn;
            // if (!(/978[0-9]{10}/.test(isbn))) {
            //       wx.showToast({
            //             title: '请检查您的isbn号',
            //             icon: 'none'
            //       });
            //       return false;
            // }
            if (!app.openid) {
                  wx.showModal({
                        title: '温馨提示',
                        content: '该功能需要登录，马上登录？',
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
            // that.get_book(isbn);
            that.query_shows(isbn);
      },
      //跳转搜索
      search(e) {
            let type = e.currentTarget.dataset.type
            wx.navigateTo({
                  url: '/pages/searchShow/searchShow?type='+type,
            })
      },
      get_show(id) {
            let that = this;
            let time = (new Date).getTime()
            wx.showLoading({
                  title: '正在获取'
            })
            //先检查是否存在该书记录，没有再进行云函数调用
            wx.request({
            // header:{
            //   "x-xsrf-token": "d94666ef-6d26-465b-b218-7c6199a5a0e9",
            //   'Content-Type': 'application/json'
            // },
            url: 'https://www.moretickets.com/showapi/pub/v1_2/show/'+id+'/sessionone?locationCityOID=&time='+time+'&src=web&sessionOID=',
            method: 'get',
            success: function (res) {
              console.log("wxRequest success")
              console.log(res)
              if (res.statusCode==200) {
                    let results = res.data.result.data
                    let seatplans = []
                    wx.hideLoading();
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].seatplans.length) {
                              let plans = results[i].seatplans
                              for (var j = 0; j < plans.length; j++) {
                                    if (seatplans.indexOf(plans[j].originalPrice)<0){
                                          seatplans.push(plans[j].originalPrice)
                                    }
                                }
                        }
                    }
                    console.log(seatplans)
                    that.setData({
                        'selectShow.sessions': results,
                        'selectShow.seatplans': seatplans,
                  })
                  console.log(results)
              }
            },
            fail: function (res) {
                console.log('fail'+res.statusCode)
            }
          })
            
      },
      //查询书籍数据库详情
      get_book(bn) {
            let that = this;
            wx.showLoading({
                  title: '正在获取'
            })
            //先检查是否存在该书记录，没有再进行云函数调用
            db.collection('books').where({
                  isbn: bn
            }).get({
                  success(res) {
                        //添加到数据库
                        if (res.data == "") {
                              that.addbooks(bn);
                        } else {
                              wx.hideLoading();
                              that.setData({
                                    bookinfo: res.data[0],
                                    show_a: false,
                                    show_b: true,
                                    show_c: false,
                                    active: 1,
                              })
                        }
                  }
            })
      },
      //添加书籍信息到数据库
      addbooks(bn) {
            let that = this;
            wx.cloud.callFunction({
                  name: 'books',
                  data: {
                        $url: "bookinfo", //云函数路由参数
                        isbn: bn
                  },
                  success: res => {
                        console.log(res)
                        if (res.result.body.status == 0) {
                              db.collection('books').add({
                                    data: res.result.body.result,
                                    success: function(res) {
                                          wx.hideLoading();
                                          that.setData({
                                                bookinfo: res.result.body.result,
                                                show_a: false,
                                                show_b: true,
                                                show_c: false,
                                                active: 1,
                                          })
                                    },
                                    fail: console.error
                              })
                        }
                  },
                  fail: err => {
                        console.error(err)
                  }
            })
      },
      //价格输入
      contactInput(e) {
            console.log(e)
            this.data.contact = e.detail.value;
      },
      //价格输入
      priceInput(e) {
            console.log(e)
            this.data.price = e.detail.value;
      },
      //时长输入改变
      duraChange(e) {
            console.log(e)
            this.data.dura = e.detail;
      },
      //数量输入改变
      quantityChange(e) {
            console.log(e)
            this.data.quantity = e.detail;
      },
      //实付金额输入
      payInput(e) {
            console.log(e)
            this.setData({
                  'selectShow.pay': e.detail.value,
            })
      },
      //票面输入
      originalPriceInput(e) {
            console.log(e)
            this.setData({
                  'selectShow.originalPrice': e.detail.value,
            })
      },
      contactChange(e){
            let index = e.detail.value;
            let type = this.data.contactType[index].value
            if (app.userinfo[type]) {
                  this.setData({
                        contact:app.userinfo[type],
                        contactIndex: e.detail.value,
                  })
            }else{
                  this.setData({
                        contact:'',
                        contactIndex: e.detail.value,
                  })
            }
            console.log(app.userinfo)
            console.log(app.userinfo[type])
            console.log(this.contactIndex)
      },
      //书籍类别选择
      kindChange(e) {
            let that = this;
            let kind = that.data.kind;
            let id = e.detail.value;
            for (let i = 0; i < kind.length; i++) {
                  kind[i].check = false
            }
            kind[id].check = true;
            that.setData({
                  kind: kind,
                  kindid: id
            })
            console.log(that.data.kindid)
      },
      choSession(e) {
            let that = this;
            let _selected = this.data.selectShow.sessions[e.detail.value]
            // console.log(this.data.selectShow.sessions[e.detail.value])
            that.setData({
                  'selectShow.sessionIndex': e.detail.value,
                  'selectShow.sessionName': _selected.sessionName,
                  'selectShow.showSessionOID': _selected.showSessionOID,
            })
      },
      choSeatPlan(e) {
            // originalPrice
            let that = this;
            let _selected = this.data.selectShow.seatplans[e.detail.value]
            that.setData({
                  seatplanIndex: e.detail.value,
                  'selectShow.originalPrice': _selected,
            })
      },
      //取货方式改变
      delChange(e) {
            let that = this;
            let delivery = that.data.delivery;
            let id = e.detail.value;
            for (let i = 0; i < delivery.length; i++) {
                  delivery[i].check = false
            }
            delivery[id].check = true;
            if (id == 1) {
                  that.setData({
                        delivery: delivery,
                        chooseDelivery: 1
                  })
            } else {
                  that.setData({
                        delivery: delivery,
                        chooseDelivery: 0
                  })
            }
      },
      //输入备注
      noteInput(e) {
            let that = this;
            that.setData({
                  note_counts: e.detail.cursor,
                  notes: e.detail.value,
            })
      },
      //发布校检
      check_pub() {
            let that = this;
            if (!that.data.selectShow.sessionName) {
                  wx.showToast({
                        title: '请选择演出场次',
                        icon: 'none',
                  });
                  return false;
            }
            if (!that.data.selectShow.originalPrice) {
                  wx.showToast({
                        title: '请选择演出票面',
                        icon: 'none',
                  });
                  return false;
            }
            if (!that.data.selectShow.pay) {
                  wx.showToast({
                        title: '请输入实付金额',
                        icon: 'none',
                  });
                  return false;
            }
            if (!that.data.orderImage) {
                  wx.showToast({
                        title: '请上传实付截图',
                        icon: 'none',
                  });
                  return false;
            }
            if (!that.data.price) {
                  wx.showToast({
                        title: '请输入出票价格',
                        icon: 'none',
                  });
                  return false;                  
            }
            console.log(that.data.price)
            console.log(that.data.selectShow.pay)
            if (parseFloat(that.data.price)>parseFloat(that.data.selectShow.pay)) {
                  wx.showToast({
                        title: '出票价格不能高于实付价格',
                        icon: 'none',
                  });
                  return false;
            }
            if (parseFloat(that.data.price)>parseFloat(that.data.selectShow.originalPrice)) {
                  wx.showToast({
                        title: '出票价格不能高于票面价格',
                        icon: 'none',
                  });
                  return false;
            }
            if (!that.data.contact) {
                  wx.showToast({
                        title: '请输入联系方式',
                        icon: 'none',
                  });
                  return false;
            }
            that.publish();
      },
      //正式发布
      publish() {
            let that = this;
            wx.showModal({
                  title: '温馨提示',
                  content: '经检测您填写的信息无误，是否马上发布？',
                  success(res) {
                        if (res.confirm) {
                              console.log(that.data.selectShow)
                              db.collection('publish').add({
                                    data: {
                                          creat: new Date().getTime(),
                                          dura: new Date().getTime() + that.data.dura * (24 * 60 * 60 * 1000),
                                          status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                                          price: that.data.price, //售价
                                          contact: that.data.contactType[that.data.contactIndex].name + "：" + that.data.contact, //联系方式
                                          quantity: that.data.quantity, //数量
                                          //分类
                                          kindid: that.data.kindid, //出票，换票，求票，赠票
                                          notes: that.data.notes, //备注
                                          orderImage: that.data.orderImage, //备注
                                          key: that.data.selectShow.showName+that.data.selectShow.venueName+that.data.selectShow.sessionName, //备注
                                          myTicketInfo: {
                                                pay:that.data.selectShow.pay,
                                                originalPrice:that.data.selectShow.originalPrice,
                                                showDate: that.data.selectShow.showDate,
                                                showName: that.data.selectShow.showName,
                                                showOID: that.data.selectShow.showOID,
                                                sessionName: that.data.selectShow.sessionName,
                                                showSessionOID: that.data.selectShow.showSessionOID,
                                                venueName: that.data.selectShow.venueName
                                          },
                                          // key: that.data.bookinfo.title + that.data.bookinfo.keyword
                                    },
                                    success(e) {
                                          console.log(e)
                                          that.setData({
                                                show_a: false,
                                                show_b: false,
                                                show_c: true,
                                                active: 2,
                                                detail_id: e._id
                                          });
                                          //滚动到顶部
                                          wx.pageScrollTo({
                                                scrollTop: 0,
                                          })
                                    }
                              })
                        }
                  }
            })
      },
      select(e){
            console.log(this.data)
            if (Object.keys(this.data.selectShow).length === 0) {
                  wx.showToast({
                        title: '请选择演出',
                        icon: 'none'
                  })
                  return false;
            }
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
            this.get_show(this.data.selectShow.showOID)
            this.setData({
                  show_a: false,
                  show_b: true,
                  show_c: false,
                  active: 1,
            })
      },
      detail() {
            let that = this;
            wx.navigateTo({
                  url: '/pages/detail/detail?scene=' + that.data.detail_id,
            })
      },
      upImg(){
          var that = this;
          wx.chooseImage({
            count: 1,
            success(res){
              console.log(res);
              wx.showLoading({
                  title: '正在上传'
              })
              wx.cloud.uploadFile({
                cloudPath:'uploads/' + Math.floor(Math.random()*1000000),
                filePath:res.tempFilePaths[0],
                success(res){
                      wx.hideLoading()
                      console.log(res.fileID)
                      that.setData({
                              orderImage: res.fileID
                        })
                }
              })
            },
            fail(res){
                  wx.hideLoading()
            }
          })
      }
})