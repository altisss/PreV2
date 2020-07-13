/*
 Copyright 2018 BkavCoreCA By VietPDb

 */
import {BkavCAPlugin} from './BkavCAPlugin';

var functionCallBackAfterCheckSuccessEnvironmentSign;


export function CheckPluginValid(jsCallback) {
    functionCallBackAfterCheckSuccessEnvironmentSign = jsCallback;
    setTimeout(CheckPlugin, 1);
   
}

export function CheckPlugin() {
   BkavCAPlugin.Connect(ProcessResultConnect);
}
export function ProcessResultConnect(result) {

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

// export default { CheckPlugin, ProcessResultConnect };