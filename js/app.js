// Bling app.js by weishai

var Config = {
  site: 'http://cq1.treedom.cn/',
  // site: 'http://bling.treedom.cn/',
  cdnDir: 'http://cq1.treedom.cn/upload/',
  API: {
    createSnap: 'http://cq1.treedom.cn/ajax/api/create_snap/',
    getSnap: 'http://cq1.treedom.cn/ajax/api/get_snap/',
    getWxSign: 'http://cq1.treedom.cn/ajax/weixin/sign',
    getAuth: 'http://cq1.treedom.cn/ajax/weixin/getAuth/'
  }
}

//debug
// Config.API.createSnap = '../test/api/create_snap.json'
// Config.API.getSnap = 'test/api/get_snap.json'
// $('body').addClass('bling-start bling-showimg')
// $('#snapImg').attr('src', 'img/http.jpg')
// setTimeout(function () {
//   // $('body').addClass('bling-upload')
//   $('.page-upload').addClass('page-upload-ready')
// }, 1000)
// upload
// $('body').addClass('bling-start bling-showimg bling-upload')
//$('body').addClass('bling-nolook')



var Bling = function() {

}

Bling.prototype.init = function() {
  var self = this

  this.data = {}

  this.render()
}

Bling.prototype.getSnapId = function() {
  //Todo: get from url
  return getUrlParam('snapimg')
}

Bling.prototype.showSnap = function(cb) {
  var self = this,
    $body = $('body'),
    snapData = this.data.snap,
    isHideImg = false

  $body.addClass('bling-start')
    .one('touchstart', function(e) {
      var autoHideSet = null

      showSnapImg(snapData.snapImgUrl, snapData.snapShowTime)

      $body.one('touchend', function(et) {
        hideSnapImg(cb)
        et.preventDefault()
      })

      autoHideSet = setTimeout(function() {
        hideSnapImg(cb)
      }, snapData.snapShowTime * 1000)

      e.preventDefault()
    })

  function showSnapImg(url, time) {
    $body.addClass('bling-showimg')
      .find('#snapImg').attr('src', url)

    self.countDown(1, time * 1000)
    return true
  }

  function hideSnapImg(cb) {
    if (isHideImg) {
      return
    }
    $body.addClass('bling-hideimg')
      // .removeClass('bling-showimg')

    $('#countDown').hide()
    isHideImg = true
    cb && cb()
  }
}

Bling.prototype.showSnapLuck = function() {
  var self = this,
    snapData = this.data.snap

  // if(!snapData.isSnapLuck){
  //   return
  // }
  $('.snapluck-tips .author').html(snapData.snapAuthor.nickname)

  $('body').addClass('bling-upload')

}

Bling.prototype.countDown = function(percent, time) {
  var canvas = document.getElementById('countDown');
  var ctx = canvas.getContext("2d");
  var W = canvas.width;
  var H = canvas.height;
  var R = H / 2.5;
  var deg = 0,
    new_deg = 0,
    dif = 0;
  var loop, re_loop;
  var text, text_w;
  var timeNum = parseInt(time/1000)

  $countDown = $('#countDown')
  $countDown.addClass('countDown-show')
  draw(percent, time)
  $('.countDown-wrap .num').html(timeNum)
  var numT = setInterval(function () {
    timeNum--
    if(timeNum < 1){
      $('.countDown-wrap .num').remove()
      $countDown.remove()
      clearInterval(numT)
      return;
    }
    $('.countDown-wrap .num').html(timeNum)
  }, 1000)

  function init() {
    // ctx.clearRect(0,0,W,H);
    // ctx.beginPath();
    // ctx.strokeStyle="rgba(0,0,0,0)";
    // ctx.lineWidth=1;
    // ctx.arc(W/2,H/2,R,0,Math.PI*2,false);
    // ctx.stroke();

    var r = deg * Math.PI / 180;
    ctx.beginPath();
    ctx.strokeStyle = "#cba200";
    ctx.lineWidth = 1;
    ctx.arc(W / 2, H / 2, R, 0 - 90 * Math.PI / 180, r - 90 * Math.PI / 180, false);
    ctx.stroke();

    // ctx.fillStyle="#cba200";
    // ctx.font="12px";
    // text = Math.floor(deg/360*100)+"%";
    // text_w = ctx.measureText(text).width;
    // ctx.fillText(text,W/2 - text_w/2,H/2+15);
  }

  function draw(p, t) {
    //new_deg = Math.round(Math.random()*360);
    new_deg = Math.round(p * 360);
    dif = new_deg - deg;
    loop = setInterval(to, t / dif);
  }

  function to() {
      if (deg == new_deg) {
        clearInterval(loop);
      }
      if (deg < new_deg) {
        deg++;
      } else {
        deg--;
      }
      init();
    }
    //re_loop = setInterval(draw,2000);
}

