/************************************************************************/
/*                        BkavCA Signer Plugin                          */
/************************************************************************/
/*
 Copyright 2018 BkavCoreCA By VietPDb

 */

function ObjectBkavCAPluginCallback() {
    this.FunctionCallback = null;
}

var objCallback = new ObjectBkavCAPluginCallback();
 var BkavCAPluginCallback = 'BkavExtensionCallback';

// Websocket
var FUNCTION_ID = {
    SignXMLBase64ID         : 0, 
    SignXMLBase64XPathID    : 1,
    SignXMLID           : 2,
    SignPDFBase64ID         : 3,
    SignPDFFileID           : 4,
    SignOOXMLBase64ID       : 5,
    SignOOXMLFileID         : 6,
    PluginValidID           : 7,
    VerifyXMLID             : 8,
    VerifyPDFID             : 9,
    VerifyOOXMLID           : 10,
    GetCertIndexID          : 11,
    GetAllCertID            : 12,
    GetCertListByFilterID   : 13,
    CheckOCSPBySerialID     : 14,
    CheckOCSPID             : 15,
    CheckCRLID              : 16,
    CheckValidTimeID        : 17,
    CheckTokenID            : 18,
    ReadPDFBase64ToTextID   : 19,
    ReadPDFFileToTextID     : 20,
    ReadFormFieldsToTextID  : 21,
    SetAESKeyID             : 22,
    SetUsePKCS11ID          : 23,
    ConvertFileToBase64ID   : 24,
    SetDLLNameID            : 25,
    SetLicenseKeyID         : 26,
    GetAllExtensionsID      : 27,
    GetSelfExtensionID      : 28,
    ValidateCertificateID   : 29,
    GetVersionID            : 30,
    SetPINCacheID           : 31,
    SetGetAttributesCertDefaultID : 32,
    DetectTokenID           : 33,
    ImportCertID            : 34,
    GetTokenInforID         : 35,
    ChangePINTokenID        : 36,
    CheckLoginID            : 37,
    SignCMSBase64ID         : 38,
    VerifyCMSID             : 39,
    BkavCANativeAppValidateID : 40,
    SetCheckTokenDefaultID  : 41,
    SetHashAlgorithmID      : 42,
    SetAddCertChainID       : 43,
    SetAddBase64CertID      : 44,
    SignXMLDataListID       : 45,
    SignOOXMLDataListID     : 46,
    SignPDFDataListID       : 47,
    SignDataListID          : 48,
    FileBrowserID           : 49,
    GetSysConfigID            : 50

}

var timer;
var port = 90;
var webSocket;
var hostname, mac, ip;
function ProcessData(inputData) {
    try {

        
           // console.log("send length 0: " + inputData.length);
            var arr = inputData.split("*");
            var host = window.location.host;
            if (arr[0] == 26) {
                inputData = inputData + "*" + host;
            }
            inputData = inputData + "*end";
            var num = Math.floor(inputData.length / 114271);

            if (num == 0) {
              //  console.log(inputData);
                webSocket.send(inputData);
                inputData = "";
            }
            else {
                var dataSend = null;
                for (var i = 0; i < num; i++) {
                    dataSend = inputData.substring(114271 * i, 114271 * (i + 1));

                    webSocket.send(dataSend);
                }
                dataSend = inputData.substring((114271 * num), inputData.length);
               // console.log("send length 3: " + dataSend);
                webSocket.send(dataSend);
            }
        

    } catch (e) {
        console.log("Error send: " + e);
    }
}

