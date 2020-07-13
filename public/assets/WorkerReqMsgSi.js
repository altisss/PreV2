self.msgUpd;
self.changeList = '';
self.changeArr = [];

self.onmessage = function (event) {
  const msgInfo = JSON.parse(event.data);
  self.msgUpd = {};
  self.changeList = '';
  // console.log('End Web worker - msgInfo: ' + JSON.stringify(msgInfo));
  if (msgInfo['1'] === 'SI') {
    self.updSI_Msg2MrkInfoMap(msgInfo['2'], msgInfo['3'], msgInfo['4'], msgInfo['5']);
  } else if (msgInfo['1'] === 'TP') {
    self.updTP_Msg2MrkInfoMap(msgInfo['2'], msgInfo['3'], msgInfo['4'], msgInfo['5']);
  }
  let obj = {
    '1': self.msgUpd,
    '2': self.changeList,
    '3': self.changeArr,
    '4': msgInfo['4'],
    '5': msgInfo['5']
  };
  // console.log('End Web worker - self.msgUpd: ' + JSON.stringify(self.msgUpd));
  // console.log('End Web worker - self.changeList: ' + self.changeList);
  postMessage(JSON.stringify(obj));
};

// -- msgObj: message mới nhận, stkMsgObj: cũ gần nhất --
self.updSI_Msg2MrkInfoMap = (msgObj, stkMsgObj, clientSeq, mskey) => {
  // console.log('Web worker - msgObj: ' + JSON.stringify(msgObj));
  // console.log('Web worker - stkMsgObj: ' + JSON.stringify(stkMsgObj));
  // console.log('Web worker - clientSeq: ' + clientSeq);
  // console.log('Web worker - mskey: ' + mskey);
  if (msgObj.seq >= stkMsgObj.seq) {
    let ls_unit_change = '';
    const changList = [];
    if (stkMsgObj.itemName != null && stkMsgObj.itemName !== undefined) {
      if (stkMsgObj.t31 === undefined) { stkMsgObj.t31 = 0; }
      if (msgObj.t31 === undefined) { msgObj.t31 = 0; }
      if (stkMsgObj.t31 !== msgObj.t31) {// -- Giá khớp hiện tại
        ls_unit_change = ls_unit_change + 't31' + ':' + stkMsgObj.t31 + ':' + msgObj.t31 + '|';
        changList.push('t31');
      }

      if (stkMsgObj.t32 === undefined) { stkMsgObj.t32 = 0; }
      if (msgObj.t32 === undefined) { msgObj.t32 = 0; }
      if (stkMsgObj.t32 !== msgObj.t32) {// -- Khối lượng khớp
        ls_unit_change = ls_unit_change + 't32' + ':' + stkMsgObj.t32 + ':' + msgObj.t32 + '|';
        changList.push('t32');
      }

      if (stkMsgObj.t137 == null || stkMsgObj.t137 === undefined) { stkMsgObj.t137 = 0; }
      if (msgObj.t137 == null || msgObj.t137 === undefined) { msgObj.t137 = 0; }
      if (stkMsgObj.t137 !== msgObj.t137) {// -- Giá mở cửa  
        ls_unit_change = ls_unit_change + 't137' + ':' + stkMsgObj.t260 + ':' + msgObj.t137 + '|';
        changList.push('t137');
      }

      if (stkMsgObj.t631 == null || stkMsgObj.t631 === undefined) { stkMsgObj.t631 = 0; }
      if (msgObj.t631 == null || msgObj.t631 === undefined) { msgObj.t631 = 0; }
      if (stkMsgObj.t631 !== msgObj.t631) {// -- Giá trung bình   
        ls_unit_change = ls_unit_change + 't631' + ':' + stkMsgObj.t260 + ':' + msgObj.t631 + '|';
        changList.push('t631');
      }

      if (stkMsgObj.t266 == null || stkMsgObj.t266 === undefined) { stkMsgObj.t266 = 0; }
      if (msgObj.t266 == null || msgObj.t266 === undefined) { msgObj.t266 = 0; }
      if (stkMsgObj.t266 !== msgObj.t266) {// -- Giá cao  
        ls_unit_change = ls_unit_change + 't266' + ':' + stkMsgObj.t260 + ':' + msgObj.t266 + '|';
        changList.push('t266');
      }

      if (stkMsgObj.t2661 == null || stkMsgObj.t2661 === undefined) { stkMsgObj.t2661 = 0; }
      if (msgObj.t2661 == null || msgObj.t2661 === undefined) { msgObj.t2661 = 0; }
      if (stkMsgObj.t2661 !== msgObj.t2661) {// -- Giá thấp 
        ls_unit_change = ls_unit_change + 't2661' + ':' + stkMsgObj.t260 + ':' + msgObj.t2661 + '|';
        changList.push('t2661');
      }

      if (stkMsgObj.t397 == null || stkMsgObj.t397 === undefined) { stkMsgObj.t397 = 0; }
      if (msgObj.t397 == null || msgObj.t397 === undefined) { msgObj.t397 = 0; }
      if (stkMsgObj.t397 !== msgObj.t397) {// -- NDTNN mua
        ls_unit_change = ls_unit_change + 't397' + ':' + stkMsgObj.t397 + ':' + msgObj.t397 + '|';
        changList.push('t397');
      }

      if (stkMsgObj.t398 == null || stkMsgObj.t398 === undefined) { stkMsgObj.t398 = 0; }
      if (msgObj.t398 == null || msgObj.t398 === undefined) { msgObj.t398 = 0; }
      if (stkMsgObj.t398 !== msgObj.t398) {// -- NDTNN bán
        ls_unit_change = ls_unit_change + 't398' + ':' + stkMsgObj.t398 + ':' + msgObj.t398 + '|';
        changList.push('t398');
      }

      if (stkMsgObj.t3301 == null || stkMsgObj.t3301 === undefined) { stkMsgObj.t3301 = 0; }
      if (msgObj.t3301 == null || msgObj.t3301 === undefined) { msgObj.t3301 = 0; }
      if (stkMsgObj.t3301 !== msgObj.t3301) {// -- NDTNN Room
        ls_unit_change = ls_unit_change + 't3301' + ':' + stkMsgObj.t3301 + ':' + msgObj.t3301 + '|';
        changList.push('t3301');
      }

      if (stkMsgObj.t139 == null || stkMsgObj.t139 === undefined) { stkMsgObj.t139 = 0; }
      if (msgObj.t139 == null || msgObj.t139 === undefined) { msgObj.t139 = 0; }
      if (stkMsgObj.t139 !== msgObj.t139) {
        ls_unit_change = ls_unit_change + 't139' + ':' + stkMsgObj.t139 + ':' + msgObj.t139 + '|';
        changList.push('t139');
      }

      if (stkMsgObj.t387 == null || stkMsgObj.t387 === undefined) { stkMsgObj.t387 = 0; }
      if (msgObj.t387 == null || msgObj.t387 === undefined) { msgObj.t387 = 0; }
      if (stkMsgObj.t387 !== msgObj.t387) {
        ls_unit_change = ls_unit_change + 't387' + ':' + stkMsgObj.t387 + ':' + msgObj.t387 + '|';
        changList.push('t387');
      }

      if (stkMsgObj.t3871 == null || stkMsgObj.t3871 === undefined) { stkMsgObj.t3871 = 0; }
      if (msgObj.t3871 == null || msgObj.t3871 === undefined) { msgObj.t3871 = 0; }
      if (stkMsgObj.t3871 !== msgObj.t3871) {
        ls_unit_change = ls_unit_change + 't3871' + ':' + stkMsgObj.t3871 + ':' + msgObj.t3871 + '|';
        changList.push('t3871');
      }

      if (stkMsgObj.t3981 == null || stkMsgObj.t3981 === undefined) { stkMsgObj.t3981 = 0; }
      if (msgObj.t3981 == null || msgObj.t3981 === undefined) { msgObj.t3981 = 0; }
      if (stkMsgObj.t3981 !== msgObj.t3981) {
        ls_unit_change = ls_unit_change + 't3981' + ':' + stkMsgObj.t3981 + ':' + msgObj.t3981 + '|';
        changList.push('t3981');
      }

      if (stkMsgObj.t3971 == null || stkMsgObj.t3971 === undefined) { stkMsgObj.t3971 = 0; }
      if (msgObj.t3971 == null || msgObj.t3971 === undefined) { msgObj.t3971 = 0; }
      if (stkMsgObj.t3971 !== msgObj.t3971) {
        ls_unit_change = ls_unit_change + 't3971' + ':' + stkMsgObj.t3971 + ':' + msgObj.t3971 + '|';
        changList.push('t3971');
      }

      if (stkMsgObj.t332 == null || stkMsgObj.t332 === undefined) { stkMsgObj.t332 = 0; }
      if (msgObj.t332 == null || msgObj.t332 === undefined) { msgObj.t332 = 0; }
      if (stkMsgObj.t332 !== msgObj.t332) {
        changList.push('t332');
      }
      if (stkMsgObj.t333 == null || stkMsgObj.t333 === undefined) { stkMsgObj.t333 = 0; }
      if (msgObj.t333 == null || msgObj.t333 === undefined) { msgObj.t333 = 0; }
      if (stkMsgObj.t333 !== msgObj.t333) {
        changList.push('t333');
      }
      if (stkMsgObj.t333 == null || stkMsgObj.t333 === undefined) { stkMsgObj.t333 = 0; }
      if (msgObj.t260 == null || msgObj.t260 === undefined) { msgObj.t260 = 0; }
      if (stkMsgObj.t260 !== msgObj.t260) {
        changList.push('t260');
      }
      changListLength = changList.length;
      if (changList.length === 0) {
        // console.log('Web worker vào 1 changList.length === 0');
        // --this.glbStore.msgQuese;
        return;
      }
      self.changeArr = changList;
      // -- Xét màu t31 - giá khớp hiện tại
      if (msgObj.t31 === 0 || msgObj.t31 === undefined || Math.round(msgObj.t31 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
        msgObj.t31_color = 'price_basic_color';
      } else if (Math.round(msgObj.t31 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t31 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
          msgObj.t31_color = 'price_ceil_color';
        } else {
          msgObj.t31_color = 'price_basic_over';
        }
      } else if (Math.round(msgObj.t31 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t31 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
          msgObj.t31_color = 'price_floor_color';
        } else {
          msgObj.t31_color = 'price_basic_less';
        }
      }
      // -- Xét màu t31mb - giá khớp hiện tại mobile
      if (msgObj.t31 === 0 || msgObj.t31 === undefined || msgObj.t31 === msgObj.t260) {
        msgObj.t31mb_color = 'price_basic_color_mb';
      } else if (msgObj.t31 > msgObj.t260) {
        if (msgObj.t31 === msgObj.t332) {
          msgObj.t31mb_color = 'price_ceil_color_mb';
        } else {
          msgObj.t31mb_color = 'price_basic_over_mb';
        }
      } else if (Math.round(msgObj.t31 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t31 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
          msgObj.t31mb_color = 'price_floor_color_mb';
        } else {
          msgObj.t31mb_color = 'price_basic_less_mb';
        }
      }// -- end xet mau t31mb
      // -- Xét màu t132_3 - Dư mua 3
      if (Math.round(msgObj.t132_3 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
        msgObj.t132_3_color = 'price_basic_color';
      } else if (Math.round(msgObj.t132_3 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t132_3 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
          msgObj.t132_3_color = 'price_ceil_color';
        } else {
          msgObj.t132_3_color = 'price_basic_over';
        }
      } else if (Math.round(msgObj.t132_3 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t132_3 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
          msgObj.t132_3_color = 'price_floor_color';
        } else {
          msgObj.t132_3_color = 'price_basic_less';
        }
      }
      // -- Xét màu t132_2 - Dư mua 2
      if (Math.round(msgObj.t132_2 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
        msgObj.t132_2_color = 'price_basic_color';
      } else if (Math.round(msgObj.t132_2 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t132_2 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
          msgObj.t132_2_color = 'price_ceil_color';
        } else {
          msgObj.t132_2_color = 'price_basic_over';
        }
      } else if (Math.round(msgObj.t132_2 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t132_2 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
          msgObj.t132_2_color = 'price_floor_color';
        } else {
          msgObj.t132_2_color = 'price_basic_less';
        }
      }
      // -- Xét màu t132_1 - Dư mua 1
      if (Math.round(msgObj.t132_1 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
        msgObj.t132_1_color = 'price_basic_color';
      } else if (Math.round(msgObj.t132_1 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
        if (msgObj.t132_1 === 777777710000 || msgObj.t132_1 === 777777720000) {
          msgObj.t132_1_color = 'defaultColor';
        } else if (Math.round(msgObj.t132_1 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
          msgObj.t132_1_color = 'price_ceil_color';
        } else {
          msgObj.t132_1_color = 'price_basic_over';
        }
      } else if (Math.round(msgObj.t132_1 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t132_1 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
          msgObj.t132_1_color = 'price_floor_color';
        } else {
          msgObj.t132_1_color = 'price_basic_less';
        }
      }
      // -- Xét màu t133_1 - Dư bán 1 (t332 == trần, t333 = sàn)
      if (Math.round(msgObj.t133_1 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
        msgObj.t133_1_color = 'price_basic_color';
      } else if (Math.round(msgObj.t133_1 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
        if (msgObj.t133_1 === 777777710000 || msgObj.t133_1 === 777777720000) {
          msgObj.t133_1_color = 'defaultColor';
        } else if (Math.round(msgObj.t133_1 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
          msgObj.t133_1_color = 'price_ceil_color';
        } else {
          msgObj.t133_1_color = 'price_basic_over';
        }
      } else if (Math.round(msgObj.t133_1 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
        if (msgObj.t133_1 === msgObj.t333) {
          msgObj.t133_1_color = 'price_floor_color';
        } else {
          msgObj.t133_1_color = 'price_basic_less';
        }
      }
      // -- Xét màu t133_2 - Dư bán 2
      if (Math.round(msgObj.t133_2 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
        msgObj.t133_2_color = 'price_basic_color';
      } else if (Math.round(msgObj.t133_2 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t133_2 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
          msgObj.t133_2_color = 'price_ceil_color';
        } else {
          msgObj.t133_2_color = 'price_basic_over';
        }
      } else if (Math.round(msgObj.t133_2 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t133_2 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
          msgObj.t133_2_color = 'price_floor_color';
        } else {
          msgObj.t133_2_color = 'price_basic_less';
        }
      }
      // -- Xét màu t133_3 - Dư bán 3
      if (Math.round(msgObj.t133_3 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
        msgObj.t133_3_color = 'price_basic_color';
      } else if (Math.round(msgObj.t133_3 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t133_3 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
          msgObj.t133_3_color = 'price_ceil_color';
        } else {
          msgObj.t133_3_color = 'price_basic_over';
        }
      } else if (Math.round(msgObj.t133_3 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
        if (Math.round(msgObj.t133_3 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
          msgObj.t133_3_color = 'price_floor_color';
        } else {
          msgObj.t133_3_color = 'price_basic_less';
        }
      }

      // -- Xét màu t137 -- Giá mở cửa --------------------
      if (msgObj.t137 === 0 || msgObj.t137 === msgObj.t260) {
        msgObj.t137_color = 'price_basic_color';
      } else if (msgObj.t137 > msgObj.t260) {
        if (msgObj.t137 === msgObj.t332) {
          msgObj.t137_color = 'price_ceil_color';
        } else {
          msgObj.t137_color = 'price_basic_over';
        }
      } else if (msgObj.t137 < msgObj.t260) {
        if (msgObj.t137 === msgObj.t333) {
          msgObj.t137_color = 'price_floor_color';
        } else {
          msgObj.t137_color = 'price_basic_less';
        }
      }
      // -- Xét màu t631 - Giá trung bình
      if (msgObj.t631 === 0 || msgObj.t631 === msgObj.t260) {
        msgObj.t631_color = 'price_basic_color';
      } else if (msgObj.t631 > msgObj.t260) {
        if (msgObj.t631 === msgObj.t332) {
          msgObj.t631_color = 'price_ceil_color';
        } else {
          msgObj.t631_color = 'price_basic_over';
        }
      } else if (msgObj.t631 < msgObj.t260) {
        if (msgObj.t631 === msgObj.t333) {
          msgObj.t631_color = 'price_floor_color';
        } else {
          msgObj.t631_color = 'price_basic_less';
        }
      }
      // -- Xét màu t266 - Gía cao
      if (msgObj.t266 === 0 || msgObj.t266 === msgObj.t260) {
        msgObj.t266_color = 'price_basic_color';
      } else if (msgObj.t266 > msgObj.t260) {
        if (msgObj.t266 === msgObj.t332) {
          msgObj.t266_color = 'price_ceil_color';
        } else {
          msgObj.t266_color = 'price_basic_over';
        }
      } else if (msgObj.t266 < msgObj.t260) {
        if (msgObj.t266 === msgObj.t333) {
          msgObj.t266_color = 'price_floor_color';
        } else {
          msgObj.t266_color = 'price_basic_less';
        }
      }
      // -- Xét màu t2661 - Gía thấp
      if (msgObj.t2661 === 0 || msgObj.t2661 === msgObj.t260) {
        msgObj.t2661_color = 'price_basic_color';
      } else if (msgObj.t2661 > msgObj.t260) {
        if (msgObj.t2661 === msgObj.t332) {
          msgObj.t2661_color = 'price_ceil_color';
        } else {
          msgObj.t2661_color = 'price_basic_over';
        }
      } else if (msgObj.t2661 < msgObj.t260) {
        if (msgObj.t2661 === msgObj.t333) {
          msgObj.t2661_color = 'price_floor_color';
        } else {
          msgObj.t2661_color = 'price_basic_less';
        }
      }
      // -- Xét màu t139 - Giá đóng cửa
      if (msgObj.t139 === 0 || msgObj.t139 === msgObj.t260) {
        msgObj.t139_color = 'price_basic_color';
      } else if (msgObj.t139 > msgObj.t260) {
        if (msgObj.t139 === msgObj.t332) {
          msgObj.t139_color = 'price_ceil_color';
        } else {
          msgObj.t139_color = 'price_basic_over';
        }
      } else if (msgObj.t139 < msgObj.t260) {
        if (msgObj.t139 === msgObj.t333) {
          msgObj.t139_color = 'price_floor_color';
        } else {
          msgObj.t139_color = 'price_basic_less';
        }
      }
      self.msgUpd = msgObj;
    } else {
      stkMsgObj.itemName = mskey;
      stkMsgObj.seq = msgObj.seq;
      stkMsgObj.U6 = msgObj.U6;
      stkMsgObj.U7 = msgObj.U7;
      stkMsgObj.U8 = msgObj.U8;
      stkMsgObj.U9 = msgObj.U9;
      stkMsgObj.U10 = msgObj.U10;
      stkMsgObj.U17 = msgObj.U17;
      stkMsgObj.U18 = msgObj.U18;
      stkMsgObj.t55 = msgObj.t55.trim();
      stkMsgObj.t260 = msgObj.t260;
      stkMsgObj.t333 = msgObj.t333;
      stkMsgObj.t332 = msgObj.t332;
      stkMsgObj.t31 = msgObj.t31;
      stkMsgObj.t32 = msgObj.t32;
      stkMsgObj.t137 = msgObj.t137; // -- Gia mo cua
      stkMsgObj.t139 = msgObj.t139; // -- Gia dong cua
      stkMsgObj.t387 = msgObj.t387; // -- Tong khoi luong giao dich
      stkMsgObj.t3871 = msgObj.t3871; // -- Tong gia tri giao dich
      stkMsgObj.t631 = msgObj.t631; // -- Gia khop trung binh
      stkMsgObj.t266 = msgObj.t266;
      stkMsgObj.t2661 = msgObj.t2661;
      stkMsgObj.t397 = msgObj.t397;
      stkMsgObj.t3971 = msgObj.t3971; // -- room NDTNN mua
      stkMsgObj.t398 = msgObj.t398;
      stkMsgObj.t3981 = msgObj.t3981; // -- room NDTNN ban
      stkMsgObj.t3301 = msgObj.t3301;

      // -- Xét màu t31 - giá khớp hiện tại
      if (stkMsgObj.t31 === 0 || stkMsgObj.t31 === undefined || Math.round(stkMsgObj.t31 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
        stkMsgObj.t31_color = 'price_basic_color';
      } else if (Math.round(stkMsgObj.t31 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t31 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
          stkMsgObj.t31_color = 'price_ceil_color';
        } else {
          stkMsgObj.t31_color = 'price_basic_over';
        }
      } else if (Math.round(stkMsgObj.t31 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t31 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
          stkMsgObj.t31_color = 'price_floor_color';
        } else {
          stkMsgObj.t31_color = 'price_basic_less';
        }
      }
      // -- Xét màu t132_3 - Dư mua 3
      if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
        stkMsgObj.t132_3_color = 'price_basic_color';
      } else if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
          stkMsgObj.t132_3_color = 'price_ceil_color';
        } else {
          stkMsgObj.t132_3_color = 'price_basic_over';
        }
      } else if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (stkMsgObj.t132_3 === stkMsgObj.t333) {
          stkMsgObj.t132_3_color = 'price_floor_color';
        } else {
          stkMsgObj.t132_3_color = 'price_basic_less';
        }
      }
      // -- Xét màu t132_2 - Dư mua 2
      if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
        stkMsgObj.t132_2_color = 'price_basic_color';
      } else if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
          stkMsgObj.t132_2_color = 'price_ceil_color';
        } else {
          stkMsgObj.t132_2_color = 'price_basic_over';
        }
      } else if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
          stkMsgObj.t132_2_color = 'price_floor_color';
        } else {
          stkMsgObj.t132_2_color = 'price_basic_less';
        }
      }
      // -- Xét màu t132_1 - Dư mua 1
      if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
        stkMsgObj.t132_1_color = 'price_basic_color';
      } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (stkMsgObj.t132_1 === 777777710000 || stkMsgObj.t132_1 === 777777720000) {
          stkMsgObj.t132_1_color = 'defaultColor';
        } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
          stkMsgObj.t132_1_color = 'price_ceil_color';
        } else {
          stkMsgObj.t132_1_color = 'price_basic_over';
        }
      } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
          stkMsgObj.t132_1_color = 'price_floor_color';
        } else {
          stkMsgObj.t132_1_color = 'price_basic_less';
        }
      }
      // -- Xét màu t133_1 - Dư bán 1
      if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
        stkMsgObj.t133_1_color = 'price_basic_color';
      } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (msgObj.t133_1 === 777777710000 || msgObj.t133_1 === 777777720000) {
          msgObj.t133_1_color = 'defaultColor';
        } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
          stkMsgObj.t133_1_color = 'price_ceil_color';
        } else {
          stkMsgObj.t133_1_color = 'price_basic_over';
        }
      } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
          stkMsgObj.t133_1_color = 'price_floor_color';
        } else {
          stkMsgObj.t133_1_color = 'price_basic_less';
        }
      }
      // -- Xét màu t133_2 - Dư bán 2
      if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
        stkMsgObj.t133_2_color = 'price_basic_color';
      } else if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
          stkMsgObj.t133_2_color = 'price_ceil_color';
        } else {
          stkMsgObj.t133_2_color = 'price_basic_over';
        }
      } else if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
          stkMsgObj.t133_2_color = 'price_floor_color';
        } else {
          stkMsgObj.t133_2_color = 'price_basic_less';
        }
      }
      // -- Xét màu t133_3 - Dư bán 1
      if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
        stkMsgObj.t133_3_color = 'price_basic_color';
      } else if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
          stkMsgObj.t133_3_color = 'price_ceil_color';
        } else {
          stkMsgObj.t133_3_color = 'price_basic_over';
        }
      } else if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
        if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
          stkMsgObj.t133_3_color = 'price_floor_color';
        } else {
          stkMsgObj.t133_3_color = 'price_basic_less';
        }
      }

      // -- Xét màu t137 -- Giá mở cửa
      if (stkMsgObj.t137 === 0 || stkMsgObj.t137 === stkMsgObj.t260) {
        stkMsgObj.t137_color = 'price_basic_color';
      } else if (stkMsgObj.t137 > stkMsgObj.t260) {
        if (stkMsgObj.t137 === stkMsgObj.t332) {
          stkMsgObj.t137_color = 'price_ceil_color';
        } else {
          stkMsgObj.t137_color = 'price_basic_over';
        }
      } else if (stkMsgObj.t137 < stkMsgObj.t260) {
        if (stkMsgObj.t137 === stkMsgObj.t333) {
          stkMsgObj.t137_color = 'price_floor_color';
        } else {
          stkMsgObj.t137_color = 'price_basic_less';
        }
      }
      // -- Xét màu t631 - Giá trung bình
      if (stkMsgObj.t631 === 0 || stkMsgObj.t631 === stkMsgObj.t260) {
        stkMsgObj.t631_color = 'price_basic_color';
      } else if (stkMsgObj.t631 > stkMsgObj.t260) {
        if (stkMsgObj.t631 === stkMsgObj.t332) {
          stkMsgObj.t631_color = 'price_ceil_color';
        } else {
          stkMsgObj.t631_color = 'price_basic_over';
        }
      } else if (stkMsgObj.t631 < stkMsgObj.t260) {
        if (stkMsgObj.t631 === stkMsgObj.t333) {
          stkMsgObj.t631_color = 'price_floor_color';
        } else {
          stkMsgObj.t631_color = 'price_basic_less';
        }
      }
      // -- Xét màu t266 - Gía cao
      if (stkMsgObj.t266 === 0 || stkMsgObj.t266 === stkMsgObj.t260) {
        stkMsgObj.t266_color = 'price_basic_color';
      } else if (stkMsgObj.t266 > stkMsgObj.t260) {
        if (stkMsgObj.t266 === stkMsgObj.t332) {
          stkMsgObj.t266_color = 'price_ceil_color';
        } else {
          stkMsgObj.t266_color = 'price_basic_over';
        }
      } else if (stkMsgObj.t266 < stkMsgObj.t260) {
        if (stkMsgObj.t266 === stkMsgObj.t333) {
          stkMsgObj.t266_color = 'price_floor_color';
        } else {
          stkMsgObj.t266_color = 'price_basic_less';
        }
      }
      // -- Xét màu t2661 - Gía thấp
      if (stkMsgObj.t2661 === 0 || stkMsgObj.t2661 === stkMsgObj.t260) {
        stkMsgObj.t2661_color = 'price_basic_color';
      } else if (stkMsgObj.t2661 > stkMsgObj.t260) {
        if (stkMsgObj.t2661 === stkMsgObj.t332) {
          stkMsgObj.t2661_color = 'price_ceil_color';
        } else {
          stkMsgObj.t2661_color = 'price_basic_over';
        }
      } else if (stkMsgObj.t2661 < stkMsgObj.t260) {
        if (stkMsgObj.t2661 === stkMsgObj.t333) {
          stkMsgObj.t2661_color = 'price_floor_color';
        } else {
          stkMsgObj.t2661_color = 'price_basic_less';
        }
      }
      // -- Xét màu t139 - Giá đóng cửa
      if (stkMsgObj.t139 === 0 || stkMsgObj.t139 === stkMsgObj.t260) {
        stkMsgObj.t139_color = 'price_basic_color';
      } else if (stkMsgObj.t139 > stkMsgObj.t260) {
        if (stkMsgObj.t139 === stkMsgObj.t332) {
          stkMsgObj.t139_color = 'price_ceil_color';
        } else {
          stkMsgObj.t139_color = 'price_basic_over';
        }
      } else if (stkMsgObj.t139 < stkMsgObj.t260) {
        if (stkMsgObj.t139 === stkMsgObj.t333) {
          stkMsgObj.t139_color = 'price_floor_color';
        } else {
          stkMsgObj.t139_color = 'price_basic_less';
        }
      }
      self.msgUpd = stkMsgObj;
      // console.log('Web worker vào 1-2, self.msgUpd: ' + JSON.stringify(self.msgUpd));
    }
    if (clientSeq === 0) {
      if (ls_unit_change != null && ls_unit_change.length > 2) {
        self.changeList = mskey + '|' + '0' + '|' + ls_unit_change.substr(0, ls_unit_change.length - 1);
      }
    }
  }
};

