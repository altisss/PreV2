// Phần mềm BkavCA Signer Plugin mở rộng tính năng cho trình duyệt: Chrome, Firefox, IE, ... gọi tắt là plugin
/*
 Copyright 2018 BkavCoreCA By VietPDb

 */

import BkavCAPlugin from './BkavCAPlugin';
import ObjXmlSigner from './BkavCAPlugin';
import licenseKey from './BkavCAPlugin';
import SET_USE_PKCS11 from './BkavCAPlugin';
import HASH_ALGORITHM from './BkavCAPlugin';
import VERIFY_TYPE from './BkavCAPlugin';
import ObjVerifier from './BkavCAPlugin';
import XML_SIGNING_TYPE from './BkavCAPlugin';
import getDateTime  from "./CheckResult";

var dllName = "BkavCA,BkavCAv2S";

function SignXML(xmlPathIn, serialNumber, jsCallback) {

    var objXml = new ObjXmlSigner();                       // Object xml 
    if (serialNumber == "") {
        alert("Nhập serial number");
        return;
    }
    if (xmlPathIn == "" || undefined == xmlPathIn) {
        alert("Bạn chưa nhập XML");
        return;
    }
  
    objXml.Base64String = xmlPathIn; 
    objXml.CertificateSerialNumber = serialNumber;      //1         // serial
    objXml.SigningType = XML_SIGNING_TYPE.SIGN_XML_BASE64;   // chọn kiểu ký: ký file, ký xml base64, ký xml xpath base64
    objXml.FunctionCallback = jsCallback;  //  Kết quả ký sẽ được plugin tự động trả về paramater của hàm này 
    objXml.SigningTime = "2015/04/08 22:50:11";          //1  // ngày ký (phải đúng format yyyy/mm/dd h:m:s)
    try {

        BkavCAPlugin.SetLicenseKey(licenseKey);       
       BkavCAPlugin.SetUsePKCS11(SET_USE_PKCS11.YES);
      
        BkavCAPlugin.SetDLLName(dllName);
        BkavCAPlugin.SetHashAlgorithm(HASH_ALGORITHM.SHA1);
        BkavCAPlugin.SetPINCache(0,0,0);
       
        BkavCAPlugin.SignXML(objXml);
       
    } catch (e) {
        alert(e);
    }
}
// VerifyXML
function VerifyXML(xmlFile, jsCallback) {
    var timeCheck = "2015/09/17 14:11:11"; //2016/08/01 17:18:32
    timeCheck = getDateTime();
    var iRet;   
    if (xmlFile == "" || undefined == xmlFile) {
        alert("Bạn chưa nhập nội dung cần xác thực");
        return;
    }
    if (timeCheck == "" || undefined == timeCheck) {
        alert("Bạn chưa nhập thời gian");
        return;
    }
    try {
        var objVerifyXML = new ObjVerifier();
        objVerifyXML.PathFileInput = xmlFile;
        objVerifyXML.TimeCheck = timeCheck;
        objVerifyXML.VerifyType = VERIFY_TYPE.VERYFY_FILE;
        objVerifyXML.FunctionCallback = jsCallback;  //  Kết quả ký sẽ được plugin tự động trả về paramater của hàm này 
        BkavCAPlugin.SetLicenseKey(licenseKey);
        BkavCAPlugin.SetHashAlgorithm(HASH_ALGORITHM.SHA256);
        BkavCAPlugin.VerifyXML(objVerifyXML);
        
    } catch (e) {
        alert(e);
    }
}

export default {SignXML}; 

