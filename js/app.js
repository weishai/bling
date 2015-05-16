// Bling app.js by weishai

var Config = {
  API: {
    createSnap: 'http://bling.treedom.cn/ajax/api/create_snap／',
    getSnap: 'http://bling.treedom.cn/ajax/api/get_snap/',
    getWxSign: 'http://bling.treedom.cn/ajax/weixin/sign',
    getAuth: 'http://bling.treedom.cn/ajax/weixin/getAuth/'
  }
}

//debug
// Config.API.createSnap = '../test/api/create_snap.json'
// Config.API.getSnap = '../test/api/get_snap.json'

var Bling = function () {
  
}

Bling.prototype.init = function () {
  var self = this

  this.data = {}

  this.render()
}

Bling.prototype.getSnapId = function () {
  //Todo: get from url
  return getUrlParam('testimg')
}

Bling.prototype.showSnap = function (cb) {
  var self = this
    , $body = $('body')
    , snapData = this.data.snap
    , isHideImg = false

  $body.addClass('bling-start')
    .one('touchstart', function(e) {
      var autoHideSet = null

      showSnapImg(snapData.snapImgUrl, snapData.snapShowTime)

      $body.one('touchend', function (et) {
        hideSnapImg(cb)
        et.preventDefault()
      })

      autoHideSet = setTimeout(function(){
        hideSnapImg(cb)
      }, snapData.snapShowTime * 1000)

      e.preventDefault()
    })

  function showSnapImg(url, time) {
    $body.addClass('bling-showimg')
      .find('#snapImg').attr('src', url)

    self.countDown(1, time*1000)
    return true
  }

  function hideSnapImg(cb) {
    if(isHideImg){
      return
    }
    $body.addClass('bling-hideimg')
      // .removeClass('bling-showimg')

    $('#countDown').hide()
    isHideImg = true
    cb && cb()
  }
}

Bling.prototype.showSnapLuck = function () {
  var self = this
    , snapData = this.data.snap

  if(!snapData.isSnapLuck){
    return
  }

  $('body').addClass('bling-upload')

}

Bling.prototype.countDown = function (percent, time) {
  var canvas = document.getElementById('countDown');
  var ctx = canvas.getContext("2d");
  var W = canvas.width;
  var H = canvas.height;
  var R = H/2.5;
  var deg=0,new_deg=0,dif=0;
  var loop,re_loop;
  var text,text_w;

  $countDown = $('#countDown')
  $countDown.addClass('countDown-show')
  draw(percent, time)
  
  function init(){
    // ctx.clearRect(0,0,W,H);
    // ctx.beginPath();
    // ctx.strokeStyle="rgba(0,0,0,0)";
    // ctx.lineWidth=1;
    // ctx.arc(W/2,H/2,R,0,Math.PI*2,false);
    // ctx.stroke();
    
    var r = deg*Math.PI/180;
    ctx.beginPath();
    ctx.strokeStyle = "#cba200";
    ctx.lineWidth=1;
    ctx.arc(W/2,H/2,R,0-90*Math.PI/180,r-90*Math.PI/180,false);
    ctx.stroke();
    
    // ctx.fillStyle="#cba200";
    // ctx.font="12px";
    // text = Math.floor(deg/360*100)+"%";
    // text_w = ctx.measureText(text).width;
    // ctx.fillText(text,W/2 - text_w/2,H/2+15);
  }
  function draw(p, t){
    //new_deg = Math.round(Math.random()*360);
    new_deg = Math.round(p*360);
    dif = new_deg-deg;
    loop = setInterval(to,t/dif);
  }
  function to(){
    if(deg == new_deg){
      clearInterval(loop);
      $countDown.remove()
    }
    if(deg<new_deg){
      deg++;
    }else{
      deg--;
    }
    init();
  }
  //re_loop = setInterval(draw,2000);
}

Bling.prototype.choseImg = function () {
  var self = this
    // , imgId = '../img/test.jpg'

  wx.chooseImage({
    success: function (res) {
      self.data.uploadImgId = res.localIds
      $('.page-upload').addClass('page-upload-ready')
      $('#Preview').attr('src', res.localIds)
    }
  })
}

Bling.prototype.submitImg = function () {
  var self = this
    , postData = {}

  postData.imgId = this.data.uploadImgId
  if(!postData.imgId){
    alert('还没选择图片')
  }
  $.get(Config.API.createSnap+postData.imgId, function (res) {
    if(res.code == 0){
      alert('提交成功，可以分享了')
    }
    else {
      alert('提交失败，稍后再试')
    }
  })
}

Bling.prototype.bindEvent = function () {
  var self = this

  $('body')
    .on('touchstart', '[data-upload]', function(e) {
      self.choseImg()
      e.preventDefault()
    })

  $('#submitImg').on('touchstart', function (e) {
    self.submitImg()
    e.preventDefault()
  })

}

Bling.prototype.render = function () {
  var self = this
    , curSnapId = this.getSnapId()

  if(!curSnapId){
    return false
  }

  $.get(Config.API.getSnap+curSnapId, function(data) {
    //debug
    // console.log(data)
    // data = JSON.parse(data)
    console.log(data)
    switch(data.code) {
      case 1001:
        alert('该用户已看过')
        console.log('该用户已看过')
        break
      case 1002:
        alert('超过可看人数')
        console.log('超过可看人数')
        break
      case 0:
        self.data.snap = data.data
        self.showSnap(function () {
          self.showSnapLuck()
        })
        break
      default:
        console.log('sys error')
        break
    }
  })
}

checkLogin()
var App = new Bling()
App.init()

$.get(Config.API.getWxSign, function (res) {
  if(res.code == 0){
    wx.config({
      debug: false,
      appId: 'wx875c7888a7aef3f7',
      timestamp: res.timestamp,
      nonceStr: res.nonceStr,
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

wx.ready(function(){
  Config.isWeixinOk = true
})

// function checkLogin() {
//   var bling_uid = getCookie('bling_uid')
//     , code = getUrlParam('code')
//   if(!bling_uid){
//     if(code){
//       $.get(Config.API.getAuth+code, function (res) {
//         if(res.code == 0){
//           setCookie('bling_uid', res.data.uid)
//         }
//       })
//       return true
//     }
//     else{
//       location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx875c7888a7aef3f7&redirect_uri=http%3A%2F%2Fbling.treedom.cn%2Findex.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'
//     }
//     return false
//   }
//   return true
// }

function checkLogin() {
  setCookie('bling_uid', 'o17b6s0pEDbINiypV2H0rlml5OAs')
}

function setCookie(c_name,value,expiredays){
  var exdate=new Date()
  exdate.setDate(exdate.getDate()+expiredays)
  document.cookie=c_name+ "=" +escape(value)+
  ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}

function getCookie(c_name){
if (document.cookie.length>0)
  {
  c_start=document.cookie.indexOf(c_name + "=")
  if (c_start!=-1)
    { 
    c_start=c_start + c_name.length+1 
    c_end=document.cookie.indexOf(";",c_start)
    if (c_end==-1) c_end=document.cookie.length
    return unescape(document.cookie.substring(c_start,c_end))
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





















