/*
 Copyright 2018 BkavCoreCA By VietPDb

 */

var functionCallBackAfterCheckSuccessEnvironmentSign;


function CheckPluginValid(jsCallback) {
    functionCallBackAfterCheckSuccessEnvironmentSign = jsCallback;
    setTimeout(CheckPlugin, 1);
   
}

function CheckPlugin() {
   BkavCAPlugin.Connect(ProcessResultConnect);
}
function ProcessResultConnect(result) {

    if (result == 1)//connect socket ok       
    {
        BkavCAPlugin.Connect(functionCallBackAfterCheckSuccessEnvironmentSign);
        // return 1;
    }

    else {
        alert("Vui lòng kiểm tra lại Plugin trên máy");
        // return 0;

    }

}

