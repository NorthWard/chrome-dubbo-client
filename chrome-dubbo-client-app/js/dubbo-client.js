// Make an ANSI Color converter.
var ansiConv = new AnsiConverter();
var tcpClient;
$(document).ready(function(){
    $("#executor").click(function () {
        if(!hasConnect()){
            log("has not connected");
            return
        }
        invoke()

    });
    $("#clear").click(function () {
        $("#console").text("");
    });
    $("#connect").click(function () {
        if(hasConnect()){
           log("has already connected")
        }else{
            var host = $("#dubbo_host").val();
            var port = $("#dubbo_port").val();
            if(isEmptyStr(host) || isEmptyStr(port)){
                log("host and port can not be empty");
                return
            }
            tcpClient = new TcpClient(host, parseInt(port), function(msg){
                log(msg)
            });
            tcpClient.logger = function (msg) {
                log(msg);
            }
            connect();
        }
    });

    $("#ls").click(function () {
        if(!hasConnect()){
            log("has not connected");
            return
        }
        ls()
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
    var command = " ls -l --no-prompt"
    tcpClient.sendMessage(command, function (res) {
        var obj = JSON.stringify(res);
        log("ls 返回结果: " + obj);
    })

}

function connect() {
    tcpClient.connect(function() {
        log("connect to server.");
        tcpClient.addResponseListener(function(data) {
           onResponse(data);
        });

    });
}

function log(str) {
    $("#console").append(str +  "\n");
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