Bling.prototype.choseImg = function() {
  var self = this
    // , imgId = '../img/test.jpg'

  // alert('choseImg')

  wx.chooseImage({
    success: function(res) {
      // alert('chose img success')
      self.data.localImgId = res.localIds
      $('.page-upload').addClass('page-upload-ready')
      $('#Preview').attr('src', res.localIds)
    }
  })
}

Bling.prototype.loading = function(cb) {
  var self = this
    , $loading = $('#Loading')
    , snap = self.data.snap
    , delay = 0
    , img = new Image()

  $('#Loading').show()
  if (!(snap.snapImgUrl && /http/.test(snap.snapImgUrl)) && snap.snapImgUrl.length > 4){
    // alert('begin wx load img')
    if(!Config.isWeixinOk){
      delay = 500
    }
    setTimeout(function () {
      wx.downloadImage({
        serverId: snap.snapImgId,
        isShowProgressTips: 1, // 默认为1，显示进度提示
        success: function (res) {
          // alert('img load end')
          snap.snapImgUrl = res.localId
          $('#Loading').hide()
          cb && cb($loading)
        }
      })
    }, delay)
  }
  else {
    img.onload = function() {
      $('#Loading').hide()
      cb && cb($loading)
    }
    img.src = snap.snapImgUrl
  }
}

Bling.prototype.submitImg = function() {
  var self = this,
    localImgId

  localImgId = self.data.localImgId[0]
    // alert(localImgId)
  if (!localImgId) {
    alert('还没选择图片')
    return false
  }
  wx.uploadImage({
    localId: localImgId, // 需要上传的图片的本地ID，由chooseImage接口获得
    isShowProgressTips: 1, // 默认为1，显示进度提示
    success: function(res) {
      var serverId = res.serverId; // 返回图片的服务器端ID
      $.get(Config.API.createSnap + serverId, function(res) {
        // alert('upload back: '+res.code)
        if (res.code == 0) {
          self.data.curShareId = serverId
          self.updateShare()
          alert('提交成功，可以分享了')
        } else {
          alert('提交失败，稍后再试')
        }
      })
    }
  })
}

Bling.prototype.updateShare = function() {
  var self = this,
    shareUrl,
    snapThumb = Config.cdnDir + 's_'+ self.data.curShareId +'.jpg'

  shareUrl = Config.site + '?snapimg=' + self.data.curShareId
  wx.onMenuShareAppMessage({
    title: 'bling', // 分享标题
    desc: 'bling desc', // 分享描述
    link: shareUrl, // 分享链接
    imgUrl: snapThumb, // 分享图标
    // type: '', // 分享类型,music、video或link，不填默认为link
    // dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
    success: function() {
      // 用户确认分享后执行的回调函数
      alert('已分享给朋友')
    },
    cancel: function() {
      alert('取消分享朋友')
        // 用户取消分享后执行的回调函数
    }
  });
}
Bling.prototype.showVisitors = function(data) {
  var self = this
    , vTpl = ''
    , lTpl = ''

  if(data.visitors.length){
    for(var i = 0; i<data.visitors.length; i++){
      vTpl = vTpl + '<div class="item"><img src="'+data.visitors[i].avatar+'"><span class="user-name">'+data.visitors[i].nickname+'</span></div>'
    }
    $('#Visitors .userbox-list').html(vTpl)
    $('#Visitors').show()
  }

  if(data.luckyVisitors.length){
    for(var i = 0; i<data.luckyVisitors.length; i++){
      lTpl = lTpl +  '<div class="item"><img src="'+data.luckyVisitors[i].avatar+'"><span class="user-name">'+data.luckyVisitors[i].nickname+'</span></div>'
    }
    $('#luckVisitors .userbox-list').html(lTpl)
    $('#luckVisitors').show()
  }
  
}

