// Make an ANSI Color converter.
var ansiConv = new AnsiConverter();
var tcpClient;

function getListTemplate(ip, port){
    if(isEmptyStr(ip) || isEmptyStr(port)){
        console.error("error ip and port", ip,port);
        return "";
    }
    var current_ip = $("#dc-ip").val();
    var current_port = $("#dc-port").val();
    var isActive = current_ip == ip && current_port == port;
    var liClass = isActive ? " class=\"active\"" : "";
    var dataIp = " data-ip='" + ip + "' ";
    var dataPort = " data-port='" + port + "' ";
    var template = '<li ' + liClass + '>'
        + '<a href="#" ' + dataIp +  dataPort + ' class="dc-click-item" ' + ' >'
        + '<span class="icon fa fa-file-text-o"></span>'
                  + '<span class="title">' + ip + ':' + port + '</span>'
                  + '</a>'
                  + '</li>';
    return template;
}

function createList() {
    chrome.storage.sync.get(['dc-connect-list'], function(ipList) {
        ipList = ipList['dc-connect-list'];
        $("#dc-connect-list").html('');
        for ( var i = 0; i <ipList.length; i++){
            var ip = ipList[i].ip;
            var port = ipList[i].port;
            var item = getListTemplate(ip, port);
            $("#dc-connect-list").append(item);
        }
        $(".dc-click-item").on("click", function () {
            $("li.active").removeClass("active");
            $(this).parent().addClass("active");
            var ip = $(this).attr("data-ip");
            var port = $(this).attr("data-port");
            setCurrent(ip, port);
        });
    });

}
function setCurrent(current_ip, current_port){
    $("#dc-ip").val(current_ip);
    $("#dc-port").val(current_port);
    $("#current-ip-text").html(current_ip + ":" + current_port);
}
$(document).ready(function(){
    createList();

    $("#dc-invoke").click(function () {
        if(!hasConnect()){
            log("has not connected");
            return
        }
        invoke();

    });
    $("#dc-clear-console").click(function () {
        $("#dc-console").text("");
    });
    $("#dc-do-connect").click(function () {
        if(hasConnect()){
            log("has already connected")
        }else{
            var host = $("#dc-ip").val();
            var port = $("#dc-port").val();
            if(isEmptyStr(host) || isEmptyStr(port)){
                log("host and port can not be empty");
                return
            }
            log("connect to" + host + ":" + port);
            tcpClient = new TcpClient(host, parseInt(port), function(msg){
                log(msg)
            });
            tcpClient.logger = function (msg) {
                log(msg);
            }
            connect();;
        }
    });

    $("#ls").click(function () {
        if(!hasConnect()){
            log("has not connected");
            return
        }
        ls()
    });

    $("#dc-add-server").click(function () {
        $("#dc-add-server-form").show();
    });
    $(".btn-add-server").on('click', function () {
        $("#dc-add-server-form").hide();
    });
    $("#dc-do-add").click(function () {
        var dcAddIp = $("#dc-add-ip").val();
        var dcAddPort = $("#dc-add-port").val();
        if(isEmptyStr(dcAddIp) || isEmptyStr(dcAddPort)){
            log("ip 和 port 都是必填项");
            return;
        }
        setCurrent(dcAddIp, dcAddPort);
        var newItem = {ip: dcAddIp, port : dcAddPort};

        chrome.storage.sync.get(['dc-connect-list'], function(result) {
            var ipList = result['dc-connect-list'];
            if(ipList && ipList instanceof Array){
                ipList.push(newItem);
            }else{
                ipList = [];
                ipList.push(newItem);
            }
            chrome.storage.sync.set({'dc-connect-list': ipList}, function() {
                log(ipList +  " are store ");
                createList();
            });


        });

    });
    $("#dc-service-select-list").select2({
        debug:true,
        placeholder:"请选择要调用的service"
    });

    $("#dc-service-select-list").on("select2:select", function(e) {
        var toInvokeService = $("#dc-service-select-list").val();
        log("select " + toInvokeService)
        loadMethods(toInvokeService);
    });
    $("#dc-method-select-list").select2({
        placeholder:"请选择要调用的method",
        debug:true
    });
    $("#dc-method-select-list").on("select2:select", function(e) {
        var toInvokeMethod = $("#dc-method-select-list").val();
        parseMethod(toInvokeMethod);
    });
});
function hasConnect() {
   return tcpClient && tcpClient !== null && tcpClient.isConnected !== null && tcpClient.isConnected;
}
function onResponse(data){
    // Run response through ANSI colorizer.
   var formattedData = ansiConv.formatAnsi(data);
               // Split into multiple lines.
   //var lines = formattedData.split('\n');
               // Render response in the terminal.
   //var output = lines.join('<br/>');
    log(formattedData);
}
function parseMethod(str){
    var arr = str.split(" ");
    var retType = arr[0];
    var methodSign = arr[1];
    var index = methodSign.indexOf("(");
    var methodName = methodSign.substring(0, index);
    var paramTypeList = methodSign.substring(index + 1, methodSign.length - 2);
    var paramArr = paramTypeList.split(",");
    var params = [];
    for(var i=0; i<paramArr.length; i++){
        if(paramArr[i].indexOf("java.lang") === 0){
              if(paramArr[i].indexOf("String") > 0){
                  params.push('"strParam"');
              }else{
                  params.push(1);
              }
        }else{
            var json = "{'class':'"+ paramArr[i] + "'}"
            params.push(json);
        }
    }
    $("#dc-param-list").val(params.join(","));
    return methodName;
}
function getRealMethodName(str){
    var arr = str.split(" ");
    var methodSign = arr[1];
    var index = methodSign.indexOf("(");
    var methodName = methodSign.substring(0, index);
    return methodName;
}
function invoke(){
    var toInvokeService = $("#dc-service-select-list").val();
    var toInvokerMethod = $("#dc-method-select-list").val();
    var param = $("#dc-param-list").val();
    var command = "invoke  --no-prompt  " +  toInvokeService + "."  + getRealMethodName(toInvokerMethod) + "(" +  param + ")";
    log("command :" + command);
    tcpClient.sendMessage(command, function (res) {
        var obj = JSON.stringify(res);
        log(obj);
    })
}
function loadServices() {
    var command = " ls --no-prompt";
    tcpClient.addResponseListener(function(data) {
        log("ls 返回结果: " + data);
        if(data){
          var serviceList =  data.split("\n");
          $("#dc-service-select-list").select2({
              data:serviceList,
              placeholder:"请选择要调用的service",
              change: function () {
                 var toInvokeService = $("#dc-service-select-list").val();
                 log("select " + toInvokeService)
                 loadMethods(toInvokeService);
              }
          });
        }

    });
    tcpClient.sendMessage(command, function (res) {
        var obj = JSON.stringify(res);
        log("ls 发送结果: " + obj);
    });

}
function loadMethods(service) {
    var command = " ls --no-prompt -l " + service;
    tcpClient.addResponseListener(function(data) {
        log("loadMethods 返回结果: " + data);
        if(data){
            var methodList =  data.split("\n");
            $("#dc-method-select-list").empty();
            $("#dc-method-select-list").select2({
                data:methodList,
                placeholder:"请选择要调用的method"
            });
        }
        tcpClient.addResponseListener(onResponse);

    });
    tcpClient.sendMessage(command, function (res) {
        var obj = JSON.stringify(res);
        log("loadMethods 发送结果: " + obj);
    });
}

function connect() {
    tcpClient.connect(function() {
        // 成功连接到服务器
        log("connected to server.");
        $("#dc-do-connect").hide();
        $("#dc-connect-status").html("已连接");
        $("#dc-connect-status").removeClass("fa-remove").addClass("fa-check");
        log("加载服务列表");
        loadServices();
    }, function () {
        // 与服务器断开连接
        log("disConnected to server.");
        $("#dc-do-connect").show();
        $("#dc-connect-status").html("未连接");
        $("#dc-connect-status").removeClass("fa-check").addClass("fa-remove");
    });
}

function log(str) {
    $("#dc-console").append(str +  "\n");
}

function isEmptyStr(value) {
    if (!value || typeof(value) ==="undefined" || value == null || value === "")
    {
        return true;
    }
    else{
        return false;
    }
}
