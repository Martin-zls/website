//列表翻页
var globalItemNumber = 18;
var nt = {};

// Ajax - POST
nt.postLoadData = function (url, data, success, error) {
  $('body').append('<div id="postLoadData-zhezhao" style="position: fixed;top: 0;right: 0;bottom: 0;left: 0; z-index: 99999; cursor: wait;"></div>')
  var timeOut = true,originalData=data;

  if (data && (typeof(data) == "object")) {
    data.subtime = new Date().getTime();
  } else {
    data = {
      subtime: (new Date().getTime())
    };
  }
  setTimeout(function () {
    if (timeOut && error) {
      error();
      $('#postLoadData-zhezhao').remove();
    }

  }, 10000);
  data = JSON.stringify(data);

  $.ajax({
    "url": url,
    "data": data,
    "type": "post",
    "contentType": "application/json",
    "success": function (rtnData) {
      if(rtnData.code == '0009'){
        //把当前的这个请求给保存起来
        nt.func.postEventList.callbacklist.push(function(){
          nt.postLoadData(url, originalData, success, error);
        });

        //如果锁已经锁住，就不用执行以下的操作了
        if(nt.func.postEventList.lock == true){
          return;
        }
        nt.func.postEventList.lock = true;


        if($.fn.nt_tip){
          $.fn.nt_tip('您还未登录！','danger');
        }else{
          alert('您还未登录！');
        }
        setTimeout(function(){
          var loginboxHtml,parentJquery = {};

          if($('body').hasClass('mainpage')){
            parentJquery = window.$;
            console.log(1);
          }else{
            parentJquery = window.parent.$;
            loginboxHtml = parentJquery('#loginformtext').html();
          }

          if(parentJquery.fn.nt_alert && loginboxHtml != undefined){
            parentJquery.fn.nt_alert({
              title:"登录",
              htmlstr: loginboxHtml,
              ready: function($alert){
                nt.func.binglogin(parentJquery,$alert);
              }
            });
          }else{
            window.location.href='/crm/page/login.html';
          }

        },600);

      }
      success(rtnData);
      $('#postLoadData-zhezhao').remove();
    },
    "error": function (rtnData) {
      timeOut = false;
      if (rtnData.status == "400") {
        nt.func.showLog("数据输入错误，错误码：" + rtnData.status, 'danger');
      }
      if (error) {
        error(rtnData)
      } else {
      }
      $('#postLoadData-zhezhao').remove();
    },
    dataType: "json"
  });
};



// 公共方法
nt.func = {};

/* 定义通用的正则 */
nt.func.globalReg = {
  "money": /^([1-9]\d*|0)(\.\d{1,5})?$/,
  "interest": /^(\-?([1-9]\d?|0)(\.\d{1,2})?)$|^(\-?10{2})$/,
  "num": /^[1-9]\d*$|^0$/,
  "characters": /^[\u4e00-\u9fa5a]{2,6}$/,
  "zuoji": /^\d{3,4}\-\d{7,8}|1\d{10}$/,
  "year": /^20(0[0-9]{1}|1[0-6]{1})$/,
  "month": /^([1-9]{1}|1[0-2]{1})$/,
  "phone": /^1\d{10}$/,
  "checkspace": /\s/g,
  "checkPhone": /^1\d{10}$/,
  "cardID": /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,//身份证
  "checkBankNo": /^\d{15,19}$/,   //银行卡位数判断
  "checkNum": /^[1-9]\d*$/
};

//
//获取url里面的路径，
nt.func.getUrlParams = function (url, n) {
  var hrefstr, pos, parastr, para, tempstr;
  hrefstr = url;
  pos = hrefstr.indexOf("?");
  parastr = hrefstr.substring(pos + 1);
  para = parastr.split("&");
  tempstr = "";
  for (var i = 0; i < para.length; i++) {
    tempstr = para[i];
    pos = tempstr.indexOf("=");
    if (tempstr.substring(0, pos).toLowerCase() == n.toLowerCase()) {
      return decodeURIComponent(tempstr.substring(pos + 1));
    }
  }
  return null;
};

//往页面中添加js文件【id为script标签的id；url为js文件的路径；cb为加载完js要执行的函数；】
nt.func.addScript = function (id, url, cb) {
  var targetscript = document.getElementById(id);

  if (targetscript) {
    nt.func.showLog("id为" + id + "的script已经存在！");
    return;
  }

  var oHead = document.getElementsByTagName('HEAD').item(0);

  var oScript = document.createElement("script");

  oScript.type = "text/javascript";

  oScript.id = id;

  oScript.src = url;

  oHead.appendChild(oScript);

  oScript.onload = oScript.onreadystatechange = function () {
    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      cb && cb();
    }
    oScript.onload = oScript.onreadystatechange = null;
  };
};