window.addEventListener("beforeunload", function (e) {
    sessionStorage.setItem("readyState", null);
});
var iCheckRef = 0;
function next(port, funcProcess) {
    tryConnect(port, funcProcess);
}
function tryConnect(port, funcProcess) {
    if (sessionStorage.getItem('readyState') != 1) {
        webSocket = new WebSocket("wss://localhost:" + 8443);
        timer = setTimeout(function () {
           //var s = webSocket;
            webSocket = null;
            //  s.close();
            port++;
            if (iCheckRef < 1) {
                iCheckRef++;
                next(port, funcProcess);
            } else {
                
                funcProcess("0");
                console.log("Plugin không hoạt động");
            }
        }, 2 * 1000);

        webSocket.onopen = function () {
            sessionStorage.setItem('readyState', 1);

            clearTimeout(timer);
            funcProcess("1");
           // console.log("ss");
        }
        webSocket.onclose = function () {

        }

       webSocket.onmessage = function (message) {
            var arg = message.data;
            var sub = arg.split('*');
            //console.log(sub);

            if (sub[sub.length - 1] == "end") {
                if (sub[sub.length - 2] == BkavCAPluginCallback) {
                    objCallback.FunctionCallback(arg.substr(0, arg.length - BkavCAPluginCallback.length - 5));
                  

                }
                else if (sub[sub.length - 2] == "BkavCACallbackInfo") {
                    hostname = sub[0];
                    mac = sub[1];
                    ip = sub[2];
                   console.log("hostname = " +hostname+ " mac = "+mac+" ip = "+ip);
                }
                else {
                    //console.log("Message::" + arg);
                }
            }

            // kiem tra neu co Callback thi cat lay cai cuoi xong truyen vao ham nay 
        }
        webSocket.onerror = function () {

        }
    }
    else {

        funcProcess("1");
    }




}
function InfoLocal(){
    var result = hostname +"*" + mac +"*"+ ip;
    return result;
}
/************************************************************************/
/* BkavCA Signer Plugin 2.0                                                       */
/************************************************************************/
export var BkavCAPlugin = {
    /*
    * Sign XML Data
    */
    SignXML: function (objXml) {
        var dataInput = "";
        // dsSignature = 1 set tiền tố ds
        var dsSignature = "0";
        if (objXml == null || objXml == undefined)
            return "";
        if (!objXml.DsSignature) {
            dsSignature = "0";
        }
        if(objXml.tagSigning == undefined){
            objXml.tagSigning = ""
        }
        if(objXml.tagSaveResult == undefined){
            objXml.tagSaveResult = ""
        }
        if(objXml.NodeToSign == undefined){
            objXml.NodeToSign = "";
        }
        if( objXml.SignatureID == undefined){
             objXml.SignatureID = "";
        }
       
        switch (objXml.SigningType) {
            case XML_SIGNING_TYPE.SIGN_XML_FILE:
                dataInput = FUNCTION_ID.SignXMLID + '*' + objXml.PathFileInput + '*' + objXml.PathFileOutput + '*' + objXml.TagSigning + '*' + objXml.NodeToSign + '*' +
                objXml.TagSaveResult + '*' + objXml.SigningTime + '*' + objXml.CertificateSerialNumber + '*' + dsSignature;
                break;
            case XML_SIGNING_TYPE.SIGN_XML_XPATH_FILTER:
                dataInput = FUNCTION_ID.SignXMLBase64XPathID + '*' + objXml.Base64String + '*' + objXml.tagSigning + '*' + objXml.nodeToSign + '*' + objXml.tagSaveResult + '*' + objXml.timeSign + '*' + objXml.CertificateSerialNumber + '*' + dsSignature;
                break;
            case XML_SIGNING_TYPE.SIGN_XML_DATA_LIST:
                dataInput = FUNCTION_ID.SignXMLDataListID + '*' + objXml.Base64String + '*' + objXml.tagSigning + '*' + objXml.nodeToSign + '*' + objXml.tagSaveResult + '*' + objXml.timeSign + '*' + objXml.CertificateSerialNumber + '*' + dsSignature;
                break;
            default:
                dataInput = FUNCTION_ID.SignXMLBase64ID + '*' + objXml.Base64String + '*' + objXml.tagSigning + '*' + objXml.nodeToSign + '*' + objXml.tagSaveResult + '*' + objXml.timeSign + '*' + objXml.CertificateSerialNumber + '*' +dsSignature;
               
                break;
        }
        if (objXml.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objXml.FunctionCallback;
        }
        else {
            return;
        }
        return ProcessData(dataInput);
    },
    //trong code sẽ tự động kiểm tra xem dữ liệu vào là base64 hay file và gọi đến các hàm xử lý tương ứng, không cần đặt ra 2 tên hàm xử lý base64 và file riêng.
    // Sign PDF Data
    SignPDF: function (objPdf) {
        var dataInput = "";
        if (objPdf == null || objPdf == undefined)
            return "";
        if (objPdf.CertificateSerialNumber == null || objPdf.CertificateSerialNumber.trim().length == 0) {
            objPdf.CertificateSerialNumber = "1";
        }
        switch (objPdf.SigningType) {
            case PDF_SIGNING_TYPE.SIGN_PDF_FILE:
                dataInput = FUNCTION_ID.SignPDFFileID + '*' + objPdf.PathFileInput + '*' + objPdf.PathFileOutput + '*' + objPdf.SigningTime + '*' + objPdf.CertificateSerialNumber + '*' + objPdf.Signer;
                break;
            case PDF_SIGNING_TYPE.SIGN_PDF_DATA_LIST:
                dataInput = FUNCTION_ID.SignPDFDataListID + '*' + objPdf.Base64String + '*' + objPdf.SigningTime + '*' + objPdf.CertificateSerialNumber + '*' + objPdf.Signer;
                break;
            default:
                dataInput = FUNCTION_ID.SignPDFBase64ID + '*' + objPdf.Base64String + '*' + objPdf.SigningTime + '*' + objPdf.CertificateSerialNumber + '*' + objPdf.Signer;
                break;
        }
        if (objPdf.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objPdf.FunctionCallback;
        }
        return ProcessData(dataInput);
    },
    
    //Sign Office Data
    SignOOXML: function (objOOXml) {
        var dataInput = "";
        if (objOOXml == null || objOOXml == undefined)
            return "";
        if (objOOXml.CertificateSerialNumber == null || objOOXml.CertificateSerialNumber.trim().length == 0) {
            objOOXml.CertificateSerialNumber = "1";
        }
        switch (objOOXml.SigningType) {
            case OOXML_SIGNING_TYPE.SIGN_OOXML_FILE:
                dataInput = FUNCTION_ID.SignOOXMLFileID + '*' + objOOXml.PathFileInput + '*' + objOOXml.PathFileOutput + '*' + objOOXml.CertificateSerialNumber;
                break;
            case OOXML_SIGNING_TYPE.SIGN_OOXML_DATA_LIST:
                dataInput = FUNCTION_ID.SignOOXMLDataListID + '*' + objOOXml.Base64String + '*' + objOOXml.CertificateSerialNumber;
                break;
            default:
                dataInput = FUNCTION_ID.SignOOXMLBase64ID + '*' + objOOXml.Base64String + '*' + objOOXml.CertificateSerialNumber;
                break;
        }
        if (objOOXml.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objOOXml.FunctionCallback;
        }
        return ProcessData(dataInput);
    },
    
    VerifyXML: function (objVerifier) {
        var dataInput = "";
        if (objVerifier.TimeCheck == null || objVerifier.TimeCheck.trim().length == 0) {
            objVerifier.TimeCheck = "1";
        }
        if (objVerifier.VerifyType = VERIFY_TYPE.VERYFY_BASE64) {
            dataInput = FUNCTION_ID.VerifyXMLID + '*' + objVerifier.Base64Signed + '*' + objVerifier.TimeCheck;
        } else {
            dataInput = FUNCTION_ID.VerifyXMLID + '*' + objVerifier.PathFileInput + '*' + objVerifier.TimeCheck;
        }
        if (objVerifier.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objVerifier.FunctionCallback;
        }
        return ProcessData(dataInput);
    },

    VerifyOOXML: function (objVerifier) {
        var dataInput = "";
        if (objVerifier.TimeCheck == null || objVerifier.TimeCheck.trim().length == 0) {
            objVerifier.TimeCheck = "1";
        }
        if (objVerifier.VerifyType = VERIFY_TYPE.VERYFY_BASE64) {
            dataInput = FUNCTION_ID.VerifyOOXMLID + '*' + objVerifier.Base64Signed + '*' + objVerifier.TimeCheck;
        }
        else {
            dataInput = FUNCTION_ID.VerifyOOXMLID + '*' + objVerifier.PathFileInput + '*' + objVerifier.TimeCheck;
        }
        if (objVerifier.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objVerifier.FunctionCallback;
        }
        return ProcessData(dataInput);
    },
    VerifyPDF: function (objVerifier) {
        var dataInput = "";
        if (objVerifier.TimeCheck == null || objVerifier.TimeCheck.trim().length == 0) {
            objVerifier.TimeCheck = "1";
        }
        if (objVerifier.VerifyType = VERIFY_TYPE.VERYFY_BASE64) {
            dataInput = FUNCTION_ID.VerifyPDFID + '*' + objVerifier.Base64Signed + '*' + objVerifier.TimeCheck;
        }
        else {
            dataInput = FUNCTION_ID.VerifyPDFID + '*' + objVerifier.PathFileInput + '*' + objVerifier.TimeCheck;
        }
        if (objVerifier.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objVerifier.FunctionCallback;
        }
        return ProcessData(dataInput);
    },

    //Hàm đọc nội dung base64pdf ra text
    ReadPDFBase64ToText: function (pdfBase64) {
        if (pdfBase64 == null || pdfBase64.trim().length == 0) {
            pdfBase64 = "1";
        }
        var dataInput = "";
        dataInput = FUNCTION_ID.ReadPDFBase64ToTextID + '*' + pdfBase64;
        return ProcessData(dataInput);
    },

    // Take cert infos based on Filter and Value parameter
    GetCertListByFilter: function (objFilter) {
        try {
            var dataInput = "";
            var usePKCS11 = '0', isOnlyToken = '0';
            var objFilterCert = new ObjFilter();
            objFilterCert = objFilter;
            if (objFilterCert.Value == "") {
                objFilterCert.Value = "1";
            }
            if (objFilterCert.UsePKCS11) {
                usePKCS11 = '1';
            }
            if (objFilterCert.isOnlyCertFromToken) {
                isOnlyToken = '1';
            }

            if (objFilterCert.Filter == INFO_CERT_FILTER.CERTIFICATE_SERIAL_NUMBER) {
                dataInput = FUNCTION_ID.GetCertListByFilterID + '*SerialNumber*' + objFilterCert.Value + '*' + usePKCS11 + '*' + isOnlyToken;
            }
            else if (objFilterCert.Filter == INFO_CERT_FILTER.CERTIFICATE_SUBJECT_CN) {
                dataInput = FUNCTION_ID.GetCertListByFilterID + '*SubjectCN*' + objFilterCert.Value + '*' + usePKCS11 + '*' + isOnlyToken;
            }
            else if (objFilterCert.Filter == INFO_CERT_FILTER.CERTIFICATE_ISSUER_CN) {
                dataInput = FUNCTION_ID.GetCertListByFilterID + '*IssuerCN*' + objFilterCert.Value + '*' + usePKCS11 + '*' + isOnlyToken;
            }
            else if (objFilterCert.Filter == INFO_CERT_FILTER.CERTIFICATE_VALIDTO) {
                dataInput = FUNCTION_ID.GetCertListByFilterID + '*ValidTo*' + objFilterCert.Value + '*' + usePKCS11 + '*' + isOnlyToken;
            }
            else if (objFilterCert.Filter == INFO_CERT_FILTER.CERTIFICATE_VALIDFROM) {
                dataInput = FUNCTION_ID.GetCertListByFilterID + '*ValidFrom*' + objFilterCert.Value + '*' + usePKCS11 + '*' + isOnlyToken;
            }
            else if (objFilterCert.Filter == INFO_CERT_FILTER.CERTIFICATE_TIMEVALID) {
                dataInput = FUNCTION_ID.GetCertListByFilterID + '*TimeValid*' + objFilterCert.Value + '*' + usePKCS11 + '*' + isOnlyToken;
            }
            else {
                dataInput = FUNCTION_ID.GetCertListByFilterID + '*SerialNumber*1' + '*' + usePKCS11 + '*' + isOnlyToken;
            }
            if (objFilterCert.FunctionCallback != null) {
                dataInput = dataInput + '*' + BkavCAPluginCallback;
                objCallback.FunctionCallback = objFilterCert.FunctionCallback;
            }
            return ProcessData(dataInput);
        } catch (e) {
            console.log(e);
        }
    },

    ReadPDFFileToText: function (pdfFile) {
        if (pdfFile == null || pdfFile.trim().length == 0) {
            pdfFile = "1";
        }
        var dataInput = "";
        dataInput = FUNCTION_ID.ReadPDFFileToTextID + '*' + pdfFile;
        return ProcessData(dataInput);
    },

    ReadFormFieldsToText: function (pdfFile) {
        if (pdfFile == null || pdfFile.trim().length == 0) {
            pdfFile = "1";
        }
        var dataInput = "";
        dataInput = FUNCTION_ID.ReadFormFieldsToTextID + '*' + pdfFile;
        return ProcessData(dataInput);
    },
   // Open a dialog and choose files
    FileBrowser: function (OPEN_FILE_FILTER, jsCallback) {
        var dataInput = "";
        dataInput = FUNCTION_ID.FileBrowserID + '*';
        if (jsCallback == undefined) {
            if (OPEN_FILE_FILTER == 0) {
                dataInput = dataInput + 'XML';
            }
            else if (OPEN_FILE_FILTER == 1) {
                dataInput = dataInput + 'PDF';
            }
            else if (OPEN_FILE_FILTER == 2) {
                dataInput = dataInput + 'WORD';
            }
            else if (OPEN_FILE_FILTER == 3) {
                dataInput = dataInput + 'EXCEL';
            }
            else
                dataInput = dataInput + '1';
        }
        else {
            objCallback.FunctionCallback = jsCallback;
            if (OPEN_FILE_FILTER == 0) {
                dataInput = dataInput + 'XML*' + BkavCAPluginCallback;
            }
            else if (OPEN_FILE_FILTER == 1) {
                dataInput = dataInput + 'PDF*' + BkavCAPluginCallback;
            }
            else if (OPEN_FILE_FILTER == 2) {
                dataInput = dataInput + 'WORD*' + BkavCAPluginCallback;
            }
            else if (OPEN_FILE_FILTER == 3) {
                dataInput = dataInput + 'EXCEL*' + BkavCAPluginCallback;
            }
            else
                dataInput = dataInput + '1*' + BkavCAPluginCallback;
        }
        return ProcessData(dataInput);
    },
    // Check revoke status of cert through OCSP
    CheckOCSP: function (objCert) {
        //var objCert=new ObjCertificate();
        if (objCert.TimeCheck == null || objCert.TimeCheck.trim().length == 0) {
            objCert.TimeCheck = "1";
        }
        var dataInput = "";
        if (objCert.CertificateBase64 != null && objCert.CertificateBase64.trim().length > 0) {
            dataInput = FUNCTION_ID.CheckOCSPID + '*' + objCert.CertificateBase64 + '*' + objCert.OcspUrl + '*' + objCert.TimeCheck;
        }
        else {
            dataInput = FUNCTION_ID.CheckOCSPBySerialID + '*' + objCert.CertificateSerialNumber + '*' + objCert.OcspUrl + '*' + objCert.TimeCheck;
        }
        if (objCert.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objCert.FunctionCallback;
        }
        return ProcessData(dataInput);
    },

    // Check revoke status of cert
    CheckCRL: function (objCert) {
        var dataInput = "";
        if (objCert.TimeCheck == null || objCert.TimeCheck.trim().length == 0) {
            objCert.TimeCheck = "1";
        }
        if (objCert.CertificateBase64 != null && objCert.CertificateBase64.trim().length > 0) {
            dataInput = FUNCTION_ID.CheckCRLID + '*' + objCert.CertificateBase64 + '*' + objCert.TimeCheck;
        }
        else {
            dataInput = FUNCTION_ID.CheckCRLID + '*' + objCert.CertificateSerialNumber + '*' + objCert.TimeCheck;
        }
        if (objCert.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objCert.FunctionCallback;
        }
        return ProcessData(dataInput);
    },

    // Check valid time of cert
    CheckValidTime: function (objCert) {
        //var objCert = new ObjCertificate();
        if (objCert.TimeCheck == null || objCert.TimeCheck.trim().length == 0) {
            objCert.TimeCheck = "1";
        }
        var dataInput = "";
        if (objCert.CertificateBase64 != null && objCert.CertificateBase64.trim().length > 0) {
            dataInput = FUNCTION_ID.CheckValidTimeID + '*' + objCert.CertificateBase64 + '*' + objCert.TimeCheck;
        }
        else {
            dataInput = FUNCTION_ID.CheckValidTimeID + '*' + objCert.CertificateSerialNumber + '*' + objCert.TimeCheck;
        }
        if (objCert.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objCert.FunctionCallback;
        }
        return ProcessData(dataInput);
    },

    // Check if user log-ins by token or not, token has truth cert or not
    CheckToken: function (CertificateSerialNumber, JSCallback) {
        var dataInput = "";
        if (CertificateSerialNumber == null || CertificateSerialNumber.trim().length == 0) {
            CertificateSerialNumber = "1";
        }

        if (JSCallback == undefined) {
            alert("Not found function callback");
            return;
        }
        else {
            dataInput = FUNCTION_ID.CheckTokenID + '*' + CertificateSerialNumber + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = JSCallback;
        }
        return ProcessData(dataInput);
    },
    
    //PdfUtils
    //install AES key to encrypt and decrypt PIN memorized by user
    SetAESKey: function (keyAES) {
        keyAES = keyAES + '*' + CreateKeyAES();
        var dataInput = "";
        dataInput = FUNCTION_ID.SetAESKeyID + '*' + keyAES;
        return ProcessData(dataInput);
    },
    // install and sign pkcs11
    SetUsePKCS11: function (SET_USE_PKCS11) {
        var dataInput = "";
        if (SET_USE_PKCS11 == 0) {
            dataInput = FUNCTION_ID.SetUsePKCS11ID + '*0';
        }
        else {
            dataInput = FUNCTION_ID.SetUsePKCS11ID + '*1';
        }
        return ProcessData(dataInput);
    },
    // install dll pkcs11 list of providers. For instance: BkavCA.dll  ... 
    // Use this function before CheckToken and SetUsePKCS11 functions
    SetDLLName: function (dllNameList) {
        var dataInput = "";
        if (dllNameList == null || dllNameList.trim().length == 0) {
            dllNameList = "1";
        }
        var dataInput = FUNCTION_ID.SetDLLNameID + '*' + dllNameList;
        return ProcessData(dataInput);
    },
    ConvertFileToBase64: function (pathFile, jsCallback) {
        if (pathFile == null || pathFile.trim().length == 0) {
            pathFile = "1";
        }
        var dataInput = "";
        dataInput = FUNCTION_ID.ConvertFileToBase64ID + '*' + pathFile;
        if (jsCallback != undefined) {
            objCallback.FunctionCallback = jsCallback;
            dataInput = dataInput + '*' + BkavCAPluginCallback;
        }
        else
        {

        }
        return ProcessData(dataInput);
    },
    GetCertIndex: function (CertificateSerialNumber) {
        if (CertificateSerialNumber == null || CertificateSerialNumber.trim().length == 0) {
            CertificateSerialNumber = "1";
        }
        var dataInput = "";
        dataInput = FUNCTION_ID.GetCertIndexID + '*' + CertificateSerialNumber;
        return ProcessData(dataInput);
    },

    // setup license to use software 
    SetLicenseKey: function (license) {
        var dataInput = "";
        dataInput = FUNCTION_ID.SetLicenseKeyID + '*' + license;
        return ProcessData(dataInput);
    },
    GetSysConfig: function (jsCallback) {
        /*var dataInput = "";
        dataInput = FUNCTION_ID.GetSysWindows + '*' + "1";*/

        if (jsCallback == undefined) {
            return;
        }
        else {
            var dataInput = "";
            dataInput = FUNCTION_ID.GetSysConfigID + "*" + BkavCAPluginCallback;
            objCallback.FunctionCallback = jsCallback;
        }
         
        return ProcessData(dataInput);
    },

    // check activity status of plugin on chrome browser
    ExtensionValid: function () {
        var dataInput = "";
        dataInput = FUNCTION_ID.ExtensionValidID + '*1';
        return ProcessData(dataInput);
    },  
    
    //GetAllExtensions, GetSelfExtension, GetExtensionWithID
    
    // Cac ham ho tro version cu 1.0:
    GetAllCert: function (filter, value, jsCallback) {
        if (jsCallback == undefined) {
            return;
        }
        else {
            var dataInput = "";
            dataInput = FUNCTION_ID.GetAllCertID + '*' + filter + '*' + value + "*" + BkavCAPluginCallback;
            objCallback.FunctionCallback = jsCallback;
        }

        return ProcessData(dataInput);

    },
    
    //ReadFileToBase64, SignOffice, SignOfficeBase64, SignXMLBase64
    
    // New: Sign CMS Data
    SignCMS: function (objCMS) {
        var dataInput = "";
        if (objCMS == null || objCMS == undefined)
            return "";
        if (objCMS.CertificateSerialNumber == null || objCMS.CertificateSerialNumber.trim().length == 0) {
            objCMS.CertificateSerialNumber = "1";
        }
        dataInput = FUNCTION_ID.SignCMSBase64ID + '*' + objCMS.Base64String + '*' + objCMS.CertificateSerialNumber;
        if (objCMS.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objCMS.FunctionCallback;
        }
        return ProcessData(dataInput);
    },
    // New: Verify XML data with parameter path of file or xml string encoded by base64
    VerifyCMS: function (objVerifier) {
        var dataInput = "";
        if (objVerifier.TimeCheck == null || objVerifier.TimeCheck.trim().length == 0) {
            objVerifier.TimeCheck = "1";
        }
        dataInput = FUNCTION_ID.VerifyCMSID + '*' + objVerifier.Base64Signed + '*' + objVerifier.TimeCheck;
        if (objVerifier.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objVerifier.FunctionCallback;
        }
        return ProcessData(dataInput);
    },
    
    //New: Check validity of cert
    ValidateCertificate: function (objCert) {
        //var objCert=new ObjCertificate();
        var usePKCS11 = '0';
        if (objCert.TimeCheck == null || objCert.TimeCheck.trim().length == 0) {
            objCert.TimeCheck = "1";
        }
        var dataInput = "";
        dataInput = FUNCTION_ID.ValidateCertificateID + '*' + objCert.CertificateBase64 + '*' + objCert.CertificateSerialNumber + '*' + objCert.TimeCheck;
        if (objCert.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objCert.FunctionCallback;
        }
        return ProcessData(dataInput);
    },
    
    //New: Set PIN Cache of Token
    SetPINCache: function (oneSessiosPINCache, sessionsPINCache, secondPINCache) {
        var strOneSessionPINCache = '0';
        var strSessionsPINCache = '0';

        if (oneSessiosPINCache) {
            strOneSessionPINCache = '1';
        }
        if (sessionsPINCache) {
            strSessionsPINCache = '1';
        }
        var dataInput = "";
        dataInput = FUNCTION_ID.SetPINCacheID + '*' + strOneSessionPINCache + '*' + strSessionsPINCache + '*' + secondPINCache;
      
        return ProcessData(dataInput);
    },

    //New: Get version of software
    GetVersion: function () {
        var dataInput = "";
        dataInput = FUNCTION_ID.GetVersionID + '*1';
        return ProcessData(dataInput)
    },
   
    // New:
    SetGetAttributesCertDefault: function (iDefault) {
        var dataInput = "";
        dataInput = FUNCTION_ID.SetGetAttributesCertDefaultID + '*' + iDefault;
        return ProcessData(dataInput);
    },

    //New: display cert lists in windows store for user
    ChooserCertFromWindowStore: function (JSCallback) {
        var dataInput = "";
        if (JSCallback == undefined) {
            return;
        }
        else {
            dataInput = FUNCTION_ID.ChooserCertFromWindowStoreID + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = JSCallback;
        }
        return ProcessData(dataInput);
    },
    
    // New:
    SetCheckTokenDefault: function (iDefault) {
        var dataInput = "";
        dataInput = FUNCTION_ID.SetCheckTokenDefaultID + '*0';
        if (iDefault == 1) {
            dataInput = FUNCTION_ID.SetCheckTokenDefaultID + '*1';
        }
        return ProcessData(dataInput);
    },
    // New:
    SetHashAlgorithm: function (HASH_ALGORITHM) { //hash algorithm
        var dataInput = "";
        dataInput = FUNCTION_ID.SetHashAlgorithmID + '*0';
        if (HASH_ALGORITHM == 1) {
            dataInput = FUNCTION_ID.SetHashAlgorithmID + '*1';
        }
        return ProcessData(dataInput);
    },
    
    // New:
    SetAddCertChain: function (ADD_CERTCHAIN) { //hash algorithm
        var dataInput = "";
        dataInput = FUNCTION_ID.SetAddCertChainID + '*0';
        if (ADD_CERTCHAIN == 1) {
            dataInput = FUNCTION_ID.SetAddCertChainID + '*1'
        }
        return ProcessData(dataInput);
    },
    
    // New:
    SetAddBase64Cert: function (ADD_BASE64CERT) { //hash algorithm
        var dataInput = "";
        dataInput = FUNCTION_ID.SetAddBase64CertID + '*0'
        if (ADD_BASE64CERT == 1) {
            dataInput = FUNCTION_ID.SetAddBase64CertID + '*1'
        }
        return ProcessData(dataInput);
    },
    // 8-8
    //int BkavCAExtension::DetectToken (string serialNumber)
    DetectToken: function (JSCallback) {
        var dataInput = "";
        dataInput = FUNCTION_ID.DetectTokenID + '*0'
        if (JSCallback != undefined && JSCallback != "") {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = JSCallback;
        }
        else
        {
            return;
        }
        return ProcessData(dataInput);
    },
    ImportCert: function (Base64P12, Password, UserPin, JSCallback) {
        var dataInput = "";
        dataInput = FUNCTION_ID.ImportCertID;
        if (UserPin == '' || UserPin == undefined) {
            UserPin = "1";
        }
        if (Password == '' || Password == undefined) {
            Password = "1";
        }
        if (Base64P12 == '' || Base64P12 == undefined) {
            Base64P12 = "1";
        }
        dataInput = dataInput + '*' + Base64P12 + '*' + Password + '*' + UserPin;
        if (JSCallback != undefined) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = JSCallback;
        }
        else
        {
            return;
        }
        return ProcessData(dataInput);
    },
    ChangePINToken: function (PIN_TYPE, OldPIN, NewPIN, JSCallback) {
        var dataInput = "";
        dataInput = FUNCTION_ID.ChangePINTokenID;
        if (OldPIN == '' || OldPIN == undefined) {
            OldPIN = "1";
        }
        var pinType = "0";
        if (PIN_TYPE == 1) {
            pinType = "1";
        }
        dataInput = dataInput + '*' + pinType + '*' + OldPIN + '*' + NewPIN;
        if (JSCallback != undefined) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = JSCallback;
        }
        else
        {
            return;
        }
        return ProcessData(dataInput);
    },
    CheckLogin: function (PIN_TYPE, PIN, JSCallback) {
        var dataInput = "";
        dataInput = FUNCTION_ID.CheckLoginID;
        if (PIN == '' || PIN == undefined) {
            PIN = "1";
        }
        var pinType = "0";
        if (PIN_TYPE == 1) {
            pinType = "1";
        }
        dataInput = dataInput + '*' + pinType + '*' + PIN;
        if (JSCallback != undefined) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = JSCallback;
        }
        return ProcessData(dataInput);
    },
    GetTokenInfor: function (JSCallback) {
        var dataInput = "";
        dataInput = FUNCTION_ID.GetTokenInforID + '*1';
        if (JSCallback != undefined) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = JSCallback;
        }
        else
            return;
        return ProcessData(dataInput);
    },
    SignDataList: function (objDataList) { // 11/10
        var dataInput = "";
        if (objDataList == null || objDataList == undefined)
            return "";
        var dsSignature = "1";
        var objXml = objDataList.objXmlSigner;
        var objPdf = objDataList.objPdfSiger;
        var objOOXml = objDataList.objOOxmlSigner;
        if (objXml == null || objXml == undefined || objPdf == null || objPdf == undefined || objOOXml == null || objOOXml == undefined)
            return "";
        if (!objXml.DsSignature) {
            dsSignature = "0";
        }
        dataInput = FUNCTION_ID.GetTokenInforID + '*' + objDataList.Base64String + '*' + objXml.TagSigning + '*' + objXml.NodeToSign + '*' + objXml.TagSaveResult + '*' + objDataList.SigningTime + '*' + objDataList.CertificateSerialNumber + '*' + dsSignature + '*' + objPdf.Signer;
        if (objDataList.FunctionCallback != null) {
            dataInput = dataInput + '*' + BkavCAPluginCallback;
            objCallback.FunctionCallback = objDataList.FunctionCallback;
        }
        return ProcessData(dataInput);
    },
    
    Connect: function (funcProcessCallback) {
        tryConnect(port, funcProcessCallback);
    }
};

