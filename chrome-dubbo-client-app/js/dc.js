// Make an ANSI Color converter.
var ansiConv = new AnsiConverter();
var tcpClient;
var ipList = [
    {ip:'localhost',port:20881},
    {ip:'10.204.8.56',port:20881},
    {ip:'10.204.8.57',port:20881},
]

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
    $("#dc-connect-list").html('');
    for ( var i = 0; i <ipList.length; i++){
        var ip = ipList[i].ip;
        var port = ipList[i].port;
        var item = getListTemplate(ip, port);
        $("#dc-connect-list").append(item);
    }
}
function setCurrent(current_ip, current_port){
    $("#dc-ip").val(current_ip);
    $("#dc-port").val(current_port);
    $("#current-ip-text").html(current_ip + ":" + current_port);
}
$(document).ready(function(){
    createList();
    $(".dc-click-item").on("click", function () {
        $("li.active").removeClass("active");
        $(this).parent().addClass("active");
         var ip = $(this).attr("data-ip");
         var port = $(this).attr("data-port");
         setCurrent(ip, port);
    });
    $("#executor").click(function () {
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
            alert("已连接!");
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
            alert("ip 和 port 都是必填项");
        }
        setCurrent(dcAddIp, dcAddPort);
        var newItem = {ip: dcAddIp, port : dcAddPort};
        ipList.push(newItem);
        createList();
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
function invoke(){
    var service = $("#service").val();
    var method = $("#method").val();
    var param = $("#params").val();
    var command = service + " --no-prompt " + param;
    tcpClient.sendMessage(command, function (res) {
        var obj = JSON.stringify(res);
        log(obj);
    })
}
function ls() {
    var command = " ls -l --no-prompt";
    tcpClient.addResponseListener(function(data) {
        log("ls 返回结果: " + data);
    });
    tcpClient.sendMessage(command, function (res) {
        var obj = JSON.stringify(res);
        log("ls 发送结果: " + obj);
    });

}

function connect() {
    tcpClient.connect(function() {
        // 成功连接到服务器
        log("connected to server.");
        $("#dc-do-connect").hide();
        $("#dc-connect-status").html("已连接");
        $("#dc-connect-status").removeClass("fa-remove").addClass("fa-check");
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
