$(function ($) {
  // new tips
  $.getJSON("/cwweb/admin/jsondata/loginnotice.json", function (result) {
    if (result && result.updateDate && !$.cookie("systemTips")) {
      var timesData = new Date(result.updateDate - 0);
      var timeStr = timesData.toLocaleDateString().replace(/\//g, ".");
      var content = '<p style="text-indent:0;line-height:2.0;">' +
        result.content.replace(/\n/g, '</p><p class="pCon">').replace(/\s{2}/g, '&nbsp;') +
        '</p>';
      var tipsData = {
        "mes": content,
        "time": timeStr
      };
      var tipsStr = '<div class="wrapCon">' +
        tipsData.mes
        // +'<div class="tipsChoose"><div><span></span>不再提示</div></div>'
        +
        '<foot class="footWrap"><div class="footCon">' + tipsData.time + '</div></foot>' +
        '</div>';
      layer.alert(tipsStr, {
        title: ['平台公告', 'font-size:14px;font-weight:bold;text-indent:0;'],
        skin: 'layui-layer-molv',
        // area: ['510px','350px'],
        area: '510px',
        closeBtn: 1,
        success: function (layero, index) {
          layero.find(".layui-layer-btn").prepend('<div class="tipsChoose"><div><span></span>不再提示</div></div>');
          layero.find(".tipsChoose div").click(function () {
            var checkSpan = $(this).find("span").eq(0);
            if (checkSpan.hasClass("act")) {
              checkSpan.removeClass("act");
            } else {
              checkSpan.addClass("act");
            }
          });
          layero.find(".layui-layer-btn0").click(function () {
            if (layero.find(".tipsChoose div").find("span").eq(0).hasClass("act")) {
              $.cookie("systemTips", "true", {
                expires: 365
              });
            }
          });

        },
        cancel: function (index) {

        }
      }, function (index) {

      });
    }
  });

  // login part
  // init
  $("#username").focus();
  if ($.cookie("rmbUser") == "true") {
    $("#check").addClass('checked');
    $("#check").removeClass('noo');
    $("#username").val($.cookie("username"));
    $("#password").val($.cookie("password"));
    var platformId = $.cookie("platformId");
    platformId = platformId == null ? 0 : platformId;
    $("#platformId").val(platformId);
  } else {
    $("#check").addClass('noo');
    $("#check").removeClass('checked');
  }

  //IE浏览器绑定input事件，其他浏览器绑定propertychange事件
  var bindName = 'input';
  if (navigator.userAgent.indexOf("MSIE") != -1) {
    bindName = 'propertychange';
  }
  $("#username").bind(bindName, function () {
    var username = $("#username").val();
    var saveusername = $.cookie("username_" + username);
    var savermbUser = $.cookie("rmbUser_" + username);
    var savepassword = $.cookie("password_" + username);
    var saveplatformId = $.cookie("platformId_" + username);
    if (!checkInput(username)) {
      return;
    }
    if (saveusername != null) {
      if (savermbUser) {
        $("#password").val($.cookie("password_" + username));
        $("#platformId").val($.cookie("platformId_" + username));
        $("#check").addClass('checked');
        $("#check").removeClass('noo');
      };
    } else {
      $("#password").val("");
      $("#check").addClass('noo');
      $("#check").removeClass('checked');
    }
  });

  // handle
  // login 
  $('#login').click(function () {
    submitform();
  });

  // remember pwd
  $('#check').click(function () {
    $('#check').toggleClass('checked');
  });

  // img code change
  $('#valicodeimg').click(function () {
    $('#code-img-tip').removeClass();
    changeimg();
  });

  // inputs handle
  var flagObj = {
    username: false,
    password: false,
    valicode: false
  };

  $('#username,#password,#valicode').each(function () {
    $(this).parent().append('<div class="error"><span class="icon">!</span><span class="mes"></span></div>');
    $(this).focus(function () {
      $('#sum-tip').hide();
      $(this).removeClass('input-error').parent().find('.error').hide();
    });
    $(this).blur(function () {
      var id = $(this).attr('id');
      var requireStr = $(this).attr('require');
      var that=$(this);
      if (that.val() === '') {
        that.addClass('input-error').parent().find('.error').show().find('.mes').text(requireStr);
        flagObj[id] = false;
      } else {
        if (id == 'valicode') {
          // check img code
          CloudWinner.post({
            url: '/cwadmin/valicodes/check',
            data: {
              valicode: $("#valicode").val()
            },
            noLoading:true,
            showMsg: false,
            success: function (result) {
              if(result){
                that.removeClass('input-error').parent().find('.error').hide();
                $('#code-img-tip').removeClass().addClass('right');
                flagObj[id] = true;
              }else{
                that.addClass('input-error').parent().find('.error').show().find('.mes').text('验证码错误');
                $('#code-img-tip').removeClass().addClass('wrong');
                flagObj[id] = false;
              }
            },
            error: function (res) {

            }
          });
        }
        that.removeClass('input-error').parent().find('.error').hide();
        flagObj[id] = true;
      }
    });
  });


  // fn
  function checkInput(input) {
    var b = /^[0-9a-zA-Z]*$/g;
    if (b.test(input)) {
      return true;
    } else {
      $("#username").val(input.substring(0, input.length - 1));
      return false;
    }
  }

  // is all inputs pass ?
  function allOk(obj) {
    var flag = true;
    for (var i in obj) {
      flag = flag && obj[i];
    }
    return flag;
  }

  // form submit
  function submitform() {
    $('#username,#password,#valicode').blur();
    if (!allOk(flagObj)) {
      return false;
    }

    if ($("#username").val() == "") {
      $("#username").focus();
      return false;
    }
    if ($("#password").val() == "") {
      $("#password").focus();
      return false;
    }
    if ($("#valicode").val() == "") {
      $("#valicode").focus();
      return false;
    }
    var platformId = $("#platformId").val() == "" ? "0" : $("#platformId").val();
    CloudWinner.post({
      url: '/cwadmin/session',
      data: {
        username: $.md5($("#username").val() + "Cw2015"),
        password: $.md5($("#password").val()),
        value: encryptByDES($("#password").val(), "8NONwyJtHesysWpM"),
        platformId: platformId,
        loginType: "0",
        // valicode: "",
        // isvalicode: false
        valicode: $("#valicode").val(),
        isvalicode: true,
        mobilecode: $("#mobilecode").val()
      },
      noLoading:true,
      showMsg: false,
      success: function (data) {
        var mobile = data.mobile;
        if (data.sessionId) {
          layer.msg('登录成功,请稍后...', {
            icon: 1,
            time: 100,
            shade: [0.3, '#fff']
            //0.1透明度的白色背景
          }, function () {
            Save();
            // window.location.href = "index.html";
            window.location.href = "/cwweb/admin/index.html";
          });
        } else if (data.code == "1") {

          // layer.msg('用户或密码不正确！', {
          //   icon: 2,
          //   time: 1000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {
          //   $("#username").focus();
          // });

          $('#sum-tip').show().find('.mes').text('用户或密码不正确！');
          // $("#username").focus();
        } else if (data.code == "2") {
          var str = '密码不正确！您今天还有' + parseInt(data.status) + '次登陆机会';
          if (parseInt(data.status) == 0) {
            str = '密码今日输错达到5次！您的账号已经被锁定请联系管理员！';
          }

          // layer.msg(str, {
          //   icon: 2,
          //   time: 3000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {
          //   $("#password").focus();
          // });
          $('#sum-tip').show().find('.mes').text(str);

        } else if (data.code == "3") {
          // layer.msg('对不起,您尚未开通认证权限,请联系管理员！', {
          //   icon: 2,
          //   time: 2000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {

          // });
          $('#sum-tip').show().find('.mes').text('对不起,您尚未开通认证权限,请联系管理员！');

        } else if (data.code == "4") {
          // layer.msg('对不起,您的账号未允许登录！', {
          //   icon: 2,
          //   time: 2000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {

          // });
          $('#sum-tip').show().find('.mes').text('对不起,您的账号未允许登录！');

        } else if (data.code == "5") {
          // layer.msg('对不起,您的账号已过期！', {
          //   icon: 2,
          //   time: 2000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {

          // });

          $('#sum-tip').show().find('.mes').text('对不起,您的账号已过期！');

        } else if (data.code == "7") {
          // layer.msg('验证码不正确！', {
          //   icon: 2,
          //   time: 2000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {

          // });          

        } else if (data.code == "8") {
          // layer.msg('错误超过5次', {
          //   icon: 2,
          //   time: 2000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {

          // });
          $('#sum-tip').show().find('.mes').text('错误超过5次！');

        } else if (data.code == "9") {
          // layer.msg('必填项为空', {
          //   icon: 2,
          //   time: 2000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {

          // });
          

        } else if (data.code == "10") {
          $("#mobile").val(mobile);
          checkmobilecode(mobile);
        } else if (data.code == "11") {
          // layer.msg('对不起,你输入的手机验证码不正确！', {
          //   icon: 2,
          //   time: 2000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {
          //   $("#mobilecode").val("");
          //   checkmobilecode($("#mobile").val());
          // });

          $('#sum-tip').show().find('.mes').text('对不起,你输入的手机验证码不正确！');
          $("#mobilecode").val("");
          checkmobilecode($("#mobile").val());

        } else if (data.code == "12") {
          // layer.msg('您的账号已经被锁定，请联系管理员！', {
          //   icon: 2,
          //   time: 2000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {

          // });
          $('#sum-tip').show().find('.mes').text('您的账号已经被锁定，请联系管理员！');

        } else {
          // layer.msg('登录失败！', {
          //   icon: 2,
          //   time: 2000,
          //   shade: [0.3, '#fff']
          //   //0.1透明度的白色背景
          // }, function () {

          // });

          $('#sum-tip').show().find('.mes').text('登录失败！');

        }

      }
    });
    return false;
  }

  // pws encode
  function encryptByDES(message, key) {
    var key = CryptoJS.enc.Utf8.parse(key);
    var plaintText = message;
    var encryptedData = CryptoJS.AES.encrypt(plaintText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encryptedData;
  }

  //记住用户名密码
  function Save() {
    var str_username = $("#username").val();
    var str_password = $("#password").val();
    var str_platformId = $("#platformId").val();
    $.cookie("loginpage", "/cwweb/admin/login.html", {
      expires: 7
    });
    if ($('#check').hasClass('checked')) {

      $.cookie("rmbUser", "true", {
        expires: 7
      }); //存储一个带7天期限的cookie
      $.cookie("username", str_username, {
        expires: 7
      });
      $.cookie("password", str_password, {
        expires: 7
      });
      $.cookie("platformId", str_platformId, {
        expires: 7
      });
      $.cookie("rmbUser_" + str_username, "true", {
        expires: 7
      }); //存储一个带7天期限的cookie
      $.cookie("username_" + str_username, str_username, {
        expires: 7
      });
      $.cookie("password_" + str_username, str_password, {
        expires: 7
      });
      $.cookie("platformId_" + str_username, str_platformId, {
        expires: 7
      });
    } else {
      $.cookie("rmbUser", "false", {
        expire: -1
      });
      $.cookie("username", "", {
        expires: -1
      });
      $.cookie("password", "", {
        expires: -1
      });
      $.cookie("platformId", "", {
        expires: -1
      });
      $.cookie("rmbUser_" + str_username, "false", {
        expire: -1
      });
      $.cookie("username_" + str_username, "", {
        expires: -1
      });
      $.cookie("password_" + str_username, "", {
        expires: -1
      });
      $.cookie("platformId_" + str_username, "", {
        expires: -1
      });
    }
  };

  // get img  code
  function changeimg() {
    $("#valicodeimg").attr("src", "/cwadmin/valicodes?t=" + Math.random());
  }

  // phone ms
  function checkmobilecode(mobile) {
    var content = ' <div class=\"wrap-phone\">' +
      '<div class="content-phone">' +
      '<div class="tit">系统已向<span id="phone">' + mobile + '</span>用户发送短信，请及时查收输入</div>' +
      '<ul class="inputs">' +
      '<li><input id="mobilecode1" maxlength="1" oninput = "value=value.replace(/[^\\d]/g,\'\')" ></li>' +
      '<li><input id="mobilecode2" maxlength="1" oninput = "value=value.replace(/[^\\d]/g,\'\')" ></li>' +
      '<li><input id="mobilecode3" maxlength="1" oninput = "value=value.replace(/[^\\d]/g,\'\')" ></li>' +
      '<li><input id="mobilecode4" maxlength="1" oninput = "value=value.replace(/[^\\d]/g,\'\')" ></li>' +
      '</ul>' +
      '<div class="btnWrap">' +
      '<div id="sure" class="btn sure">确认</div>' +
      '<div id="cancel" class="btn cancel">取消</div>' +
      '</div>' +
      '</div>' +
      '</div>';
    var tipsStr = '<div class="wrapCon">' + content + '</div>';
    var lm = layer.open({
      type: 1,
      skin: 'layui-layer-molv',
      title: "系统提示",
      area: ['510px', '300px'],
      content: tipsStr,
      success: function (layero, index) {
        $("#cancel").on("click", function () {
          top.layer.close(lm);
        })
        $("#sure").on("click", function () {
          sureBtn();
        })

        // sure fn
        function sureBtn() {
          var mobilecode1 = $("#mobilecode1").val();
          var mobilecode2 = $("#mobilecode2").val();
          var mobilecode3 = $("#mobilecode3").val();
          var mobilecode4 = $("#mobilecode4").val();
          var mobilecode = mobilecode1 + mobilecode2 + mobilecode3 + mobilecode4;
          if (mobilecode1 != "" && mobilecode2 != "" && mobilecode3 != "" && mobilecode4 != "") {
            $("#mobilecode").val(mobilecode);
            top.layer.close(lm);
            submitform();
          } else {
            if (mobilecode1 == "") {
              $("#mobilecode1").focus();
            } else if (mobilecode2 == "") {
              $("#mobilecode2").focus();
            } else if (mobilecode3 == "") {
              $("#mobilecode3").focus();
            } else if (mobilecode4 == "") {
              $("#mobilecode4").focus();
            }
          }
        }

        // init first input focus
        $('#username').blur();
        $('.inputs input').eq(0).val('').focus();
        setTimeout(function () {
          $('#username').blur();
          $('.inputs input').eq(0).val('').focus();
        }, 1000);

        // handle
        $('.inputs input').each(function () {
          $(this).keyup(function (event) {
            var that = $(this);
            if (!/[0-9]/ig.test(that.val())) {
              return;
            }
            var index = that.parent().index();
            that.blur();
            that.parents('ul').find('input').eq(index + 1).focus();
          });
        });

        $(document).keyup(function (event) {
          if (event.keyCode == 13) {
            sureBtn();
          }
        });

      }
    });
  }

});