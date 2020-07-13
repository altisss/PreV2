// Phần mềm BkavCA Signer Plugin mở rộng tính năng cho trình duyệt: Chrome, Firefox, IE, ... gọi tắt là plugin
/*
 Copyright 2018 BkavCoreCA By VietPDb

 */

// hàm gọi brower ký xmlFile
function FileBrowser(filter, jsCallback) {
    try {
            BkavCAPlugin.FileBrowser(filter, jsCallback);  // Plugin sẽ tự gọi lại hàm GetCertResult để trả kết quả      
    }
    catch (e) {
        alert(e)
    }
}



var jsonCert;
function selectChange() {
    var val = $("#selectCert option:selected").text();
    var count = 0;
    for (var key in jsonCert)
        if (jsonCert.hasOwnProperty(key))
            count++;
    for (var i = 0; i < count; i++) {
        if (val == jsonCert[i].SubjectDN.CN) {
            document.getElementById('selectCertIssuer').value = "Nhà cung cấp: " + jsonCert[i].IssuerDN.CN;
            document.getElementById('selectCertIssuer').innerHTML = "Nhà cung cấp: " + jsonCert[i].IssuerDN.CN;
            document.getElementById('selectCertSerial').value = "Số serial: " + jsonCert[i].SerialNumber;
            document.getElementById('selectCertSerial').innerHTML = "Số serial: " + jsonCert[i].SerialNumber;
            document.getElementById('selectCertExpire').value = "Ngày hết hạn: " + jsonCert[i].TimeValidTo;
            document.getElementById('selectCertExpire').innerHTML = "Ngày hết hạn: " + jsonCert[i].TimeValidTo;
        }
    }
}


function GetCertResult(data) {
    var baseDecode = data;
    if (baseDecode == "MA==") {
        alert("The License does not include Utils Module");
        return;
    }    
    
        baseDecode = base64.decode(data);
    
    var x2js = new X2JS();
    var jsonObj = x2js.xml_str2json(baseDecode);

    var count = 0;
    jsonCert = jsonObj.Certificates.Certificate;
    for (var key in jsonCert)
        if (isNaN(key)) {
            if (key == "SerialNumber")
                count++;
        }
        else {
            if (jsonCert.hasOwnProperty(key))
                count++;
        }
    if (count > 0) {
        var elmnt = document.getElementById('selectCert');
        // -- add new by NTTam
        if (true) {return;}
        var numOption = elmnt.options.length
        var iRemove;
        for (iRemove = elmnt.options.length - 1 ; iRemove >= 0 ; iRemove--) {
            elmnt.remove(iRemove);
        }

        if (count == 1) {
            var option = document.createElement("option");
            option.text = jsonCert.SubjectDN.CN;
            elmnt.add(option);
            // console.log(jsonCert.SubjectDN);
            document.getElementById('selectCertIssuer').value = "Nhà cung cấp: " + jsonCert.IssuerDN.CN;
            document.getElementById('selectCertIssuer').innerHTML = "Nhà cung cấp: " + jsonCert.IssuerDN.CN;
            document.getElementById('selectCertSerial').value = "Số serial: " + jsonCert.SerialNumber;
            document.getElementById('selectCertSerial').innerHTML = "Số serial: " + jsonCert.SerialNumber;
            document.getElementById('selectCertExpire').value = "Ngày hết hạn: " + jsonCert.TimeValidTo;
            document.getElementById('selectCertExpire').innerHTML = "Ngày hết hạn: " + jsonCert.TimeValidTo;
        }
        else {
            for (var i = 0; i < count; i++) {
                var option = document.createElement("option");
                option.text = jsonCert[i].SubjectDN.CN;
                elmnt.add(option);
            }
            //  console.log(jsonCert.SubjectDN.S);

            document.getElementById('selectCertIssuer').value = "Nhà cung cấp: " + jsonCert[0].IssuerDN.CN;
            document.getElementById('selectCertIssuer').innerHTML = "Nhà cung cấp: " + jsonCert[0].IssuerDN.CN;
            document.getElementById('selectCertSerial').value = "Số serial: " + jsonCert[0].SerialNumber;
            document.getElementById('selectCertSerial').innerHTML = "Số serial: " + jsonCert[0].SerialNumber;
            document.getElementById('selectCertExpire').value = "Ngày hết hạn: " + jsonCert[0].TimeValidTo;
            document.getElementById('selectCertExpire').innerHTML = "Ngày hết hạn: " + jsonCert[0].TimeValidTo;
        }
    }
}



