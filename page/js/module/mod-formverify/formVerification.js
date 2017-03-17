//农泰表单验证插件 by zhengls
/*
 *  reg能添加新的正则规则
 *  submit方法是表单验证通过后的回调
 *  ready是表单加载完成后的回调
 *
 *  $("#abc").nt_FormVER({
 *      reg:{
 *          "mobile": [/^1[3|4|5|7|8]\d{9}$/,"请填写正确的手机号码！"],
 *          "personId": [/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,"请填写正确的身份证号码！"]
 *      },
 *      submit: function(){
 *          alert("回调，可做一些事情！");
 *          return false; ---------> 加上return false；页面不会刷新~
 *      },
 *      ready: function(){
 *          alert("表单验证加载完成了，你可以做点什么！")
 *      }
 *  });
 */
(function($){
    //正则
    var myReg = {
        "money": [/^([1-9]\d*|0)(\.\d{1,5})?$/,"请填写正确的金额的格式"],
        "interest": [/^(\-?([1-9]\d?|0)(\.\d{1,2})?)$|^(\-?10{2})$/,"请填写正确的利息的格式"],
        "integer": [/^[1-9]\d*$|^0$/,"请填写整数"],
        "chinese": [/^[\u4e00-\u9fa5a]{0,50}$/,"请填写中文"],
        "zuoji": [/^\d{3,4}\-\d{7,8}|1\d{10}$/,"请填写正确的座机号"],
        "year": [/^20(0[0-9]{1}|1[0-6]{1})$/,"请填写正确的年份格式"],
        "month" : [/^([1-9]{1}|1[0-2]{1})$/,"请填写正确的月份格式"],
        "mobile": [/^1[3|4|5|7|8]\d{9}$/,"请填写正确的手机号码"],
        "mobOrTel": [/(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/,"请填写正确的手机号码"],
        "personId": [/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,"请填写正确的身份证号码！"],
        "require": [/\S/,"不能为空！"],
        "businessLicense": [/^[a-zA-Z0-9]{15,18}$/,"营业执照格式不正确"],
        "organizationCode": [/[a-zA-Z0-9]{8}-[a-zA-Z0-9]{1}/,"组织机构代码证格式不正确"]
    };

    var myRule = {
        number : [function(value){
            if(isNaN(value)){
                return false;
            }else{
                return true;
            }
        },"请填写数字！"],
        stock : [function(value){
            if(value>0 && value <=100){
                return true
            }else{
                return false;
            }
        },"股份不能大于100！"],
        positiveNum: [function(value){
            if(value>=0 && value < 100000000000 && value.indexOf('-') < 0){
                return true
            }else{
                return false;
            }
        },'必须填入正整数！'],
        nonull: [function(value){
            if( value != "" && value != null && value != '-' ){
                return true;
            }else{
                return false;
            }
        },'不能为空'],
        earnest:[function(value){
            if(!isNaN(value) && value>=0 && value<=100) {
                return true;
            }else{
                return false;
            }
        },'保证金应为大于0小于100的数字'],
        LoanRate:[function(value){
            if(!isNaN(value) && value>=0 && value<=20) {
                return true;
            }else{
                return false;
            }
        },'借款利率应为大于0小于20的数字'],
        TermOfLoad1:[function(value){
            if(!isNaN(value) && value>=0 && value<25) {
                return true;
            }else{
                return false;
            }
        },'借款期限为0-24正整数'],
        TermOfLoad2:[function(value){
            if(!isNaN(value) && value>=1 && value<25) {
                return true;
            }else{
                return false;
            }
        },'借款期限为1-24正整数'],
        Area: [function(value){
            if(isNaN(value) == false && value>=0){
                return true;
            }else{
                return false;
            }
        },'面积的值有误'],
        ApplyAmount: [function(value){
            if(value >= 0 && value < 10000){
                return true;
            }else{
                return false;
            }
        },'借款/担保额度有误'],
        ApplyAmount1: [function(value){
            if(value >= 0.01 && value < 10000){
                return true;
            }else{
                return false;
            }
        },'借款/担保额度有误'],
        TimeMonth: [function(value){
            if(value >= 0 && value < 1000){
                return true;
            }else{
                return false;
            }
        },'年月格式错误'],
        RateLimit: [function(value){
            if(value >= 0 && value <= 10000){
                return true;
            }else{
                return false;
            }
        },'利率输入错误'],
        DeadLineLimit: [function(value){
            if(value >= 0 && value <= 12){
                return true;
            }else{
                return false;
            }
        },'担保期限输入错误']
    };

    $.fn.nt_FormVER = function(parameter){
        var $checkForm = $(this);

        //先把提交按钮给锁住
        $checkForm.find(".nt-form-submit").attr("disabled","disabled");
        $checkForm.attr("autocomplete","off");


        //提供一个外部可以导入正则表的接口
        if(parameter && parameter.hasOwnProperty("reg")){
            var globalReg = $.extend({},myReg,parameter.reg);
        }else{
            var globalReg = $.extend({},myReg);
        }
        if(parameter && parameter.hasOwnProperty("rule")){
            var globalRule = $.extend({},myRule,parameter.rule);
        }else{
            var globalRule = $.extend({},myRule);
        }



        //去除两端空格
        function trim(str){ //删除左右两端的空格
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }

        //展示错误提示语，$obj是表单元素，txt是提示语
        function showtip($obj,txt){
            $obj.parent().find(".ntverifybox").remove();
            var $tips = $('<div class="ntverifybox"><span class="errmsgPrompts"></div>');
            var width = $obj.parent().find(".input-group-addon").width()+20;
            $tips.find(".errmsgPrompts").html(txt);
            $obj.after($tips);
        }

        //把serializeArray获取的参数转化为json格式
        function toJson(arr){
            var json = {};
            if(arr.length > 0){
                for(var i = 0,len = arr.length;i < len;i++){
                    json[arr[i].name] = arr[i].value;
                }
            }
            return json;
        };

        //选择表单中需要验证的元素
        var $checkObj = $checkForm.find('[data-rule]');

        var time={};

        //改变的时候进行验证
        $checkObj.each(function(index,elem){
            var limit = $(elem).data('rule').split(" ");

            //绑定input控件的检查时间，keyup间隔大于600毫秒认为是修改完毕。
            if($(elem).is("input") || $(elem).is("textarea")){
                $(elem).on("keyup",function(){
                    var $this = $(this);
                    var myValue = trim($this.val());
                    var result = true;

                    //$this.val(myValue);//去掉值两端的空格
                    $this.attr('data-modefy','true');

                    //如果计时器存在，清空他
                    if(time[index]){
                        clearTimeout(time[index]);
                    }


                    if(limit.indexOf('require') < 0 && $this.val()==''){
                        $this.addClass("nt-ntFormVER-correct").removeClass("nt-ntFormVER-error");
                        $this.parent().addClass("nt-ntFormVER-correct").removeClass("nt-ntFormVER-error");
                        $this.parent().find(".ntverifybox").remove();
                        return;
                    }

                    time[index] = setTimeout(function(){

                        for(var i= 0,len=limit.length;i<len;i++){
                            //如果有正则表有这个属性才进行验证！
                            if(globalReg && globalReg.hasOwnProperty(limit[i])){
                                if(globalReg[limit[i]][0].test(myValue)){
                                    $this.parent().addClass("nt-"+limit[i]+"-correct").removeClass("nt-"+limit[i]+"-error");
                                }else{
                                    $this.parent().removeClass("nt-"+limit[i]+"-correct").addClass("nt-"+limit[i]+"-error");
                                    result = false;

                                    if(!(parameter && parameter.hasOwnProperty("showtip") && parameter.showtip === false)){
                                        showtip($this,globalReg[limit[i]][1]);
                                    }

                                }
                            }else if(globalRule && globalRule.hasOwnProperty(limit[i])){
                                if(globalRule[limit[i]][0](myValue)){
                                    $this.parent().addClass("nt-"+limit[i]+"-correct").removeClass("nt-"+limit[i]+"-error");
                                }else{
                                    $this.parent().removeClass("nt-"+limit[i]+"-correct").addClass("nt-"+limit[i]+"-error");
                                    result = false;

                                    if(!(parameter && parameter.hasOwnProperty("showtip") && parameter.showtip === false)){
                                        showtip($this,globalRule[limit[i]][1]);
                                    }

                                }
                            }else{
                                console.log("正则表和规则表不包含"+limit[i]+"的规则，请添加！");
                            }
                        }

                        //全部要求中，只要有一个不满足，就给加上错误的标志，方便表单提交的时候做判断
                        if(result){
                            $this.addClass("nt-ntFormVER-correct").removeClass("nt-ntFormVER-error");
                            $this.parent().addClass("nt-ntFormVER-correct").removeClass("nt-ntFormVER-error");
                            $this.parent().find(".ntverifybox").remove();
                        }else{
                            $this.addClass("nt-ntFormVER-error").removeClass("nt-ntFormVER-correct");
                            $this.parent().addClass("nt-ntFormVER-error").removeClass("nt-ntFormVER-correct");
                        }

                        if($checkForm.nt_formCheck(parameter)){
                            //验证正确后，把表单解开。
                            $checkForm.find(".nt-form-submit").removeAttr("disabled");
                        }else{
                            $checkForm.find(".nt-form-submit").attr("disabled","disabled");
                        }

                    },600);
                });
            }

            //绑定选择框的检查事件
            if($(elem).is("select")){
                $(elem).change(function(){
                    var $this = $(this);
                    var value = $this.val();
                    var firstvalue = $this.find("option").eq(0).val();
                    for(var i= 0,len=limit.length;i<len;i++){
                        if(limit[i] != "require") continue;

                        if(value != firstvalue){
                            $this.addClass("nt-ntFormVER-correct").removeClass("nt-ntFormVER-error");
                            $this.parent().addClass("nt-"+limit[i]+"-correct").removeClass("nt-"+limit[i]+"-error");
                        }else{
                            $this.addClass("nt-ntFormVER-error").removeClass("nt-ntFormVER-correct");
                            $this.parent().removeClass("nt-"+limit[i]+"-correct").addClass("nt-"+limit[i]+"-error");
                        }
                    }
                    if($checkForm.nt_formCheck(parameter)){
                        //验证正确后，把表单解开。
                        $checkForm.find(".nt-form-submit").removeAttr("disabled");
                    }else{
                        $checkForm.find(".nt-form-submit").attr("disabled","disabled");
                    }
                });
            }
        });


        //表单提交时执行
        $checkForm.off("submit");
        $checkForm.on("submit",function(){
            var formdata,result;
            //如果验证不通过就不提交
            if(!$checkForm.nt_formCheck(parameter)){
                return false;
            }

            //验证通过后，看是否有传回调函数，执行回调函数
            if(parameter){
                formdata = $checkForm.serializeArray();
                if(parameter.hasOwnProperty("submit")){
                    result = parameter.submit(toJson(formdata));
                }
            }

            if(result===false){
                return false;
            }
        });

        $checkObj.each(function(){
            var limit = $(this).data('rule').split(" ");
            for(var i= 0,len=limit.length;i<len;i++){
                if(globalReg && !globalReg.hasOwnProperty(limit[i])){
                    if(globalRule && !globalRule.hasOwnProperty(limit[i])){
                        alert("正则表不包含"+limit[i]+"的规则，请添加！");
                    }
                }
            }
        });

        //验证加载完成的时候调用的事件
        if(parameter){
            parameter.ready && parameter.ready();
        }
        $checkForm.nt_formCheck(parameter);
        return $checkForm;

    };

    //表单验证
    $.fn.nt_formCheck = function(parameter){
        var $checkForm = $(this);

        //提供一个外部可以导入正则表的接口
        if(parameter && parameter.hasOwnProperty("reg")){
            var globalReg = $.extend({},myReg,parameter.reg);
        }else{
            var globalReg = $.extend({},myReg);
        }
        if(parameter && parameter.hasOwnProperty("rule")){
            var globalRule = $.extend({},myRule,parameter.rule);
        }else{
            var globalRule = $.extend({},myRule);
        }


        //
        //检验参数checkMode是否存在，‘strict’为严格模式，严格模式不会输出notmodefy。认为有require但是没有修改的都为错误。
        if(!parameter){
            parameter = {};
            parameter.checkMode = 'loose';
        }else{
            if(!parameter.hasOwnProperty('checkMode')){
                parameter.checkMode = 'loose';
            }
        }

        //去除两端空格
        function trim(str){ //删除左右两端的空格
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }

        //展示错误提示语，$obj是表单元素，txt是提示语
        function showtip($obj,txt){
            $obj.parent().find(".ntverifybox").remove();
            var $tips = $('<div class="ntverifybox"><span class="errmsgPrompts"></div>');
            var width = $obj.parent().find(".input-group-addon").width()+20;
            $tips.find(".errmsgPrompts").html(txt);
            $obj.after($tips);
        }

        //选择表单中需要验证的元素
        var $checkObj = $checkForm.find('[data-rule]');

        //
        //逐个data-rule 去检查；
        $checkObj.each(function(){
            var $this = $(this),
                limit = $this.data('rule').split(" "),
                checkObjVal = trim($this.val());
            var result = true;
            var isModefy = $this.attr('data-modefy');


            if(limit.indexOf('require') < 0 && checkObjVal == ""){
                $this.addClass("nt-ntFormVER-correct").removeClass("nt-ntFormVER-error");
                $this.parent().addClass("nt-ntFormVER-correct").removeClass("nt-ntFormVER-error");
                $this.parent().find(".ntverifybox").remove();
            }else if(limit.indexOf('require') >= 0 || (limit.indexOf('require') < 0 && checkObjVal != "")){

                if(limit.indexOf('require') >= 0 && checkObjVal == "" && parameter.checkMode != 'strict'){
                    if(isModefy == undefined && !$this.hasClass("nt-ntFormVER-error")){
                        $this.addClass("nt-ntFormVER-notmodefy");
                        $this.parent().addClass("nt-ntFormVER-notmodefy");
                        $this.parent().find(".ntverifybox").remove();
                    }
                }else{
                    $this.removeClass("nt-ntFormVER-notmodefy");
                    $this.parent().removeClass("nt-ntFormVER-notmodefy");
                }

                //
                // 把data-rule里的限制条件一个个的检查，检验不通过的，把result改为false；如果配置里面showtip等于false，则不在页面显示提示
                for(var i= 0,len=limit.length;i<len;i++){

                    if(globalReg && globalReg.hasOwnProperty(limit[i])){//判断正则对象中是否有该限制条件
                        if(globalReg[limit[i]][0].test(checkObjVal)){
                            $this.parent().addClass("nt-"+limit[i]+"-correct").removeClass("nt-"+limit[i]+"-error");
                        }else{
                            $this.parent().removeClass("nt-"+limit[i]+"-correct").addClass("nt-"+limit[i]+"-error");
                            result = false;

                            if(!(parameter && parameter.hasOwnProperty("showtip") && parameter.showtip === false)){
                                showtip($this,globalReg[limit[i]][1]);
                            }

                        }
                    }else if(globalRule && globalRule.hasOwnProperty(limit[i])){//判断规则对象中是否有该限制条件
                        if(globalRule[limit[i]][0](checkObjVal)){
                            $this.parent().addClass("nt-"+limit[i]+"-correct").removeClass("nt-"+limit[i]+"-error");
                        }else{
                            $this.parent().removeClass("nt-"+limit[i]+"-correct").addClass("nt-"+limit[i]+"-error");
                            result = false;

                            if(!(parameter && parameter.hasOwnProperty("showtip") && parameter.showtip === false)){
                                showtip($this,globalRule[limit[i]][1]);
                            }

                        }
                    }else{
                        console.log("正则表和规则表不包含"+limit[i]+"的规则，请添加！");
                    }
                }

                //全部要求中，只要有一个不满足，就给加上错误的标志，方便表单提交的时候做判断
                if(result){
                    $this.addClass("nt-ntFormVER-correct").removeClass("nt-ntFormVER-error");
                    $this.parent().addClass("nt-ntFormVER-correct").removeClass("nt-ntFormVER-error");
                    $this.parent().find(".ntverifybox").remove();
                }else{
                    $this.addClass("nt-ntFormVER-error").removeClass("nt-ntFormVER-correct");
                    $this.parent().addClass("nt-ntFormVER-error").removeClass("nt-ntFormVER-correct");
                }
            }

        });

        var totalResult = 0;

        $checkObj.each(function(){
            if($(this).hasClass('nt-ntFormVER-error')){
                totalResult++;
            }
        });

        return totalResult>0?false:true;
    }

    //表单的重置
    $.fn.nt_formReset = function(){
        var $this = $(this);
        //1、把表单清空
        $this[0].reset();
        //2、把提示框清除
        $this.find(".ntverifybox").remove();
        //3、把正确和错误的标记移除
        $this.find(".nt-ntFormVER-correct").removeClass("nt-ntFormVER-correct");
        $this.find(".nt-ntFormVER-error").removeClass("nt-ntFormVER-error");
        var $checkbox = $this.find('[data-rule]');
        var ruleArr = [];
        $checkbox.each(function(index){
            var rule = $(this).data("rule").split(" ");
            ruleArr = mergeArray(ruleArr,rule);
            this.removeAttribute('data-modefy');
        });

        for(var i= 0,len=ruleArr.length;i<len;i++){
            $this.find(".nt-"+ruleArr[i]+"-correct").removeClass("nt-"+ruleArr[i]+"-correct");
            $this.find(".nt-"+ruleArr[i]+"-error").removeClass("nt-"+ruleArr[i]+"-error");
        }

        //合并数组并删除重复项
        function mergeArray(arr1, arr2){
            for (var i = 0 ; i < arr1.length ; i ++ ){
                for(var j = 0 ; j < arr2.length ; j ++ ){
                    if (arr1[i] === arr2[j]){
                        arr1.splice(i,1); //利用splice函数删除元素，从第i个位置，截取长度为1的元素
                    }
                }
            }
            //alert(arr1.length)
            for(var i = 0; i <arr2.length; i++){
                arr1.push(arr2[i]);
            }
            return arr1;
        }

        return $this;
    }
})(jQuery);