/**
* Đây là hàm demo dạng định nghĩa danh sách kiểu enum.
*/
var VERIFY_STATUS = {
    GOOD: 0,
    DATA_INVALID: 1,
    CERTIFICATE_EXPIRE: 2,
    CERTIFICATE_REVOKED: 3,
    CERTIFICATE_HOLD: 4,
    CERTIFICATE_NOT_TRUST: 5
};

var XML_SIGNING_TYPE = {
    SIGN_XML_FILE: 0,
    SIGN_XML_BASE64: 1,
    SIGN_XML_XPATH_FILTER: 2,
    SIGN_XML_DATA_LIST: 3
};
var PDF_SIGNING_TYPE = {
    SIGN_PDF_FILE: 0,
    SIGN_PDF_BASE64: 1,
    SIGN_PDF_DATA_LIST: 2
};
var OOXML_SIGNING_TYPE = {
    SIGN_OOXML_FILE: 0,
    SIGN_OOXML_BASE64: 1,
    SIGN_OOXML_DATA_LIST: 2
};
var INFO_CERT_FILTER = {
    CERTIFICATE_SERIAL_NUMBER: 0,
    CERTIFICATE_SUBJECT_CN: 1,
    CERTIFICATE_ISSUER_CN: 2,
    CERTIFICATE_VALIDTO: 3,
    CERTIFICATE_VALIDFROM: 4,
    CERTIFICATE_TIMEVALID: 5
};
var OPEN_FILE_FILTER = {
    XML: 0,
    PDF: 1,
    DOCX: 2,
    XLSX: 3//
};
var SET_USE_PKCS11 = {
    YES: 1,
    NO: 0
};
var VERIFY_TYPE = {
    VERYFY_BASE64: 0,
    VERYFY_FILE: 1
};
var HASH_ALGORITHM = {
    SHA1: 0,
    SHA256: 1
};
var ADD_CERTCHAIN = {
    NO: 0,
    YES: 1
};
var ADD_BASE64CERT = {
    NO: 0,
    YES: 1
};
var PIN_TYPE = {
    USER_PIN: 0,
    SO_PIN: 1
};
//EVENT_EXTENSION = {
//    OOXMLFile: 0,
//    OOXMLBase64: 1,
//};
/**
* Đây là đối tượng ký xml.
* @FileIn Dữ liệu dạng đường dẫn đến tập tin Xml cần ký.
* @Base64In Dữ liệu dạng xml Base64 String cần ký.
* @FileOut Đây là kết quả trả về sau khi ký file dạng đưa vào đường dẫn, nếu là ký Base64Xml thì để null trường này.
* @TagSigning Đây là thẻ dữ liệu cần ký trong tài liệu. Nếu để null thì mặc định hệ thống sẽ ký toàn bộ tài liệu.
* @NodeToSign .
* @TagSaveResult Đây là thẻ lưu chữ ký.
* @SigningTime Thời gian ký.
* @CertificateSerialNumber serial number của cert dùng để ký.
* @NameXPathFilter Thẻ dữ liệu cần ký theo chuẩn XPath Filter 2.0.
* @NameIDTimeSignature ID của thẻ thời gian (Ký theo chuẩn XPath Filter 2.0).
* @DsSignature Tiền tố ds:.
* @SigningType Kiểu ký XML.
*/