//往页面中添加css文件【id为link标签的id，用来判断该css文件是否已经添加；sytlePath为css的路径；】
nt.func.addSheet = function (id, stylePath) {
  var targetscript = document.getElementById(id);

  if (targetscript) {
    nt.func.showLog("id为" + id + "的link已经存在！");
    return;
  }

  var container = document.getElementsByTagName("head")[0];
  var addStyle = document.createElement("link");
  addStyle.rel = "stylesheet";
  addStyle.type = "text/css";
  addStyle.media = "screen";
  addStyle.id = id;
  addStyle.href = stylePath;
  container.appendChild(addStyle);
};

// 获取url中的参数
//nt.func.getQueryString = function (name) {
//  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
//  var r = window.location.search.substr(1).match(reg);
//  if (r != null) return unescape(r[2]);
//  return null;
//};
nt.func.getQueryString = function (name){
  var url = window.location.search; //获取url中"?"符后的字串
  var theRequest = new Object();
  if (url.indexOf("?") != -1) {
    var str = url.substr(1);
    var strs = str.split("&");
    for(var i = 0; i < strs.length; i ++) {
      //就是这句的问题
      theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);
      //之前用了unescape()
      //才会出现乱码
    }
  }
  return theRequest[name];
};

// 把serializeArray获得的数据转成json
nt.func.jqSAtojson = function (arr) {
  var that = this;
  var json = {};
  if (arr.length > 0) {
    for (var i = 0, len = arr.length; i < len; i++) {
      //json[arr[i].name] = that.trim(arr[i].value);
      json[arr[i].name] = arr[i].value;
    }
  }
  return json;
};

// 去掉tsp
nt.func.removeTsp = function (obj) {
  if (Object.prototype.toString.call(obj) == '[object Object]') {
    for (var i in obj) {
      if (Object.prototype.toString.call(obj[i]) == '[object Object]') {
        nt.func.removeTsp(obj[i]);
      } else {
        if (i == 'tsp') delete obj[i];
      }
    }
  }
};


// 去掉左右空格
nt.func.trim = function (s) {
  return s.replace(/(^\s*)|(\s*$)/g, "");
};

//判断对象的每个值是否都有效
nt.func.checkObjValue = function (obj) {
  var isOk = true;
  for (var i in obj) {
    if (!obj[i] && obj[i] != 0) {
      isOk = false;
      break;
    }
  }
  return isOk;
};


//打印消息，兼容ie8以下浏览器
nt.func.showLog = function (msg) {
  try {
    console.log(msg);
  } catch (e) {
  }
};



//审核状态转换
nt.func.translateStatus = function (num) {
  var status = {
    "1": "未提交",
    "10": "提交审核",
    "2": "审核中",
    "3": "初审通过",
    "30": "初审驳回",
    "34": "复审中",
    "4": "复审通过",
    "40": "复审驳回",
    "41": "复审否决",
    "420": "风控经理审核中",
    "421": "风控经理同意",
    "422": "风控经理驳回",
    "423": "风控经理否决",
    "424": "风控经理转向中间人",
    "425": "风控经理转向终审",
    "450": "风控总审中",
    "4511": "总审转向小评审委员会",
    "4512": "总审转向大评审委员会",
    "4513": "总审转向风控复审",
    "452": "总审驳回",
    "453": "总审否决",
    "460": "小委员会评审中",
    "461": "小评审通过",
    "463": "小评审否决",
    "470": "大委员会评审中",
    "471": "大评审通过",
    "473": "大评审否决",
    "480": "秘书评审中",
    "481": "秘书通过",
    "482": "秘书驳回",
    "483": "秘书否决",
    "490": "中间人审核中",
    "491": "终审通过",
    "492": "终审驳回",
    "493": "终审否决",
    "5": "终审通过",
    "500": "法务驳回",
    "501": "待归档",
    "502": "已归档",
    "503": "法务废弃",
    "504": "待法务复审",
    "6": "废弃"
  };
  return status[num];
};


//用户类型转换
nt.func.getCustomerType = function (num) {
  if (num > 0 && num < 300000000) return "经销商担保";
  if (num > 300000000 && num < 400000000) return "经销商借款";
  if (num > 400000000 && num < 500000000) return "种植户商借款";
  if (num > 500000000 && num < 600000000) return "零售店商借款";
  if (num > 600000000 && num < 700000000) return "标正客户借款";
};