Bling.prototype.bindEvent = function() {
  var self = this

  $('body')
    .on('touchstart', '[data-upload]', function(e) {
      self.choseImg()
      e.preventDefault()
    })

  $('#submitImg').on('touchstart', function(e) {
    // alert('submitImg')
    self.submitImg()
    e.preventDefault()
  })

}

Bling.prototype.render = function() {
  var self = this,
    curSnapId = this.getSnapId()

  if (!curSnapId) {
    return false
  }

// console.log(Config.cdnDir + 's_'+ curSnapId +'.jpg')
// console.log($('.page-start .cover'))
//   $('.page-start .cover').css({backgroundImage: 'url('+Config.cdnDir + 's_'+ curSnapId +'.jpg)'})
  // $('.page-start .cover').css({backgroundImage: test})
  // console.log($('.page-start .cover').length)
  // $('.page-start .cover').css({height: 'auto'})

  $.get(Config.API.getSnap + curSnapId, function(data) {
  // $.get(Config.API.getSnap, function(data) {
    //debug
    // console.log(data)
    // data = JSON.parse(data)
    //debug
    // self.data.snap = {
    //   snapImgUrl: 'test'
    // }
    // self.showSnap()
    // self.showSnapLuck()
    // return;

    console.log(data)

    var snapThumb = Config.cdnDir + 's_'+ curSnapId +'.jpg'
    // var snapThumb = 'img/test-thumb.jpg'
    switch (data.code) {
      case 1001:
        // alert('该用户已看过')
        $('html').addClass('bling-nolook')
        $('.nolook-tips').html('你已看过啦，图片已销毁了')
        self.showVisitors(data.data)
        console.log('该用户已看过')
        break
      case 1002:
        $('html').addClass('bling-nolook')
        $('.nolook-tips').html('傻眼了吧   来晚啦！')
        self.showVisitors(data.data)
        console.log('超过可看人数')
        break
      case 0:
        $('.page-start .cover').css({backgroundImage: 'url('+ snapThumb +')'}).show()
        self.data.snap = data.data
        self.loading(function () {
          self.showSnap(function() {
            self.showSnapLuck()
          })
        })
        break
      default:
        console.log('sys error')
        break
    }
  }, 'json')

  self.bindEvent()
}

var App = new Bling()
checkLogin(function() {
  App.init()
})


$.get(Config.API.getWxSign, function(res) {
  // alert(JSON.stringify(res))
  if (res.timestamp) {
    wx.config({
      debug: false,
      appId: 'wx875c7888a7aef3f7',
      timestamp: res.timestamp,
      nonceStr: res.noncestr,
      signature: res.signature,
      jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
      ]
    })
  }
})

wx.error(function(res) {
  console.log('wx error')
    // alert(JSON.stringify(res))
});

wx.ready(function() {
  // alert('wx.ready')
  Config.isWeixinOk = true
})

function checkLogin(cb) {
  var bling_uid = getCookie('bling_uid')
    , code = getUrlParam('code')
    , param = getUrlParam('snapimg') || ''
  if (!bling_uid) {
    if (code) {
      $.get(Config.API.getAuth + code, function(res) {
        if (res.code == 0) {
          setCookie('bling_uid', res.data.uid)
            // alert(JSON.stringify(res.data))
          cb && cb()
        }
      })
      return true
    } else {
      if(param){
        param = '?snapimg=' + param
      }
      // location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx875c7888a7aef3f7&redirect_uri=http%3A%2F%2Fbling.treedom.cn%2Findex.html'+param+'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'
      location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx875c7888a7aef3f7&redirect_uri='+encodeURIComponent(Config.site)+param+'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'
    }
    return false
  }
  cb && cb()
  return true
}

// function checkLogin(cb) {
//   setCookie('bling_uid', 'o17b6s4BVxHPN5hGdAaTUspsKVC4')
//   cb && cb()
// }

function setCookie(c_name, value, expiredays) {
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + expiredays)
  document.cookie = c_name + "=" + escape(value) +
    ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
}

function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=")
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1
      c_end = document.cookie.indexOf(";", c_start)
      if (c_end == -1) c_end = document.cookie.length
      return unescape(document.cookie.substring(c_start, c_end))
    }
  }
  return ""
}

function getUrlParam(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
