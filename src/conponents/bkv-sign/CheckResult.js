/*
 Copyright 2018 BkavCoreCA By VietPDb

 */


function CheckVerifyResult (iRet)            
{
    var dataRet = "Lỗi không xác định";
    switch (iRet) {
        case 1:
            dataRet = "Xác thực thành công";
            alert("Xác thực thành công")
            break;
        case -1:
            dataRet = "Lỗi trong việc load tài liệu";
            alert("Lỗi trong việc load tài liệu");
            break;
        case -2:
            dataRet = "Không tìm thấy chữ ký trong tài liệu";
            alert("Không tìm thấy chữ ký trong tài liệu");
            break;
        case -3:
            dataRet = "Chữ ký không hợp lệ";
            alert("Chữ ký không hợp lệ");
            break;
        case -4:
            dataRet = "Dữ liệu ký đã bị thay đổi";
            alert("Dữ liệu ký đã bị thay đổi");
            break;
        case -5:
            dataRet = "Chứng thư hết hạn";
            alert("Chứng thư hết hạn");
            break;
        case -6:
            dataRet = "Chứng thư đã bị thu hồi";
            alert("Chứng thư đã bị thu hồi");
            break;
        case -7:
            dataRet = "Chứng thư không có quyền ký dữ liệu";
            alert("Chứng thư không có quyền ký dữ liệu");
            break;
        case -8:
            dataRet = "Kiểm tra trusted path thất bại";
            alert("Kiểm tra trusted path thất bại");
            break;
        case -9:
            dataRet = "Không lấy được chứng thư số từ token";
            alert("Không lấy được chứng thư số từ token");
            break;
        case -10:
            dataRet = "Không decode được base64 của CTS";
            alert("Không decode được base64 của CTS");
            break;
        case -11:
            dataRet = "Có lỗi trong việc chuyển đổi thời gian";
            alert("Có lỗi trong việc chuyển đổi thời gian");
            break;
        case -12:
            dataRet = "Không thể kiểm tra trạng thái thu hồi của CTS";
            alert("Không thể kiểm tra trạng thái thu hồi của CTS");
            break;
        default:
            alert("Lỗi không xác định");
            break;
    }
    document.getElementById("verifyingRet").value = dataRet;
    document.getElementById("verifyingRet").innerHTML = dataRet;
}
function getDateTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    if (month.toString().length == 1) {
        var month = '0' + month;
    }
    if (day.toString().length == 1) {
        var day = '0' + day;
    }
    if (hour.toString().length == 1) {
        var hour = '0' + hour;
    }
    if (minute.toString().length == 1) {
        var minute = '0' + minute;
    }
    if (second.toString().length == 1) {
        var second = '0' + second;
    }
    var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    return dateTime;
}
export default {getDateTime} ;