//时间戳转日期
//stamp是时间戳，type为1时返回yy-mm-dd，type为2时返回yy年mm月dd日
nt.func.timeStampToTime = function (stamp, type) {
  if (!stamp) return '';
  var date = new Date(stamp);
  var timemonth = date.getMonth() + 1;
  var timedate = date.getDate();
  var hoursdata = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  if(timemonth < 10) timemonth = '0'+timemonth;
  if(timedate < 10) timedate = '0'+timedate;
  if(hoursdata < 10) hoursdata = '0'+hoursdata;
  if(minutes < 10) minutes = '0'+minutes;
  if(seconds < 10) seconds = '0'+seconds;
  if (type == 1) {
    return date.getFullYear() + "-" + timemonth + "-" + timedate;
  }else if(type == 2){
    return date.getFullYear() + "-" + timemonth;
  }else if(type == 3){
    return date.getFullYear() + "-" + timemonth + "-" + timedate + " " + hoursdata + ":" + minutes;
  }else if(type == 4){
      return date.getFullYear() + "." + timemonth + "." + timedate + " " + hoursdata + ":" + minutes;
  }else if(type == 5){
      return date.getFullYear() + "." + timemonth + "." + timedate + " " + hoursdata + ":" + minutes+ ":" + seconds;
  }else {
    return date.getFullYear() + "年" + timemonth + "月" + timedate + "日";
  }
};



//日期转时间戳
nt.func.timeToTimeStamp = function (time) {
  if (!time) return '';
  return Date.parse(new Date(time));
};

//按钮锁定
nt.func.buttonlock = function(btn,changeBtntest){
  var btnobj = {};
  btnobj.btn = btn;
  btnobj.text = btn.html();
  btnobj.lock = function(){
    btnobj.btn.attr('disabled','disabled');
    if(!changeBtntest === false){
      btnobj.btn.html('正在为您提交，请稍候...');
    }
  };
  btnobj.open = function(){
    btnobj.btn.removeAttr('disabled');
    if(!changeBtntest === false){
      btnobj.btn.html(btnobj.text);
    }
  };
  return btnobj;
};

//双击弹出大编辑框
nt.func.inputDoubleClick = function(className){
  $(document).on('dblclick',className,function(){
    var _this = $(this);
    var data = _this.val();
    var title = _this.data('value');
    var htmlstr = '';

    if(this.hasAttribute('readonly')){
      return false;
    }
    if(data){
      htmlstr += '<textarea rows="3" class="bigEditBox" style="width:700px;height:400px;margin-left:9px;">';
      htmlstr += data;
      htmlstr += '</textarea>';
    }else{
      htmlstr += '<textarea rows="3" class="bigEditBox" style="width:700px;height:400px;margin-left:9px;">';
      htmlstr += '</textarea>';
    }
    $.fn.nt_alert({
      title: title,
      htmlstr: htmlstr,
      ready: function(){
        //弹出框加载完了之后要把光标定到bigEditBox
        $('.bigEditBox').focus();
      },
      confirm: function(){
        var txt = $('.bigEditBox').val();
        _this.val(txt);
      },
      cancel:function(){
        return true;
      }
    })
  })
};

nt.func.postEventList = {lock:false,callbacklist:[]};
nt.func.binglogin = function($,$alert){

  $alert.find('.codeArea').on('click',function(){
    $('#Vcode').attr("src","/crm/login/getVerifiyCode?s="+new Date().getTime());
  });

  $alert.find('input').on('keydown',function(event){
    if(event.keyCode==13) {
      $('#loginSubmit').click();
    }
  });

  $('#loginSubmit').on('click',function(){

    var username = $('#username').val() || "",
      password = $('#password').val() || "",
      code = $('#code').val() ||　"",
      isVisible = !$('#yzm').hasClass('hidden');

    if(!username) {
      $.fn.nt_tip('用户名不能为空！','danger');
      return;
    }
    if(!password) {
      $.fn.nt_tip('密码不能为空！','danger');
      return;
    }

    if(isVisible){
      if(!code) {
        $.fn.nt_tip('验证码不能为空！','danger');
        return;
      }
    }


    var params = {
      "userName" : username,
      "pwd" : $.md5(password),
      "code" : code
    };

    nt.postLoadData('/crm/auth/login',params,function(data){
      var oldUserName = '';
      if(data.code == "0000"){
        if(nt.status){
          oldUserName = nt.status.userName;
        }else if(window.parent.nt.status){
          oldUserName = window.parent.nt.status.userName;
        }else{
          oldUserName = params.userName;
        }
        $alert.remove();
        $("#nt-crm-zhezhao").hide();
        if(oldUserName!==params.userName){
          window.parent.location.reload();
        }
        while (nt.func.postEventList.callbacklist.length > 0) {
          var func = nt.func.postEventList.callbacklist.shift();
          func();
        }
        nt.func.postEventList.lock = false;
      } else {

        if(data.result > 3){
          $alert.find('#yzm').removeClass('hidden');
          $alert.find('#Vcode').attr("src","/crm/login/getVerifiyCode?s="+new Date().getTime());
        }
        $.fn.nt_tip(data.msg,'danger');
      }
    },function(e){});

  });
};