function ObjXmlSigner() {
    this.PathFileInput = "";
    this.Base64String = "";
    this.PathFileOutput = "";
    this.TagSigning = "";
    this.NodeToSign = "";
    this.TagSaveResult = "";
    this.SigningTime = "";
    this.CertificateSerialNumber = "";
    this.NameXPathFilter = "";
    this.NameIDTimeSignature = "";
    this.DsSignature = true;
    this.SigningType = XML_SIGNING_TYPE.SIGN_XML_BASE64;
    this.FunctionCallback = null;
}

function ObjOOXmlSigner() {
    this.PathFileInput = "";
    this.Base64String = "";
    this.PathFileOut = "";
    this.CertificateSerialNumber = "";
    this.SigningType = OOXML_SIGNING_TYPE.SIGN_OOXML_BASE64;
    this.FunctionCallback = null;
}

//TuanTAg: 
function ObjPdfSigner() {
    this.PathFileInput = "";
    this.Base64String = "";
    this.PathFileInput = "";
    this.SigningTime = "";
    this.CertificateSerialNumber = "";
    this.Signer = "";
    this.SigningType = PDF_SIGNING_TYPE.SIGN_PDF_BASE64;
    this.FunctionCallback = null;
}
function ObjDataListSigner() {
    this.objXmlSigner = null;
    this.objPdfSiger = null;
    this.objOOxmlSigner = null;
    this.Base64String = "";
    this.SigningTime = "";
    this.CertificateSerialNumber = "";
    this.FunctionCallback = null;
}