function GetCertListByFilter(jsCallback) {
    try {
        var objFilterCert = new ObjFilter();                            // Object filter
        //objFilterCert.Value = "2016/09/07 11:50:11";                                 // Giá trị lọc, mặc định là "" 
        //objFilterCert.Filter = INFO_CERT_FILTER.CERTIFICATE_TIMEVALID;  // Kiểu lọc: có các kiểu SerialNumber, SubjectCN, ....
        // Mặc định nếu không truyền vào thì sẽ lọc theo SerialNumber                 

        //objFilterCert.UsePKCS11 = false;                                // Sử dụng PKCS11 hoặc CSP để lấy thông tin Cert. Mặc định là dùng CSP
        // Nếu sử dụng PKCS11 thì chỉ lấy được thông tin cert có trong token, 
        // không lấy đc cert do người dùng tự cài trong máy

        objFilterCert.isOnlyCertFromToken = false;                      // Set việc: Chỉ lấy thông tin của cert có trong token hay lấy tất cả 
        // Việc set này Chỉ có tác dụng khi sử dụng CSP để lấy cert  

        objFilterCert.FunctionCallback = jsCallback;                 // Set hàm JS để plugin gọi lại
        var dllName = "BkavCA,BkavCAv2S";                               // Danh sách dll name. cần phải set nếu sử dụng PKCS11 để lấy cert

       
        BkavCAPlugin.SetLicenseKey(licenseKey);
        // BkavCAPlugin.SetHashAlgorithm(HASH_ALGORITHM.SHA256);
        BkavCAPlugin.SetHashAlgorithm(HASH_ALGORITHM.SHA1);
        //BkavCAPlugin.SetDLLName(dllName);                    // Set dll name nếu dùng PKCS11 để lấy cert. DÙng CSP thì k cần
        BkavCAPlugin.GetCertListByFilter(objFilterCert);     // Có thể bắt event để lấy kết quả nếu k dùng JS Callback
        //BkavCAPlugin.SetAddBase64Cert(ADD_BASE64CERT.YES);
       
       
    }
    catch (e) {
        alert(e)
    }
}

function GetAllCert() {
    var allCert;
    var filter = "SerialNumber"; // Có các filter: SerialNumber, IssuerCN, SubjectCN, ValidTo, ValidFrom
    var value = "";
    try {
      
            BkavCAPlugin.SetLicenseKey(licenseKey);
            // có 2 lựa chọn:
            //BkavCAPlugin.GetAllCert(filter, value);                // cần bắt event GetAllCert để lấy kết quả
            BkavCAPlugin.GetAllCert(filter, value, GetCertResult); // plugin sẽ gọi lại hàm GetCertResult để trả kết quả
    
       
    } catch (e) {
        alert(e);
    }
}

/************************************************************************/
/*  Hàm  CheckToken                                                     */
/*  Đầu vào: số serial của cert                                         */
/*  Mã trả về:                                                          */
/*      1: OK                                                           */
/*     -1: Có lỗi trong quá trình kt                                    */
/*      3: Token đang cắm không chứa cert có serial truyền vào          */
/*      4: Không cắm token nào                                          */
/*      5: Không tìm thầy dll PKCS11 (có thế do chưa truyền)            */
/************************************************************************/

function CheckTokenCallback(data) {
    var iRet = parseInt(data);
    var dataRet = "Lỗi không xác định";
    switch (iRet) {
        case 0:
            dataRet = "Không có quyền sử dụng chức năng này";
            alert("Không có quyền sử dụng chức năng này");
            break;
        case 1:
            dataRet = "Kiểm tra thành công";
            alert("Kiểm tra thành công");
            break;
        case -1:
            dataRet = "Có lỗi trong quá trình kiểm tra";
            alert("Có lỗi trong quá trình kiểm tra");
            break;
        case 3:
            dataRet = "Usb Token đang cắm không đúng";
            alert("Usb Token đang cắm không đúng");
            break;
        case 4:
            dataRet = "Không tìm thấy Token";
            alert("Không tìm thấy Token");
            break;
        case 5:
            dataRet = "Không tìm thấy PKCS#11 driver";
            alert("Không tìm thấy PKCS#11 driver");
            break;
        default:
            alert("Lỗi không xác định");
            break;
    }
    document.getElementById("checkTokenRet").value = dataRet;
    document.getElementById("checkTokenRet").innerHTML = dataRet;
}
function CheckToken() {
    var iRet;
    var dllName = "bkavcaetoken,bkavcsp,BkavCA,BkavCAv2S";
    var serial = document.getElementById('selectCertSerial').value.substring("Số serial: ".length, document.getElementById('selectCertSerial').value.length);
    
    if (serial == "") {
        alert("Nhập serial number");
        return;
    }
    try {
     
       
            BkavCAPlugin.SetDLLName(dllName);                // Nếu sử dụng PKCS11: thì PHẢI dùng hàm này để set danh sách 
            // tên dll để tìm token tương ứng
            // Có 2 lựa chọn cho hàm check token
            BkavCAPlugin.CheckToken(serial, CheckTokenCallback);   // Truyền vào serial và hàm JS callback: thì plugin sẽ tự gọi lại hàm JS để trả kết quả
       

    } catch (e) {
        alert(e);
    }
}
