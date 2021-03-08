// pages/about/about.js
Page({

      /**
       * 页面的初始数据
       */
      data: {
            des:'本程序参考Github开源项目used-book-pro。\n\n开发此程序的初衷是方便爱看剧的同学发布，查询转票，换票信息。让票找到自己最好的归宿。\n\n从产品设计到UI再到所有页面逻辑代码皆有本人一人完成，出现一些BUG应该也很正常，发现了请及时和本人反馈。'
      },

      /**
       * 生命周期函数--监听页面加载
       */
      onLoad: function (options) {

      },

      onReady: function () {

      },
      //复制
      copy(e) {
            wx.setClipboardData({
                  data: e.currentTarget.dataset.copy,
                  success: res => {
                        wx.showToast({
                              title: '复制成功',
                              icon: 'success',
                              duration: 1000,
                        })
                  }
            })
      },
      /**
       * 生命周期函数--监听页面显示
       */
      onShow: function () {

      },

      /**
       * 生命周期函数--监听页面隐藏
       */
      onHide: function () {

      },

      /**
       * 生命周期函数--监听页面卸载
       */
      onUnload: function () {

      },

      /**
       * 页面相关事件处理函数--监听用户下拉动作
       */
      onPullDownRefresh: function () {

      },

      /**
       * 页面上拉触底事件的处理函数
       */
      onReachBottom: function () {

      },

      /**
       * 用户点击右上角分享
       */
      onShareAppMessage: function () {

      }
})