function ObjCMSSigner() {
    this.Base64String = "";
    this.CertificateSerialNumber = "";
    this.FunctionCallback = null;
}

function ObjVerifier() {
    this.OriginalData = "";
    this.PathFileInput = "";
    this.Base64Signed = "";
    this.TimeCheck = "";
    this.VerifyType = VERIFY_TYPE.VERYFY_BASE64;
    this.FunctionCallback = null;
}

function ObjCertificate() {
    this.CertificateBase64 = "";
    this.CertificateSerialNumber = "";
    this.OcspUrl = "";
    this.TimeCheck = "";
    this.FunctionCallback = null;
}

function ObjFilter() {
    this.Filter = INFO_CERT_FILTER.SerialNumber;
    this.Value = "";
    this.UsePKCS11 = false;
    this.isOnlyCertFromToken = false;
    this.FunctionCallback = null;
}
function ObjInfoLocal() {
    
    this.FunctionCallback = null;
}
function CreateKeyAES() {
    var key1 = window.location.host;
    //var key1 = 'demo'; 
    var key2 = 2015 << 2;
    var key3 = (key1.length) << 4;
    var key = key1 + '*' + key3 + '*' + key2;
    return key;
}

var licenseKey =
            "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PExpY2Vuc2UgaWQ9IkwwMDEiPjxUZW5QaGFuTWVtPkJrYXZDQSBTaWduZXIgUGx1Z2luPC9UZW5QaGFuTWVtPjxOZ3VvaUNhcD5Ca2F2IENvcnBvcmF0aW9uPC9OZ3VvaUNhcD48RG9uVmlEdW9jQ2FwPkNLIEJldGE8L0RvblZpRHVvY0NhcD48SGFuU3VEdW5nPjxOZ2F5Q2FwPjE2LTA0LTIwMTk8L05nYXlDYXA+PE5nYXlIZXRIYW4+MTYtMDQtMjAyMjwvTmdheUhldEhhbj48L0hhblN1RHVuZz48UXV5ZW5TdUR1bmc+PFVuZ0R1bmc+dHJhZGluZ3Rlc3QuYnNpLmNvbS52bjwvVW5nRHVuZz48TW9kdWxlWE1MPjE8L01vZHVsZVhNTD48TW9kdWxlUERGPjE8L01vZHVsZVBERj48TW9kdWxlQ01TPjE8L01vZHVsZUNNUz48TW9kdWxlT09YTUw+MTwvTW9kdWxlT09YTUw+PE1vZHVsZUNlcnRpZmljYXRlVXRpbHM+MTwvTW9kdWxlQ2VydGlmaWNhdGVVdGlscz48TW9kdWxlSW1wb3J0Q2VydD4xPC9Nb2R1bGVJbXBvcnRDZXJ0PjwvUXV5ZW5TdUR1bmc+PFNpZ25hdHVyZSB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnIyI+PFNpZ25lZEluZm8+PENhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy14bWwtYzE0bi0yMDAxMDMxNSNXaXRoQ29tbWVudHMiLz48U2lnbmF0dXJlTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnI3JzYS1zaGExIi8+PFJlZmVyZW5jZSBVUkk9IiI+PFRyYW5zZm9ybXM+PFRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+PC9UcmFuc2Zvcm1zPjxEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjc2hhMSIvPjxEaWdlc3RWYWx1ZT5Xc1JXa3VQN3pkdFh4L1JETGN1L3Y2b1JYVUE9PC9EaWdlc3RWYWx1ZT48L1JlZmVyZW5jZT48L1NpZ25lZEluZm8+PFNpZ25hdHVyZVZhbHVlPmpjc09xTzJEYXQ2MTkzRnNyS1ROeDBqV2Z4RkpYRjR4TTlBamVCeXpSbmVMbWRWM1dVeFpZYzBOaVByOCtRZEtqcVpvV20rVllkZTENCnU4dHowa3BBcklSQ203dGtZU2xFVEtTMnlkK0RCZlM5TCtNcnVoUmNOT25kc2dnUDVZTkQ2ZEVkck1ML3NHcTNVSHk3dHZKTnNvMkoNCjNOaU90azVIZmwyNEdWOHZLckU2cmUzNTdhS1NtMkI5VEdoSGE4ZjVwZ3VtaTFEWWs2STNvUVc4OVcraVN4T1hBWXM3ZVpOdFkxRkENCjhGNVRsTnJCdEhmTXlPM1BTSm5SbXFtdDlZQTBidnZ2Y1N1d1lyVHZMVHRUUGFtSXZoK0hPZ2YrSzdWeWY4ZThZaTdDUWVmT0dTZXcNCmVON21KTzVwYktBaTR5SW9neUFNMkZ2NzdGajdhOCsrUTRrdDJRPT08L1NpZ25hdHVyZVZhbHVlPjxLZXlJbmZvPjxYNTA5RGF0YT48WDUwOVN1YmplY3ROYW1lPkM9Vk4sU1Q9SMOgIE7hu5lpLEw9Q+G6p3UgR2nhuqV5LE89Q8O0bmcgdHkgQ+G7lSBwaOG6p24gQmthdixPVT1CYW4gQU5NLENOPUJrYXZDQSBMaWNlbnNlLFVJRD1NU1Q6MDEwMTM2MDY5Ny1Ca2F2Q0FMaWNlbnNlPC9YNTA5U3ViamVjdE5hbWU+PFg1MDlDZXJ0aWZpY2F0ZT5NSUlFMWpDQ0E3NmdBd0lCQWdJUVZBTmdmV2RnWDBBVkdIdVlKTTVFcmpBTkJna3Foa2lHOXcwQkFRVUZBREJKTVFzd0NRWURWUVFHDQpFd0pXVGpFT01Bd0dBMVVFQnhNRlNHRnViMmt4R1RBWEJnTlZCQW9URUVKcllYWWdRMjl5Y0c5eVlYUnBiMjR4RHpBTkJnTlZCQU1UDQpCa0pyWVhaRFFUQWVGdzB4T0RBNE1Ea3dPRFF3TWpKYUZ3MHlNREExTVRVd016TTFORGhhTUlHMU1Td3dLZ1lLQ1pJbWlaUHlMR1FCDQpBUXdjVFZOVU9qQXhNREV6TmpBMk9UY3RRbXRoZGtOQlRHbGpaVzV6WlRFWE1CVUdBMVVFQXd3T1FtdGhka05CSUV4cFkyVnVjMlV4DQpFREFPQmdOVkJBc01CMEpoYmlCQlRrMHhJakFnQmdOVkJBb01HVVBEdEc1bklIUjVJRVBodTVVZ2NHamh1cWR1SUVKcllYWXhGVEFUDQpCZ05WQkFjTURFUGh1cWQxSUVkcDRicWxlVEVTTUJBR0ExVUVDQXdKU01PZ0lFN2h1NWxwTVFzd0NRWURWUVFHRXdKV1RqQ0NBU0l3DQpEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBUExkUTJjVGdZOVJieTNPNUdFWXU3Y2gxeVJXQVNCV2RjZHFYamFaDQpMYkxicUVXWUwwVCtBdkE0cUFrcUNBZHdzOTBuZWtHVjZNWjdzVHUrMEsrcjFBL2xSc0EwOERtRjczL0JDNW1DR09lb3huYkNhQVorDQpIQ2t5NDRsSVF5QWgwT011UUllSE9PZW8wUkhYOGJWVXozZUJ0ZGJoZmZTVC8zYWIyd09kaVpFYVp6SU5GaFBKZGpITXRibWpYUlAvDQo1RzV6ZDFGekVGYkVyTDVFUHo3U1c0ektLMmJ3ekRySjg5UGswRjZubVNMTk5kTTNJbGRFNmhwZlFYN3h5cFdWWk15cjNDdXRGSktPDQo5NHFwVlJaMmF1bTUrQ0dlS1c4SHo5MHQ3VE9HNVExOElQdUp1ajl4VGRGUHhiaFprTTNjT2thbmVNMHFESGx0aEs3WjVoSDN4K2tDDQpBd0VBQWFPQ0FVc3dnZ0ZITURFR0NDc0dBUVVGQndFQkJDVXdJekFoQmdnckJnRUZCUWN3QVlZVmFIUjBjRG92TDI5amMzQXVZbXRoDQpkbU5oTG5adU1CMEdBMVVkRGdRV0JCVG1HZVVrR1l5TmJBY2JQRXZOL0xKZitiUnhsakFNQmdOVkhSTUJBZjhFQWpBQU1COEdBMVVkDQpJd1FZTUJhQUZCNndEMGlYMzlERFo2ZEdoRHRZTzRnTlU1U0dNSDhHQTFVZEh3UjRNSFl3ZEtBam9DR0dIMmgwZEhBNkx5OWpjbXd1DQpZbXRoZG1OaExuWnVMMEpyWVhaRFFTNWpjbXlpVGFSTE1Fa3hEekFOQmdOVkJBTU1Ca0pyWVhaRFFURVpNQmNHQTFVRUNnd1FRbXRoDQpkaUJEYjNKd2IzSmhkR2x2YmpFT01Bd0dBMVVFQnd3RlNHRnViMmt4Q3pBSkJnTlZCQVlUQWxaT01BNEdBMVVkRHdFQi93UUVBd0lFDQo4REF6QmdOVkhTVUVMREFxQmdnckJnRUZCUWNEQVFZSUt3WUJCUVVIQXdJR0NDc0dBUVVGQndNRUJnb3JCZ0VFQVlJM0NnTU1NQTBHDQpDU3FHU0liM0RRRUJCUVVBQTRJQkFRQ1NCTndOVW5TaTJ6MUtLK1A1Q3VkZ1NpYktJeklvdmxmMDJhMUhIK1MxZnFUVmdzNTRwV0d3DQpFRndBWHBqb2FBdU5kN2hqR1dMckVGRHFISmc2ZGNTcGFzVmlDdWFGMTYrZEluU2hhelY2Q1ZOeDRaMXZseXVIbzBEUHJFekRvVUdzDQpHZ0Zvc3R0NHIzZDVnblhuSWhrSGdyZDdsbWxPNnEyYVp6STM0TUc2aHlZNVd4em5nZm9NNjBuTzdnVnhwL3Rmb2VFMGhFUTQ3QW5QDQpxNDBvd0k0QXlVL3VyNEQza2pDbEttWHIycHV1Szk4ZUxVTWZhVUNlMTJrMlo3d0ROWnc4eFZDbVhRZ09yaEt5ME1kV1RYSzlFcFM3DQo4VEJkUmNlcjc2blZvRDFnMG5pc2dmL0FkbHo1Vmp4ZlVJdmcxWmRzdkFKNXdncmRoU0xVM2ZYdkZXNEw8L1g1MDlDZXJ0aWZpY2F0ZT48WDUwOUNlcnRpZmljYXRlPk1JSUVOekNDQXgrZ0F3SUJBZ0lLWVFyeFZBQUFBQUFBRHpBTkJna3Foa2lHOXcwQkFRVUZBREIrTVFzd0NRWURWUVFHRXdKV1RqRXoNCk1ERUdBMVVFQ2hNcVRXbHVhWE4wY25rZ2IyWWdTVzVtYjNKdFlYUnBiMjRnWVc1a0lFTnZiVzExYm1sallYUnBiMjV6TVJzd0dRWUQNClZRUUxFeEpPWVhScGIyNWhiQ0JEUVNCRFpXNTBaWEl4SFRBYkJnTlZCQU1URkUxSlF5Qk9ZWFJwYjI1aGJDQlNiMjkwSUVOQk1CNFgNCkRURTFNRFV4TlRBek1qVTBPRm9YRFRJd01EVXhOVEF6TXpVME9Gb3dTVEVMTUFrR0ExVUVCaE1DVms0eERqQU1CZ05WQkFjVEJVaGgNCmJtOXBNUmt3RndZRFZRUUtFeEJDYTJGMklFTnZjbkJ2Y21GMGFXOXVNUTh3RFFZRFZRUURFd1pDYTJGMlEwRXdnZ0VpTUEwR0NTcUcNClNJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUREall5MkJ6bzVyMzN2bHdZVHA3cXhXeDRkcGZwaXphZjZlUTZ4ekVEUGVSUU4NCmptbVc2L1JGZzNkMXR2OGtjU1dXeDZLaHVtSUx6elpkdmZFUlhNa1FwVEd1ZXFxMzV6RzdkOUdVbGttSVZEeWNRNFZ3dm94cTlNVFcNCk5uclFzWW4vQVJxaXgxdUUwWk9zWW55YzNjY1NpMHJLWmtnT3J5QkdYVWRrbXV6SE8xWE1rOElHTjJBTGhnMElyMGxZK0RkQ200dGUNCmVhc2Iwc1lkY2JVRHdISlB0ZzFrRUplMVQybVhTd1lDTkhCdjdMZzdpbkMrQVJmeG9DMEFsYUhhWlVQekhIQm1XdHlKUjJXSHd1WXANCkRNRTRSbThOSnUwb2ZHN0IrTm5aZ3ExczJhR0tYbTRjeDRFOTV4UEpudkszZTZ3bmp4YUE1LzNYQ1phL0dXUWxCUkkxQWdNQkFBR2oNCmdlc3dnZWd3RWdZRFZSMFRBUUgvQkFnd0JnRUIvd0lCQURBTEJnTlZIUThFQkFNQ0FZWXdIUVlEVlIwT0JCWUVGQjZ3RDBpWDM5REQNClo2ZEdoRHRZTzRnTlU1U0dNQjhHQTFVZEl3UVlNQmFBRk0xaWNlUmh2ZjQ5N0xKQVlOT0JkZDA2ckd2R01Ed0dBMVVkSHdRMU1ETXcNCk1hQXZvQzJHSzJoMGRIQTZMeTl3ZFdKc2FXTXVjbTl2ZEdOaExtZHZkaTUyYmk5amNtd3ZiV2xqYm5KallTNWpjbXd3UndZSUt3WUINCkJRVUhBUUVFT3pBNU1EY0dDQ3NHQVFVRkJ6QUNoaXRvZEhSd09pOHZjSFZpYkdsakxuSnZiM1JqWVM1bmIzWXVkbTR2WTNKMEwyMXANClkyNXlZMkV1WTNKME1BMEdDU3FHU0liM0RRRUJCUVVBQTRJQkFRQlVlVW11citrYjhwWlVvdmlwU2JySFRUTjFYaXpRSVhha2w0b1gNClpWRk9wemFUTm5TUVdOTkFvNk1jVU5GMk5MMXE0eEdlRmNxYm53YzFkWUdqYWpyeDBTZmFLbzJGa2JoNjU2V2J4R1QxbXFFL3V3aisNCnhzK3o5ZGdjckwrelNTVCtoR2thdWN0YUFKS0xaVFlBYlNILzRWMWVkZEM3ZTBiUElWbzVpbk5ZUml2UHkxTUl1dzRORkdoOXM4bWwNCm5zUDZiaVcwaHQ4ZXJuTXg1WUhuUWZ3ZE0rSythcnpkaUpETHpyTlBSZm83Z1N5NTBjM2tKamZVRll4YlNkZ1RVWENERFc3bjR4WTUNCm90UE44Qk5DQTJURGJiSHNtYkpYdjNSYTVCMnJlNzM0YjBGUG16ejFCYW5ZT2FtMk5BbzcreUg3NWNKaFlpZUpSNk5zd3NoZGtTekM8L1g1MDlDZXJ0aWZpY2F0ZT48WDUwOUNlcnRpZmljYXRlPk1JSUQxekNDQXIrZ0F3SUJBZ0lRRytSemloOCt3STlIbjZiUE5jV1lJakFOQmdrcWhraUc5dzBCQVFVRkFEQitNUXN3Q1FZRFZRUUcNCkV3SldUakV6TURFR0ExVUVDaE1xVFdsdWFYTjBjbmtnYjJZZ1NXNW1iM0p0WVhScGIyNGdZVzVrSUVOdmJXMTFibWxqWVhScGIyNXoNCk1Sc3dHUVlEVlFRTEV4Sk9ZWFJwYjI1aGJDQkRRU0JEWlc1MFpYSXhIVEFiQmdOVkJBTVRGRTFKUXlCT1lYUnBiMjVoYkNCU2IyOTANCklFTkJNQjRYRFRBNE1EVXhOakF4TVRJME9Wb1hEVFF3TURVeE5qQXhNakF6TWxvd2ZqRUxNQWtHQTFVRUJoTUNWazR4TXpBeEJnTlYNCkJBb1RLazFwYm1semRISjVJRzltSUVsdVptOXliV0YwYVc5dUlHRnVaQ0JEYjIxdGRXNXBZMkYwYVc5dWN6RWJNQmtHQTFVRUN4TVMNClRtRjBhVzl1WVd3Z1EwRWdRMlZ1ZEdWeU1SMHdHd1lEVlFRREV4Uk5TVU1nVG1GMGFXOXVZV3dnVW05dmRDQkRRVENDQVNJd0RRWUoNCktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQUtFL1dWRU8vakQvWWR1V2VCU0wyME04TnI1aHI5eTFQMkFlMHcwQlFhMzQNCnlZcENqc2p0TW9aSHhmNjE5K3JXUkRjUUVzTklDRkZRdXVWWDZjNDF5WTRjY3dtRk0wemh1emlzanEyM0V3UXVab0ZYTGN6N0d2MHUNCm5JdjlDVUR3WUJlYmNVVnRmZVBiS3RLN210M3J6RjdrQU4vVmJEQ0ZtNzFYZnkzVUpOT0ErK0FvVWI2dzFtRUh6T1dnUitlUmJTK0gNCldPaTByY0d4UnJQY1doMDRDZG43dFNlWW5sNzg4ZlJJLytpaE8vOVFNOWttcTdLWllwM01lOGhTVFo1Y1FvdHZkSDc4bEJQZUN0THcNCnRXcjRsa3hRbk9ZaGpzSGxsd0ZPelord1FCbDhHMWx2WERnWm1qZmEwWUU1RmpMdmdhMndJV3NSbDhMQkNMMXZJMXdFRDlNQ0F3RUENCkFhTlJNRTh3Q3dZRFZSMFBCQVFEQWdHR01BOEdBMVVkRXdFQi93UUZNQU1CQWY4d0hRWURWUjBPQkJZRUZNMWljZVJodmY0OTdMSkENCllOT0JkZDA2ckd2R01CQUdDU3NHQVFRQmdqY1ZBUVFEQWdFQU1BMEdDU3FHU0liM0RRRUJCUVVBQTRJQkFRQk1uYzErSXlDQUhDalANCjhQSEozeEhLc21sVG8vSmZETE5sbkM5VTRSeFFLdUJWRjhRWHZxaVRVVWFxaHUwa1pDOVBFNDZ3dEJTY2ZFTytMVTVqVW16YjFuQVgNCldVZGJvbHF6eDVaNnRnMzFMUTNaWkRxdjBGUTYwUk5vdHZvNERnWHI0UHd3OTB5YlgrTHVaM3Y0WXVwMHIzSlVUTlQ2WG92czY3Z24NCmdTeVlqdmZLb0ZHV2M4WVhpZm4wVTVjL1Y4UGJWU2hKYzA5S055cG5oTVVUdnNiSjdnbEhZcitvc3VwODVWOGsyenU0ZERXdzRZV1ANCmlwZElqdWQ0WjRuTDVhUUM3RnRYb2JuSGxyZkI2ZVZkanBtbXB5V2FIYkRPMWp0ck0vSytTZUV0MW9lQnVYYXVwL3pOczhaMk1xOU4NClVGSnNMUTJ5dmRkUTVkTjFZNTlkelFxWjwvWDUwOUNlcnRpZmljYXRlPjwvWDUwOURhdGE+PC9LZXlJbmZvPjwvU2lnbmF0dXJlPjwvTGljZW5zZT4=";

export default { ObjXmlSigner, XML_SIGNING_TYPE, licenseKey, SET_USE_PKCS11, HASH_ALGORITHM, ObjVerifier, VERIFY_TYPE };