self. updTP_Msg2MrkInfoMap = (msgObj, stkMsgObj, clientSeq, mskey) => {
  // console.log('Web worker TP - msgObj: ' + JSON.stringify(msgObj));
  // console.log('Web worker TP - stkMsgObj: ' + JSON.stringify(stkMsgObj));
  // console.log('Web worker TP - clientSeq: ' + clientSeq);
  // console.log('Web worker TP - mskey: ' + mskey);
  stkMsgObj.itemName = mskey;
  let t556_1 = stkMsgObj.t556_1;
  stkMsgObj.t556_1 = 0;
  let t132_1 = stkMsgObj.t132_1;
  stkMsgObj.t132_1 = 0;
  let t133_1 = stkMsgObj.t133_1;
  stkMsgObj.t133_1 = 0;
  let t1321_1 = stkMsgObj.t1321_1;
  stkMsgObj.t1321_1 = 0;
  let t1331_1 = stkMsgObj.t1331_1;
  stkMsgObj.t1331_1 = 0;

  let t556_2 = stkMsgObj.t556_2;
  stkMsgObj.t556_2 = 0;
  let t132_2 = stkMsgObj.t132_2;
  stkMsgObj.t132_2 = 0;
  let t133_2 = stkMsgObj.t133_2;
  stkMsgObj.t133_2 = 0;
  let t1321_2 = stkMsgObj.t1321_2;
  stkMsgObj.t1321_2 = 0;
  let t1331_2 = stkMsgObj.t1331_2;
  stkMsgObj.t1331_2 = 0;

  let t556_3 = stkMsgObj.t556_3;
  stkMsgObj.t556_3 = 0;
  let t132_3 = stkMsgObj.t132_3;
  stkMsgObj.t132_3 = 0;
  let t133_3 = stkMsgObj.t133_3;
  stkMsgObj.t133_3 = 0;
  let t1321_3 = stkMsgObj.t1321_3;
  stkMsgObj.t1321_3 = 0;
  let t1331_3 = stkMsgObj.t1331_3;
  stkMsgObj.t1331_3 = 0;

  const t556_4 = stkMsgObj.t556_4;
  stkMsgObj.t556_4 = 0;
  stkMsgObj.t132_4 = 0;
  stkMsgObj.t133_4 = 0;
  stkMsgObj.t1321_4 = 0;
  stkMsgObj.t1331_4 = 0;

  stkMsgObj.t55 = msgObj.t55;
  stkMsgObj.t555 = msgObj.t555;
  let ls_unit_change = '', ls_currVal = 0;
  const changList = [];
  if (msgObj.t555 >= 1 || msgObj.t555 === 0) {
    // -- mua tốt nhất + bán tốt nhất
    if (t556_1 == null || t556_1 === undefined) { t556_1 = 0; }
    if (msgObj['TP'][0] === undefined || msgObj['TP'][0].t556 === undefined || msgObj['TP'][0].t556 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][0].t556;
    }
    stkMsgObj.t556_1 = ls_currVal;
    // -- Giá dư mua 1
    if (t132_1 == null || t132_1 === undefined) { t132_1 = 0; }
    if (msgObj['TP'][0] === undefined || msgObj['TP'][0].t132 === undefined || msgObj['TP'][0].t132 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][0].t132;
    }
    if (t132_1 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't132_1' +
        ':' +
        t132_1 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t132_1');
    }
    stkMsgObj.t132_1 = ls_currVal;

    if (t1321_1 == null || t1321_1 === undefined) { t1321_1 = 0; }
    if (msgObj['TP'][0] === undefined || msgObj['TP'][0].t1321 === undefined || msgObj['TP'][0].t1321 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][0].t1321;
    }

    if (t1321_1 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't1321_1' +
        ':' +
        t1321_1 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t1321_1');
    }
    stkMsgObj.t1321_1 = ls_currVal;

    if (t133_1 == null || t133_1 === undefined) { t133_1 = 0; }
    if (msgObj['TP'][0] === undefined || msgObj['TP'][0].t133 === undefined || msgObj['TP'][0].t133 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][0].t133;
    }
    if (t133_1 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't133_1' +
        ':' +
        t133_1 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t133_1');
    }
    stkMsgObj.t133_1 = ls_currVal;

    if (t1331_1 == null || t1331_1 === undefined) { t1331_1 = 0; }
    if (msgObj['TP'][0] === undefined || msgObj['TP'][0].t1331 === undefined || msgObj['TP'][0].t1331 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][0].t1331;
    }
    if (t1331_1 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't1331_1' +
        ':' +
        t1331_1 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t1331_1');
    }
    stkMsgObj.t1331_1 = ls_currVal;
  }
  if (msgObj.t555 >= 2 || msgObj.t555 === 0) {
    // -- mua tốt nhì + bán tốt nhì
    if (t556_2 == null || t556_2 === undefined) { t556_2 = 0; }
    if (msgObj['TP'][1] === undefined || msgObj['TP'][1].t556 === undefined || msgObj['TP'][1].t556 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][1].t556;
    }
    stkMsgObj.t556_2 = ls_currVal;

    if (t132_2 == null || t132_2 === undefined) { t132_2 = 0; }
    if (msgObj['TP'][1] === undefined || msgObj['TP'][1].t132 === undefined || msgObj['TP'][1].t132 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][1].t132;
    }
    if (t132_2 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't132_2' +
        ':' +
        t132_2 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t132_2');
    }
    stkMsgObj.t132_2 = ls_currVal;

    if (t1321_2 == null || t1321_2 === undefined) { t1321_2 = 0; }
    if (msgObj['TP'][1] === undefined || msgObj['TP'][1].t1321 === undefined || msgObj['TP'][1].t1321 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][1].t1321;
    }
    if (t1321_2 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't1321_2' +
        ':' +
        t1321_2 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t1321_2');
    }
    stkMsgObj.t1321_2 = ls_currVal;

    if (t133_2 == null || t133_2 === undefined) { t133_2 = 0; }
    if (msgObj['TP'][1] === undefined || msgObj['TP'][1].t133 === undefined || msgObj['TP'][1].t133 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][1].t133;
    }
    if (t133_2 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't133_2' +
        ':' +
        t133_2 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t133_2');
    }
    stkMsgObj.t133_2 = ls_currVal;

    if (t1331_2 == null || t1331_2 === undefined) { t1331_2 = 0; }
    if (msgObj['TP'][1] === undefined || msgObj['TP'][1].t1331 === undefined || msgObj['TP'][1].t1331 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][1].t1331;
    }
    if (t1331_2 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't1331_2' +
        ':' +
        t1331_2 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t1331_2');
    }
    stkMsgObj.t1331_2 = ls_currVal;
  }
  if (msgObj.t555 >= 3 || msgObj.t555 === 0) {
    if (t556_3 == null || t556_3 === undefined) { t556_3 = 0; }
    if (msgObj['TP'][2] === undefined || msgObj['TP'][2].t556 === undefined || msgObj['TP'][2].t556 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][2].t556;
    }
    stkMsgObj.t556_3 = ls_currVal;

    if (t132_3 == null || t132_3 === undefined) { t132_3 = 0; }
    if (msgObj['TP'][2] === undefined || msgObj['TP'][2].t132 === undefined || msgObj['TP'][2].t132 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][2].t132;
    }
    if (t132_3 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't132_3' +
        ':' +
        t132_3 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t132_3');
    }
    stkMsgObj.t132_3 = ls_currVal;

    if (t1321_3 == null || t1321_3 === undefined) { t1321_3 = 0; }
    if (msgObj['TP'][2] === undefined || msgObj['TP'][2].t1321 === undefined || msgObj['TP'][2].t1321 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][2].t1321;
    }

    if (t1321_3 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't1321_3' +
        ':' +
        t1321_3 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t1321_3');
    }
    stkMsgObj.t1321_3 = ls_currVal;

    if (t133_3 == null || t133_3 === undefined) { t133_3 = 0; }
    if (msgObj['TP'][2] === undefined || msgObj['TP'][2].t133 === undefined || msgObj['TP'][2].t133 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][2].t133;
    }

    if (t133_3 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't133_3' +
        ':' +
        t133_3 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t133_3');
    }
    stkMsgObj.t133_3 = ls_currVal;

    if (t1331_3 == null || t1331_3 === undefined) { t1331_3 = 0; }
    if (msgObj['TP'][2] === undefined || msgObj['TP'][2].t1331 === undefined || msgObj['TP'][2].t1331 == null) {
      ls_currVal = 0;
    } else {
      ls_currVal = msgObj['TP'][2].t1331;
    }
    if (t1331_3 !== ls_currVal) {
      ls_unit_change =
        ls_unit_change +
        't1331_3' +
        ':' +
        t1331_3 +
        ':' +
        ls_currVal +
        '|';
      changList.push('t133_3');
    }
    stkMsgObj.t1331_3 = ls_currVal;
  }
  self.changeArr = changList;
  // -- Xét màu t132_3 - Dư mua 3
  if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
    stkMsgObj.t132_3_color = 'price_basic_color';
  } else if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
      stkMsgObj.t132_3_color = 'price_ceil_color';
    } else {
      stkMsgObj.t132_3_color = 'price_basic_over';
    }
  } else if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
      stkMsgObj.t132_3_color = 'price_floor_color';
    } else {
      stkMsgObj.t132_3_color = 'price_basic_less';
    }
  }
  // -- Xét màu t132_2 - Dư mua 2
  if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
    stkMsgObj.t132_2_color = 'price_basic_color';
  } else if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
      stkMsgObj.t132_2_color = 'price_ceil_color';
    } else {
      stkMsgObj.t132_2_color = 'price_basic_over';
    }
  } else if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
      stkMsgObj.t132_2_color = 'price_floor_color';
    } else {
      stkMsgObj.t132_2_color = 'price_basic_less';
    }
  }
  // -- Xét màu t132_1 - Dư mua 1
  if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
    stkMsgObj.t132_1_color = 'price_basic_color';
  } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (stkMsgObj.t132_1 === 777777710000 || stkMsgObj.t132_1 === 777777720000) {
      stkMsgObj.t132_1_color = 'defaultColor';
    } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
      stkMsgObj.t132_1_color = 'price_ceil_color';
    } else {
      stkMsgObj.t132_1_color = 'price_basic_over';
    }
  } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
      stkMsgObj.t132_1_color = 'price_floor_color';
    } else {
      stkMsgObj.t132_1_color = 'price_basic_less';
    }
  }
  // -- Xét màu t133_1 - Dư bán 1
  if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
    stkMsgObj.t133_1_color = 'price_basic_color';
  } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (stkMsgObj.t133_1 === 777777710000 || stkMsgObj.t133_1 === 777777720000) {
      stkMsgObj.t133_1_color = 'defaultColor';
    } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
      stkMsgObj.t133_1_color = 'price_ceil_color';
    } else {
      stkMsgObj.t133_1_color = 'price_basic_over';
    }
  } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
      stkMsgObj.t133_1_color = 'price_floor_color';
    } else {
      stkMsgObj.t133_1_color = 'price_basic_less';
    }
  }
  // -- Xét màu t133_2 - Dư bán 2
  if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
    stkMsgObj.t133_2_color = 'price_basic_color';
  } else if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
      stkMsgObj.t133_2_color = 'price_ceil_color';
    } else {
      stkMsgObj.t133_2_color = 'price_basic_over';
    }
  } else if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
      stkMsgObj.t133_2_color = 'price_floor_color';
    } else {
      stkMsgObj.t133_2_color = 'price_basic_less';
    }
  }
  // -- Xét màu t133_3 - Dư bán 1
  if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
    stkMsgObj.t133_3_color = 'price_basic_color';
  } else if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
      stkMsgObj.t133_3_color = 'price_ceil_color';
    } else {
      stkMsgObj.t133_3_color = 'price_basic_over';
    }
  } else if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
    if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
      stkMsgObj.t133_3_color = 'price_floor_color';
    } else {
      stkMsgObj.t133_3_color = 'price_basic_less';
    }
  }

  self.msgUpd = stkMsgObj;
  if (clientSeq === 0) {
    if (ls_unit_change != null && ls_unit_change.length > 2) {
      self.changeList = mskey + '|' + '0' + '|' + ls_unit_change.substr(0, ls_unit_change.length - 1);
    }
  }
  // console.log('End process message I self.msgUpd: ' + JSON.stringify(self.msgUpd));
  // console.log('End process message I self.changeList: ' + JSON.stringify(self.changeList));
};
