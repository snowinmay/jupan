//高亮关键字
function highlight(item,keyword) {
      let arr = (item.showName).split(keyword)
      item.highlight = false
      item.keyword = ''
      item.arr = [item.showName,'']
      if (arr.length>1) {
            item.highlight = true
            item.keyword = keyword
            item.arr = arr
      }
}

module.exports = {
      highlight: highlight
}