nt.func.islogin = function(cb){
  /* 判断是否登录 */
  nt.postLoadData('/crm/auth/isLogin', {}, function (data) {

    if (data.code == "00302") {
      nt.func.postEventList.callbacklist.push(cb);
      if(nt.func.postEventList.lock == true){
        return;
      }
      nt.func.postEventList.lock = true;
      nt.func.postEventList.callbacklist.push(nt.func.islogin);

      var parentJquery = {};

      if($('body').hasClass('mainpage')){
        parentJquery = window.$;
      }else{
        parentJquery = window.parent.$;
      }

      parentJquery.fn.nt_alert({
        title:"登录",
        htmlstr: parentJquery('#loginformtext').html(),
        ready: function($alert){
          nt.func.binglogin(parentJquery,$alert);
        }
      });
    }

    if (data.code == "0000") {
      $('.logoTitle span').html(data.realName);

      if (data.userName == "admin") {
        $('.flowDeploy').show();
      }

      if (!nt.status) {
        nt.status = {};
      }
      nt.status.userName = data.userName;
      nt.status.realName = data.realName;

      cb && cb(data);
    }

  }, function (e) {});
};

//字符串截取
nt.func.stringSlice = function(str,n){
    if(str==null||str==undefined){
      return str;
    };
    if(str.length>n){
      return str.slice(0,n)+'…';
    }else{
      return str;
    }
};

//判断数字是不是整数
nt.func.isInteger = function(num){
  if(isNaN(num)) nt.func.showLog(num+'不是数字');

  if( num-parseInt(num)===0 ) {
    return true;
  }else{
    return false;
  }
};

nt.func.formatNum = function(num,place){
  if(isNaN(num) || num === '') return num;
  if(num == null) return '';

  var result,a,isbiggerZero=true;
  if(num>0 || num<0){
    if(num<0){
      isbiggerZero= false;
      num = -num;
    }
    if(num.toString().indexOf('.')>=0){
      num+='000001';
    }

    //10.03和10.04乘以100后得到的数不准确，所以区分对待。
    result = Math.floor(num*Math.pow(10,place))/Math.pow(10,place);

    //获取num的小数点后位数
    if(nt.func.isInteger(result)){
      a=0;
    }else{
      a = result.toString().split(".")[1].length;
    }
    if(a==0){
      result += '.';
      for(var i=0;i<place;i++){
        result += '0';
      }
    }else{
      if(a<place){
        for(var k=0;k<place-a;k++){
          result += '0';
        }
      }else{
        //10.03和10.04乘以100后得到的数不准确，所以区分对待。
        result = Math.floor(num*Math.pow(10,place))/Math.pow(10,place);
      }
    }

    if(!isbiggerZero){
      result = '-'+result;
    }
    return result;
  }else{
    result = '0.';
    for(var j=0;j<place;j++){
      result += '0';
    }
    return result;
  }
};

nt.func.getObjLength = function(Obj){
  var i = 0;
  for( j in Obj){
    i++;
  }
  return i;
};

nt.func.myCookie = {
  set : function(name, value){
    var day = 30; //默认 30 天
    var exp = new Date();
    exp.setTime(exp.getTime() + day*24*60*60*1000);
    document.cookie = name + "=" + escape (value) + ";expires=" + exp.toGMTString();
  },

  get : function(name){
    var arrStr = document.cookie.split("; ");
    var i = 0, len = arrStr.length;
    for(; i < len; i++){
      var temp = arrStr[i].split("=");
      if(temp[0] == name) return unescape(temp[1]);
    }
  },

  del : function(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = this.get(name);
    if(typeof cval != "undefined") document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
  }
};