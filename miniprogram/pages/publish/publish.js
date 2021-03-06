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
           list: [{
                  showDate: "2021.05.13-2021.05.16",
                  showName: "【上海站】「陈佩斯/杨立新」舞台喜剧《戏台》",
                  showOID: "5f4715b6c756b11e5c3416d4",
                  venueName: "上汽·上海文化广场"
            },{
                  showDate: "2021.05.13-2021.05.16",
                  showName: "【上海站】「陈佩斯/杨立新」舞台喜剧《戏台》",
                  showOID: "5f4715b6c756b11e5c3416d4",
                  venueName: "上汽·上海文化广场"
            }],
      },
      //恢复初始态
      initial() {
            let that = this;
            that.setData({
                  dura: 30,
                  price: 15,
                  place: '',
                  chooseDelivery: 0,
                  cids: '-1', //学院选择的默认值
                  isbn: '',
                  show_a: true,
                  show_b: false,
                  show_c: false,
                  active: 0,
                  chooseCollege: false,
                  note_counts: 0,
                  notes: '',
                  kindid: 0,
                  kind: [{
                        name: '出票',
                        id: 0,
                        check: true,
                  }, {
                        name: '换票',
                        id: 1,
                        check: false
                  }, {
                        name: '求票',
                        id: 2,
                        check: false
                  }],
                  delivery: [{
                        name: '自提',
                        id: 0,
                        check: true,
                  }, {
                        name: '帮送',
                        id: 1,
                        check: false
                  }],
            })
      },
      onLoad() {
            this.initial();
      },
      //手动输入isbn
      isbnInput(e) {
            this.data.isbn = e.detail.value;
      },
      //打开摄像头扫码isbn
      scan() {
            let that = this;
            wx.scanCode({
                  onlyFromCamera: false,
                  scanType: ['barCode'],
                  success: res => {
                        wx.showToast({
                              title: '扫码成功',
                              icon: 'success'
                        })
                        that.setData({
                              isbn: res.result
                        })
                  },
                  fail() {
                        wx.showToast({
                              title: '扫码失败，请重新扫码或者手动输入',
                              icon: 'none'
                        })
                  }
            })
      },
      confirm() {
            let that = this;
            let isbn = that.data.isbn;
            // if (!(/978[0-9]{10}/.test(isbn))) {
            //       wx.showToast({
            //             title: '请检查您的isbn号',
            //             icon: 'none'
            //       });
            //       return false;
            // }
            // if (!app.openid) {
            //       wx.showModal({
            //             title: '温馨提示',
            //             content: '该功能需要注册方可使用，是否马上去注册',
            //             success(res) {
            //                   if (res.confirm) {
            //                         wx.navigateTo({
            //                               url: '/pages/login/login',
            //                         })
            //                   }
            //             }
            //       })
            //       return false
            // }
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
      query_shows(keyword) {
            let that = this;
            wx.showLoading({
                  title: '正在获取'
            })
            //先检查是否存在该书记录，没有再进行云函数调用
            wx.request({
            // header:{
            //   "x-xsrf-token": "d94666ef-6d26-465b-b218-7c6199a5a0e9",
            //   'Content-Type': 'application/json'
            // },
            url: 'https://www.moretickets.com/showapi/page/index?keyword='+keyword+'&offset=0&length=10',
            // url: 'https://www.moretickets.com/showapi/pub/v1_2/show/603c7898a81bd0393b0ec348/sessionone?locationCityOID=&time=1614865643440&src=web&sessionOID=',
            method: 'get',
            success: function (res) {
              console.log("wxRequest success")
              console.log(res)
              if (res.statusCode==200) {
                    let results = res.data.result.data
                    wx.hideLoading();
                    for (var i = 0; i < results.length; i++) {
                        util.highlight(results[i],keyword)
                    }
                    that.setData({
                        showList: results,
                  })
                  console.log(results)
              }
            },
            fail: function (res) {
                console.log('fail'+res.statusCode)
            }
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
      //价格输入改变
      priceChange(e) {
            this.data.price = e.detail;
      },
      //时才输入改变
      duraChange(e) {
            this.data.dura = e.detail;
      },
      //地址输入
      placeInput(e) {
            console.log(e)
            this.data.place = e.detail.value
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
      //选择专业
      choCollege(e) {
            let that = this;
            that.setData({
                  cids: e.detail.value
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
            //如果用户选择了专业类书籍，需要选择学院
            if (that.data.kind[1].check) {
                  if (that.data.cids == -1) {
                        wx.showToast({
                              title: '请选择学院',
                              icon: 'none',
                        });
                        return false;
                  }
            }
            //如果用户选择了自提，需要填入详细地址
            if (that.data.delivery[0].check) {
                  if (that.data.place == '') {
                        wx.showToast({
                              title: '请输入地址',
                              icon: 'none',
                        });
                        return false;
                  }
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
                              db.collection('publish').add({
                                    data: {
                                          creat: new Date().getTime(),
                                          dura: new Date().getTime() + that.data.dura * (24 * 60 * 60 * 1000),
                                          status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                                          price: that.data.price, //售价
                                          //分类
                                          kindid: that.data.kindid, //区别通用还是专业
                                          collegeid: that.data.cids, //学院id，-1表示通用类
                                          deliveryid: that.data.chooseDelivery, //0自1配
                                          place: that.data.place, //选择自提时地址
                                          notes: that.data.notes, //备注
                                          bookinfo: {
                                                _id: that.data.bookinfo._id,
                                                author: that.data.bookinfo.author,
                                                edition: that.data.bookinfo.edition,
                                                pic: that.data.bookinfo.pic,
                                                price: that.data.bookinfo.price,
                                                title: that.data.bookinfo.title,
                                          },
                                          key: that.data.bookinfo.title + that.data.bookinfo.keyword
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
      }
})