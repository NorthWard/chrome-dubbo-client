// Make an ANSI Color converter.
var ansiConv = new AnsiConverter();
var tcpClient;
$(document).ready(function(){
    $("#executor").click(function () {
        var host = $("#dubbo_host").val();
        var port = $("#dubbo_port").val();
        if(isEmptyStr(host) || isEmptyStr(port)){
            log("host and port can not be empty");
            return
        }
        tcpClient = new TcpClient(host, parseInt(port));
        connect();

    });
    $("#clear").click(function () {
        $("#console").text("");
    });
});
function onResponse(data){
    // Run response through ANSI colorizer.
   var formattedData = ansiConv.formatAnsi(data);
               // Split into multiple lines.
   //var lines = formattedData.split('\n');
               // Render response in the terminal.
   //var output = lines.join('<br/>');
    log(formattedData);
    tcpClient.disconnect();
}
function invoke(){
    var service = $("#service").val();
    var method = $("#method").val();
    var param = $("#params").val();
    var command = "invoke " + service + "." + method + "(" + param + ")";
    tcpClient.sendMessage(command, function (res) {
        var obj = JSON.stringify(res);
        log(obj);
    })
}

function connect() {
    tcpClient.connect(function() {
        log("connect to server.");
        tcpClient.addResponseListener(function(data) {
           onResponse(data);
        });
        invoke();

    });
}

function log(str) {
    $("#console").append(str + "\n");
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
