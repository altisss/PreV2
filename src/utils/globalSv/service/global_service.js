
import { requestInfo } from '../models/requestInfo';
import { stkPriceBoard } from '../models/stkPriceBoard';
import { Subject } from 'rxjs'
import FormatNumber from '../../../conponents/formatNumber/FormatNumber';
import moment from 'moment';
const isDev = require('electron-is-dev');

class globalService {
  constructor() {
    this.reqInfoMap = new Map();
    this.mrkInfoEvent = new Subject();
    this.reconnectEvent = new Subject();
    this.commonEvent = new Subject();
    this.stkTradEvent = new Subject();
    this.event_ToastCommonInfo = new Subject();

    this.authFlag = false;
    this.permissNotify = false;
    this.publicFlag = false;
    this.activeCode = '';
    this.activeAcnt = '';
    this.expTimeout = 30; // -- time idle
    this.shortKeyOrder = 'O';
    this.shortKeyOrderBook = 'B';
    this.discexpire = 30; // -- time expire tính từ thời điểm mất kết nối server
    this.reqTimeout = 25000; // 25 seconds
    this.configInfo = {};
    this.objShareGlb = {};
    this.svTime = {};
    this.gapSvTime = 0;
    this.versionChange = '10.950';
    this.objShareGlb['stkAtc'] = {}; // -- stock code which is actived
    this.objShareGlb['stkOrd'] = {}; // -- stock code which select in order form
    this.objShareGlb['sessionInfo'] = {
      sessionId: '',
      userID: '',
      remOrdPass: false,
      orderPass: '',
      Otp: ''
    };
    this.workspace = {};
    this.workspace["wsLists"] = ["ws01", "ws02", "ws03", "ws04"];
    this.workspace["active"] = "ws02";

    // -- flag status ------
    this.isDebug = false;
    this.stkListDone = false;
    this.isMobile = false;
    this.finishGetImsg = false;;
    this.finishGetLastIndex = false;
    this.finishGetStockList = false;

    // -- event list -------
    this.CHANG_LANGUAGE = 'CHANG-LANGUAGE';
    this.CHANG_INDEX = 'CHANG-INDEX';
    this.CHANGE_HEIGHT_BOTTOM = 'CHANGE-HEIGHT-BOTTOM';
    this.SHOW_ORDER_LIST = 'SHOW-ORDER-LIST';
    this.HIDE_ORDER_LIST = 'HIDE-ORDER-LIST';
    this.STK_TRADV_CHANGE = 'STK-TRADV-CHANGE';
    this.CASHIN_ADVANCE = 'CASHIN-ADVANCE';
    this.DEPOSIT_INFORM = 'DEPOSIT-INFORM';
    this.CASH_WITHDRAW = 'CASH-WITHDRAW';
    this.CASH_TRANSFER = 'CASH-TRANSFER';
    this.STOCK_TRANSFER = 'STOCK-TRANSFER';
    this.REPAY_MARGIN = 'REPAY-MARGIN';
    this.RIGHT_FORBUY = 'RIGHT-FORBUY';
    this.ADVANCE_ORDER = 'ADVANCE-ORDER';
    this.SHOW_ALERT_MODAL = 'SHOW_ALERT_MODAL';
    this.ODDLOT_ORDER = 'ODDLOT_ORDER';
    this.LOGIN_SUCCESS = 'LOGIN-SUCCESS';
    this.ORDER = 'ORDER';
    this.misTypeReconect = 'RECONNECT';
    this.connectStatus = 'CONNECT-STATUS';
    this.misTypeChgIndex = 'CHNGINDEX';
    this.misTypeChgStock = 'STKINFO';
    this.ERROR_ACTION = 'ERROR_ACTION';
    this.ACTION_SUCCUSS = 'ACTION_SUCCUSS';
    this.CONFIRM_ORDER = 'CONFIRM_ORDER';
    this.RIGHT_INFO = 'RIGHT_INFO';
    this.CHANGE_PASSWORD = 'CHANGE_PASSWORD';
    this.REGISTER_NOTIFY = 'REGISTER_NOTIFY';
    this.CONFIG_INFO = 'CONFIG_INFO';
    this.CHANGE_CONFIG_INFO = 'CHANGE_CONFIG_INFO';
    this.misTypeTradvStock = 'misTypeTradvStock';
    this.finishGetIndexOrther = 'finishGetIndexOrther';
    this.finishGetIndexOrtherMiss = 'finishGetIndexOrtherMiss';
    this.ADD_FAV = 'ADD_FAV';
    this.MOD_FAV = 'MOD_FAV';
    this.SHOW_OTP = 'SHOW_OTP';
    this.NOTIFY = 'NOTIFY';
    this.ADVERTIS_ORDER = 'ADVERTIS_ORDER';
    this.RESET_CONTAINER = 'RESET_CONTAINER';
    this.MARGIN_LIST_INFO = 'MARGIN_LIST_INFO';
    this.TRY_CONNECT = 'TRY_CONNECT';
    this.CHANGE_WIDTH_BOTTOM = 'CHANGE_WIDTH_BOTTOM';
    this.STK_FROM_MENU = 'STK_FROM_MENU';
    this.REFOCUS_SELECT_STK = 'REFOCUS_SELECT_STK';
    this.PLACE_ORDER = 'PLACE_ORDER';
    this.CHANGE_ACT = 'CHANGE_ACT';
    this.ESC_KEY = 'ESC_KEY';
    this.misTypeSuccsOtp = 'misTypeSuccsOtp';
    this.misTypeGetOtp = 'misTypeGetOtp';
    this.AUTO_SCROLL = 'AUTO_SCROLL';
    this.EXTEND_CONTRACT = 'EXTEND_CONTRACT';
    this.BANK_CONNECTION = 'BANK_CONNECTION';
    this.OC_SIDEBAR = 'OC_SIDEBAR';
    // this.FOCUS_INDEX = 'FOCUS_INDEX';
    this.finishGetIndex = 'finishGetIndex';
    this.OPEN_MODAL_NEWS = 'OPEN_MODAL_NEWS';
    this.ASSET_MANAGE = 'ASSET_MANAGE';
    this.ASSET_MARGIN = 'ASSET_MARGIN';
    this.SHOW_DIV_BOTTOM = 'SHOW_DIV_BOTTOM';
    this.CHART_TAB = 'CHART_TAB';
    this.HISTORY_TAB = 'HISTORY_TAB';
    this.OVERVIEW_MARKET_TAB = 'OVERVIEW_MARKET_TAB';
    this.STOCK_INFO_TAB = 'STOCK_INFO_TAB';
    this.HISTORY_MARKET_TAB = 'HISTORY_MARKET_TAB';
    this.UPDATE_FVL = 'UPDATE_FVL';
    this.UPDATE_GRP_FVL = 'UPDATE_GRP_FVL';
    this.LIQUID_MARKET_TAB = 'LIQUID_MARKET_TAB';
    this.TRADE_FOREIGNER_TAB = 'TRADE_FOREIGNER_TAB';
    this.OWN_FOREIGER_TAB = 'OWN_FOREIGER_TAB';
    this.PUT_THROUGH_TAB = 'PUT_THROUGH_TAB';
    this.OPEN_MODAL_LOGIN = 'OPEN_MODAL_LOGIN';
    this.CONNECT_SV_SUCCESS = 'CONNECT_SV_SUCCESS';
    this.SHOW_NOTIFY = 'SHOW_NOTIFY';
    this.HIDE_MODAL_LOGIN = 'HIDE_MODAL_LOGIN';
    this.CHANGE_LANG = 'CHANGE_LANG';
    this.getStockListChangeLang = 'getStockListChangeLang';
    this.CHANGE_LANG_LOGIN = 'CHANGE_LANG_LOGIN';
    this.CHANGE_THEME = 'CHANGE_THEME';
    this.CLOSE_SIDEBAR = 'CLOSE_SIDEBAR';
    this.CLOSE_CHART = 'CLOSE_CHART';
    this.MARKET_INDEX_TAB = 'MARKET_INDEX_TAB';
    this.CHANGE_INDEX = 'CHANGE_INDEX';
    this.TRANSACTION_INFO = 'TRANSACTION_INFO';
    this.USER_GUIDE = 'USER_GUIDE';
    this.LOGOUT = 'LOGOUT';
    this.EXPIRE_SESSION = 'EXPIRE_SESSION';
    this.MOVE_STK2FIRST_PRTABLE = 'MOVE_STK2FIRST_PRTABLE';
    // -- Map lưu các message SI và TP chưa xử lý
    this.mrkIndex_MsgMap = new Map();
    this.TP_MSG_MAP = new Map();
    this.TPTimeout = [];
    this.TPTimeoutCt = 0;
    this.firsTimeLoad = true;
    this.flagGetValueTradView = false;

    // this.HSX_PRC_LIST = products;
    this.HSX_PRC_LIST = [];
    this.HNX_PRC_LIST = [];
    this.UPC_PRC_LIST = [];
    this.FVL_PRC_LIST = [];
    this.mrk_StkList = []; // {'value': 'ACB', 'label': 'Ten ma'}

    this.recentStkList = [] // -- lưu lại mảng stk list từng search

    this.tradview_StkList = []; // -- mảng mã CK theo format tradingview
    this.tradingViewPage = false;
    this.stkInfoTradviewMap = new Map(); // -- Map thông tin mã CK dùng cho tradinview
    this.indexList = []; // -- Index list không bao gồm VNI, HNX, UPCOM
    this.indexCodeAct = '';
    this.chartCodeAct = '';
    this.actStockCode = '';

    this.lastAdvOrdInfo = { 'acntNo': '', 'sb_tp': '1', 'stkCode': '', 'orderTp': '', 'seasonTp': '', 'price': '', 'qty': '', 'startDt': '', 'endDt': '' };
    this.lastOrdInfo = { 'acntNo': '', 'sb_tp': '1', 'stkCode': '', 'orderTp': '', 'price': '', 'qty': '' };
    this.FVL_STK_LIST = [];
    // -- for tradingview -----------
    this.tradingViewFirstRq = false;
    this.tradingViewDoneGetData = false;
    this.tradingViewFlag = false;
    this.tradingView = undefined;
    this.tradingViewData = {};
    this.tradingViewDataFull = {};
    this.tradingViewBarData = {};
    this.TradingviewDatafeed = undefined;
    this.tradview_StkList = [];
    this.tradview_StkList_HSX = [];
    this.tradview_StkList_HNX = [];
    this.tradview_StkList_UPC = [];
    // this.stkInfoTradviewMap = new Map();
    // -- array index message in day (phục vụ cho vẽ biểu đồ index nhỏ trong ngày)
    this.mrkIndexArr_VNINDEX = [];
    this.mrkIndexArr_VN30INDEX = [];
    this.mrkIndexArr_HNXINDEX = [];
    this.mrkIndexArr_HNX30INDEX = [];
    this.mrkIndexArr_UPCOMINDEX = [];
    // danh sách mã CK đang subscribe thông tin thị trường
    this.subrList = [];

    this.VN_INDEX = {};
    this.VN30_INDEX = {};
    this.HNX_INDEX = {};
    this.HNX30_INDEX = {};
    this.UPCOM_INDEX = {};
    this.VN100_INDEX = {};
    this.VNX50_INDEX = {};
    this.VNXALL_INDEX = {};
    this.VNFIN_INDEX = {};
    this.VNREAL_INDEX = {};
    this.VNSML_INDEX = {};
    this.VNMID_INDEX = {};
    this.VNUTI_INDEX = {};
    this.VNCONS_INDEX = {};
    this.VNALL_INDEX = {};
    this.VNSI_INDEX = {};
    this.VNENE_INDEX = {};
    this.VNIND_INDEX = {};
    this.VNMAT_INDEX = {};
    this.VNIT_INDEX = {};
    this.VNFINLEAD_INDEX = {};
    this.VNFINSELECT_INDEX = {};
    this.VNDIAMOND_INDEX = {};
    this.VNX200_INDEX = {};

    // -- defined color name
    this.price_basic_color = 'price_basic_color';
    this.price_floor_color = 'price_floor_color';
    this.price_ceil_color = 'price_ceil_color';
    this.price_basic_less = 'price_basic_less';
    this.price_basic_over = 'price_basic_over';
    this.defaultColor = 'defaultColor';
    // -- web worker -------------
    this.simsgWebWorker = undefined;
    this.storStkListWebWorker = undefined;
    // -- defined subcribe type
    this.subactive_stk = 'SUB_ACT_STK'; // SUBSCRIBE_ACTSTK
    this.subhsx_stk = 'SUBSCRIBE_HSX';
    this.subhnx_stk = 'SUBSCRIBE_HNX';
    this.subupc_stk = 'SUBSCRIBE_UPC';
    this.subidx_stk = 'SUBSCRIBE_INDEX';
    // ------------------
    this.getIndexHist = 'GET_INDEX_HIST';
    this.getMoreEp_msg = 'GET_MORE_EPMSG';
    this.getStk_list = 'GET_STKLIST';
    this.getLast_Imsg = 'GET_LAST_IMSG';
    this.getLast_BImsg = 'GET_LAST_BIMSG';

    // json language
    this.vi = {};
    this.en = {};
    this.cn = {};
    this.language = '';

    // Thông tin index
    this.mrkInfo = {};
    this.mrkInfo['mrk_Index'] = {
      'VN-INDEX': {},
      'VN30-INDEX': {},
      'VNXAllShare': {},
      'HNX-INDEX': {},
      'HNX30-INDEX': {},
      'UPCOM-INDEX': {}
    };
    // thông tin mrk top
    this.dataMrktop = {};
    this.dataHisMrktop = {};

    // -- Trạng thái giao dịch các sàn
    this.mrkInfo['boardStatus'] = { HNX: {}, HSX: {}, UPC: {} };
    // -- Danh sách lệnh quảng cáo
    this.mrkInfo['advert_order'] = [];
    this.mrkInfo['mrk_Prboard'] = {};
    // -- Giờ giao dịch từ message TS
    this.mrkInfo['trad_dt'] = '';
    this.mrkInfo['trad_tm'] = '';
    this.mrkInfo['trad_time'] = '';
    this.mrkInfo['max_rowsOnPage'] = 100;
    this.disconTime = null;

    // độ trễ mạng default
    this.latencyTime = 100;

    // -- event to finish get Market info --
    this.event_FinishGetMrkInfo = new Subject();
    this.event_FinishSunbcribeFunct = new Subject();
    // -- event to receive realtime Market info --
    this.event_ServerPushMRKRcvChangeBgrd = new Subject();
    // -- event to update HNX Market info --
    this.event_ServerPushMRKRcvHnxUpd = new Subject();
    // -- event to update UPC Market info --
    this.event_ServerPushMRKRcvUpcUpd = new Subject();
    // -- event to update UPC Market info --
    this.event_ServerPushMRKRcvHsxUpd = new Subject();
    // -- event to receive realtime EP message --
    this.event_ServerPushMRKRcvChangeEpMsg = new Subject();
    // -- event to receive realtime I message --
    this.event_ServerPushIndexChart = new Subject();

    this.autionMatch_timeSumVol_Map = new Map(); // -- cho biểu đồ khối lượng khớp theo thời gian
    this.autionMatch_priceSumVol_Map = new Map(); // -- cho biểu đồ khối lượng khớp theo bước giá
    this.autionMatch_timePrice_Map = new Map(); // -- cho biểu đồ giá khớp theo thời gian
    this.autionMatch_timePriceSumVol_Map = new Map(); // -- cho table lịch sử khớp lệnh
    this.autionMatch_timePriceSumVol_chart_Map = new Map();

    this.VN_INDEX['indexArr'] = [];
    this.VN_INDEX['ref'] = 0;
    this.VN_INDEX['indexValue'] = 0;
    this.VN_INDEX['indexValueChang'] = 0;
    this.VN_INDEX['indexPercChang'] = 0;
    this.VN_INDEX['indexTotalQty'] = 0;
    this.VN_INDEX['indexTotalValue'] = 0;
    this.VN_INDEX['indexCode'] = '';
    this.VN_INDEX['indexCd'] = 'VNI';
    this.VN_INDEX['increase'] = 0;
    this.VN_INDEX['equaCeil'] = 0;
    this.VN_INDEX['noChange'] = 0;
    this.VN_INDEX['decrease'] = 0;
    this.VN_INDEX['equaFloor'] = 0;
    this.VN_INDEX['tradStatus'] = '';
    this.VN_INDEX['messageI'] = [];

    this.VN30_INDEX['indexArr'] = [];
    this.VN30_INDEX['ref'] = 0;
    this.VN30_INDEX['indexValue'] = 0;
    this.VN30_INDEX['indexValueChang'] = 0;
    this.VN30_INDEX['indexPercChang'] = 0;
    this.VN30_INDEX['indexTotalQty'] = 0;
    this.VN30_INDEX['indexTotalValue'] = 0;
    this.VN30_INDEX['indexCode'] = '';
    this.VN30_INDEX['indexCd'] = 'VN30';
    this.VN30_INDEX['increase'] = 0;
    this.VN30_INDEX['equaCeil'] = 0;
    this.VN30_INDEX['noChange'] = 0;
    this.VN30_INDEX['decrease'] = 0;
    this.VN30_INDEX['equaFloor'] = 0;
    this.VN30_INDEX['tradStatus'] = '';
    this.VN30_INDEX['messageI'] = [];

    this.HNX_INDEX['indexArr'] = [];
    this.HNX_INDEX['ref'] = 0;
    this.HNX_INDEX['indexValue'] = 0;
    this.HNX_INDEX['indexValueChang'] = 0;
    this.HNX_INDEX['indexPercChang'] = 0;
    this.HNX_INDEX['indexTotalQty'] = 0;
    this.HNX_INDEX['indexTotalValue'] = 0;
    this.HNX_INDEX['indexCode'] = '';
    this.HNX_INDEX['indexCd'] = 'HNX';
    this.HNX_INDEX['increase'] = 0;
    this.HNX_INDEX['equaCeil'] = 0;
    this.HNX_INDEX['noChange'] = 0;
    this.HNX_INDEX['decrease'] = 0;
    this.HNX_INDEX['equaFloor'] = 0;
    this.HNX_INDEX['tradStatus'] = '';

    this.HNX30_INDEX['indexArr'] = [];
    this.HNX30_INDEX['ref'] = 0;
    this.HNX30_INDEX['indexValue'] = 0;
    this.HNX30_INDEX['indexValueChang'] = 0;
    this.HNX30_INDEX['indexPercChang'] = 0;
    this.HNX30_INDEX['indexTotalQty'] = 0;
    this.HNX30_INDEX['indexTotalValue'] = 0;
    this.HNX30_INDEX['indexCode'] = '';
    this.HNX30_INDEX['indexCd'] = 'HNX30';
    this.HNX30_INDEX['increase'] = 0;
    this.HNX30_INDEX['equaCeil'] = 0;
    this.HNX30_INDEX['noChange'] = 0;
    this.HNX30_INDEX['decrease'] = 0;
    this.HNX30_INDEX['equaFloor'] = 0;
    this.HNX30_INDEX['tradStatus'] = '';
    this.HNX30_INDEX['messageI'] = [];

    this.UPCOM_INDEX['indexArr'] = [];
    this.UPCOM_INDEX['ref'] = 0;
    this.UPCOM_INDEX['indexValue'] = 0;
    this.UPCOM_INDEX['indexValueChang'] = 0;
    this.UPCOM_INDEX['indexPercChang'] = 0;
    this.UPCOM_INDEX['indexTotalQty'] = 0;
    this.UPCOM_INDEX['indexTotalValue'] = 0;
    this.UPCOM_INDEX['indexCode'] = '';
    this.UPCOM_INDEX['indexCd'] = 'UPC';
    this.UPCOM_INDEX['increase'] = 0;
    this.UPCOM_INDEX['equaCeil'] = 0;
    this.UPCOM_INDEX['noChange'] = 0;
    this.UPCOM_INDEX['decrease'] = 0;
    this.UPCOM_INDEX['equaFloor'] = 0;
    this.UPCOM_INDEX['tradStatus'] = '';

    this.VN100_INDEX['indexArr'] = [];
    this.VN100_INDEX['ref'] = 0;
    this.VN100_INDEX['indexValue'] = 0;
    this.VN100_INDEX['indexValueChang'] = 0;
    this.VN100_INDEX['indexPercChang'] = 0;
    this.VN100_INDEX['indexTotalQty'] = 0;
    this.VN100_INDEX['indexTotalValue'] = 0;
    this.VN100_INDEX['indexCode'] = '';
    this.VN100_INDEX['indexCd'] = '';
    this.VN100_INDEX['increase'] = 0;
    this.VN100_INDEX['equaCeil'] = 0;
    this.VN100_INDEX['noChange'] = 0;
    this.VN100_INDEX['decrease'] = 0;
    this.VN100_INDEX['equaFloor'] = 0;
    this.VN100_INDEX['tradStatus'] = '';
    this.VN100_INDEX['messageI'] = [];

    this.VNX50_INDEX['indexArr'] = [];
    this.VNX50_INDEX['ref'] = 0;
    this.VNX50_INDEX['indexValue'] = 0;
    this.VNX50_INDEX['indexValueChang'] = 0;
    this.VNX50_INDEX['indexPercChang'] = 0;
    this.VNX50_INDEX['indexTotalQty'] = 0;
    this.VNX50_INDEX['indexTotalValue'] = 0;
    this.VNX50_INDEX['indexCode'] = '';
    this.VNX50_INDEX['indexCd'] = '';
    this.VNX50_INDEX['increase'] = 0;
    this.VNX50_INDEX['equaCeil'] = 0;
    this.VNX50_INDEX['noChange'] = 0;
    this.VNX50_INDEX['decrease'] = 0;
    this.VNX50_INDEX['equaFloor'] = 0;
    this.VNX50_INDEX['tradStatus'] = '';
    this.VNX50_INDEX['messageI'] = [];

    this.VNFIN_INDEX['indexArr'] = [];
    this.VNFIN_INDEX['ref'] = 0;
    this.VNFIN_INDEX['indexValue'] = 0;
    this.VNFIN_INDEX['indexValueChang'] = 0;
    this.VNFIN_INDEX['indexPercChang'] = 0;
    this.VNFIN_INDEX['indexTotalQty'] = 0;
    this.VNFIN_INDEX['indexTotalValue'] = 0;
    this.VNFIN_INDEX['indexCode'] = '';
    this.VNFIN_INDEX['indexCd'] = '';
    this.VNFIN_INDEX['increase'] = 0;
    this.VNFIN_INDEX['equaCeil'] = 0;
    this.VNFIN_INDEX['noChange'] = 0;
    this.VNFIN_INDEX['decrease'] = 0;
    this.VNFIN_INDEX['equaFloor'] = 0;
    this.VNFIN_INDEX['tradStatus'] = '';
    this.VNFIN_INDEX['messageI'] = [];

    this.VNREAL_INDEX['indexArr'] = [];
    this.VNREAL_INDEX['ref'] = 0;
    this.VNREAL_INDEX['indexValue'] = 0;
    this.VNREAL_INDEX['indexValueChang'] = 0;
    this.VNREAL_INDEX['indexPercChang'] = 0;
    this.VNREAL_INDEX['indexTotalQty'] = 0;
    this.VNREAL_INDEX['indexTotalValue'] = 0;
    this.VNREAL_INDEX['indexCode'] = '';
    this.VNREAL_INDEX['indexCd'] = '';
    this.VNREAL_INDEX['increase'] = 0;
    this.VNREAL_INDEX['equaCeil'] = 0;
    this.VNREAL_INDEX['noChange'] = 0;
    this.VNREAL_INDEX['decrease'] = 0;
    this.VNREAL_INDEX['equaFloor'] = 0;
    this.VNREAL_INDEX['tradStatus'] = '';
    this.VNREAL_INDEX['messageI'] = [];

    this.VNSML_INDEX['indexArr'] = [];
    this.VNSML_INDEX['ref'] = 0;
    this.VNSML_INDEX['indexValue'] = 0;
    this.VNSML_INDEX['indexValueChang'] = 0;
    this.VNSML_INDEX['indexPercChang'] = 0;
    this.VNSML_INDEX['indexTotalQty'] = 0;
    this.VNSML_INDEX['indexTotalValue'] = 0;
    this.VNSML_INDEX['indexCode'] = '';
    this.VNSML_INDEX['indexCd'] = '';
    this.VNSML_INDEX['increase'] = 0;
    this.VNSML_INDEX['equaCeil'] = 0;
    this.VNSML_INDEX['noChange'] = 0;
    this.VNSML_INDEX['decrease'] = 0;
    this.VNSML_INDEX['equaFloor'] = 0;
    this.VNSML_INDEX['tradStatus'] = '';
    this.VNSML_INDEX['messageI'] = [];

    this.VNMID_INDEX['indexArr'] = [];
    this.VNMID_INDEX['ref'] = 0;
    this.VNMID_INDEX['indexValue'] = 0;
    this.VNMID_INDEX['indexValueChang'] = 0;
    this.VNMID_INDEX['indexPercChang'] = 0;
    this.VNMID_INDEX['indexTotalQty'] = 0;
    this.VNMID_INDEX['indexTotalValue'] = 0;
    this.VNMID_INDEX['indexCode'] = '';
    this.VNMID_INDEX['indexCd'] = '';
    this.VNMID_INDEX['increase'] = 0;
    this.VNMID_INDEX['equaCeil'] = 0;
    this.VNMID_INDEX['noChange'] = 0;
    this.VNMID_INDEX['decrease'] = 0;
    this.VNMID_INDEX['equaFloor'] = 0;
    this.VNMID_INDEX['tradStatus'] = '';
    this.VNMID_INDEX['messageI'] = [];

    this.VNUTI_INDEX['indexArr'] = [];
    this.VNUTI_INDEX['ref'] = 0;
    this.VNUTI_INDEX['indexValue'] = 0;
    this.VNUTI_INDEX['indexValueChang'] = 0;
    this.VNUTI_INDEX['indexPercChang'] = 0;
    this.VNUTI_INDEX['indexTotalQty'] = 0;
    this.VNUTI_INDEX['indexTotalValue'] = 0;
    this.VNUTI_INDEX['indexCode'] = '';
    this.VNUTI_INDEX['indexCd'] = '';
    this.VNUTI_INDEX['increase'] = 0;
    this.VNUTI_INDEX['equaCeil'] = 0;
    this.VNUTI_INDEX['noChange'] = 0;
    this.VNUTI_INDEX['decrease'] = 0;
    this.VNUTI_INDEX['equaFloor'] = 0;
    this.VNUTI_INDEX['tradStatus'] = '';
    this.VNUTI_INDEX['messageI'] = [];

    this.VNCONS_INDEX['indexArr'] = [];
    this.VNCONS_INDEX['ref'] = 0;
    this.VNCONS_INDEX['indexValue'] = 0;
    this.VNCONS_INDEX['indexValueChang'] = 0;
    this.VNCONS_INDEX['indexPercChang'] = 0;
    this.VNCONS_INDEX['indexTotalQty'] = 0;
    this.VNCONS_INDEX['indexTotalValue'] = 0;
    this.VNCONS_INDEX['indexCode'] = '';
    this.VNCONS_INDEX['indexCd'] = '';
    this.VNCONS_INDEX['increase'] = 0;
    this.VNCONS_INDEX['equaCeil'] = 0;
    this.VNCONS_INDEX['noChange'] = 0;
    this.VNCONS_INDEX['decrease'] = 0;
    this.VNCONS_INDEX['equaFloor'] = 0;
    this.VNCONS_INDEX['tradStatus'] = '';
    this.VNCONS_INDEX['messageI'] = [];

    this.VNALL_INDEX['indexArr'] = [];
    this.VNALL_INDEX['ref'] = 0;
    this.VNALL_INDEX['indexValue'] = 0;
    this.VNALL_INDEX['indexValueChang'] = 0;
    this.VNALL_INDEX['indexPercChang'] = 0;
    this.VNALL_INDEX['indexTotalQty'] = 0;
    this.VNALL_INDEX['indexTotalValue'] = 0;
    this.VNALL_INDEX['indexCode'] = '';
    this.VNALL_INDEX['indexCd'] = '';
    this.VNALL_INDEX['increase'] = 0;
    this.VNALL_INDEX['equaCeil'] = 0;
    this.VNALL_INDEX['noChange'] = 0;
    this.VNALL_INDEX['decrease'] = 0;
    this.VNALL_INDEX['equaFloor'] = 0;
    this.VNALL_INDEX['tradStatus'] = '';
    this.VNALL_INDEX['messageI'] = [];

    this.VNSI_INDEX['indexArr'] = [];
    this.VNSI_INDEX['ref'] = 0;
    this.VNSI_INDEX['indexValue'] = 0;
    this.VNSI_INDEX['indexValueChang'] = 0;
    this.VNSI_INDEX['indexPercChang'] = 0;
    this.VNSI_INDEX['indexTotalQty'] = 0;
    this.VNSI_INDEX['indexTotalValue'] = 0;
    this.VNSI_INDEX['indexCode'] = '';
    this.VNSI_INDEX['indexCd'] = '';
    this.VNSI_INDEX['increase'] = 0;
    this.VNSI_INDEX['equaCeil'] = 0;
    this.VNSI_INDEX['noChange'] = 0;
    this.VNSI_INDEX['decrease'] = 0;
    this.VNSI_INDEX['equaFloor'] = 0;
    this.VNSI_INDEX['tradStatus'] = '';
    this.VNSI_INDEX['messageI'] = [];

    this.VNENE_INDEX['indexArr'] = [];
    this.VNENE_INDEX['ref'] = 0;
    this.VNENE_INDEX['indexValue'] = 0;
    this.VNENE_INDEX['indexValueChang'] = 0;
    this.VNENE_INDEX['indexPercChang'] = 0;
    this.VNENE_INDEX['indexTotalQty'] = 0;
    this.VNENE_INDEX['indexTotalValue'] = 0;
    this.VNENE_INDEX['indexCode'] = '';
    this.VNENE_INDEX['indexCd'] = '';
    this.VNENE_INDEX['increase'] = 0;
    this.VNENE_INDEX['equaCeil'] = 0;
    this.VNENE_INDEX['noChange'] = 0;
    this.VNENE_INDEX['decrease'] = 0;
    this.VNENE_INDEX['equaFloor'] = 0;
    this.VNENE_INDEX['tradStatus'] = '';
    this.VNENE_INDEX['messageI'] = [];

    this.VNIND_INDEX['indexArr'] = [];
    this.VNIND_INDEX['ref'] = 0;
    this.VNIND_INDEX['indexValue'] = 0;
    this.VNIND_INDEX['indexValueChang'] = 0;
    this.VNIND_INDEX['indexPercChang'] = 0;
    this.VNIND_INDEX['indexTotalQty'] = 0;
    this.VNIND_INDEX['indexTotalValue'] = 0;
    this.VNIND_INDEX['indexCode'] = '';
    this.VNIND_INDEX['indexCd'] = '';
    this.VNIND_INDEX['increase'] = 0;
    this.VNIND_INDEX['equaCeil'] = 0;
    this.VNIND_INDEX['noChange'] = 0;
    this.VNIND_INDEX['decrease'] = 0;
    this.VNIND_INDEX['equaFloor'] = 0;
    this.VNIND_INDEX['tradStatus'] = '';
    this.VNIND_INDEX['messageI'] = [];

    this.VNMAT_INDEX['indexArr'] = [];
    this.VNMAT_INDEX['ref'] = 0;
    this.VNMAT_INDEX['indexValue'] = 0;
    this.VNMAT_INDEX['indexValueChang'] = 0;
    this.VNMAT_INDEX['indexPercChang'] = 0;
    this.VNMAT_INDEX['indexTotalQty'] = 0;
    this.VNMAT_INDEX['indexTotalValue'] = 0;
    this.VNMAT_INDEX['indexCode'] = '';
    this.VNMAT_INDEX['indexCd'] = '';
    this.VNMAT_INDEX['increase'] = 0;
    this.VNMAT_INDEX['equaCeil'] = 0;
    this.VNMAT_INDEX['noChange'] = 0;
    this.VNMAT_INDEX['decrease'] = 0;
    this.VNMAT_INDEX['equaFloor'] = 0;
    this.VNMAT_INDEX['tradStatus'] = '';
    this.VNMAT_INDEX['messageI'] = [];

    this.VNIT_INDEX['indexArr'] = [];
    this.VNIT_INDEX['ref'] = 0;
    this.VNIT_INDEX['indexValue'] = 0;
    this.VNIT_INDEX['indexValueChang'] = 0;
    this.VNIT_INDEX['indexPercChang'] = 0;
    this.VNIT_INDEX['indexTotalQty'] = 0;
    this.VNIT_INDEX['indexTotalValue'] = 0;
    this.VNIT_INDEX['indexCode'] = '';
    this.VNIT_INDEX['indexCd'] = '';
    this.VNIT_INDEX['increase'] = 0;
    this.VNIT_INDEX['equaCeil'] = 0;
    this.VNIT_INDEX['noChange'] = 0;
    this.VNIT_INDEX['decrease'] = 0;
    this.VNIT_INDEX['equaFloor'] = 0;
    this.VNIT_INDEX['tradStatus'] = '';
    this.VNIT_INDEX['messageI'] = [];

    this.VNXALL_INDEX['indexArr'] = [];
    this.VNXALL_INDEX['ref'] = 0;
    this.VNXALL_INDEX['indexValue'] = 0;
    this.VNXALL_INDEX['indexValueChang'] = 0;
    this.VNXALL_INDEX['indexPercChang'] = 0;
    this.VNXALL_INDEX['indexTotalQty'] = 0;
    this.VNXALL_INDEX['indexTotalValue'] = 0;
    this.VNXALL_INDEX['indexCode'] = '';
    this.VNXALL_INDEX['indexCd'] = '';
    this.VNXALL_INDEX['increase'] = 0;
    this.VNXALL_INDEX['equaCeil'] = 0;
    this.VNXALL_INDEX['noChange'] = 0;
    this.VNXALL_INDEX['decrease'] = 0;
    this.VNXALL_INDEX['equaFloor'] = 0;
    this.VNXALL_INDEX['tradStatus'] = '';
    this.VNXALL_INDEX['messageI'] = [];

    this.VNFINLEAD_INDEX['indexArr'] = [];
    this.VNFINLEAD_INDEX['ref'] = 0;
    this.VNFINLEAD_INDEX['indexValue'] = 0;
    this.VNFINLEAD_INDEX['indexValueChang'] = 0;
    this.VNFINLEAD_INDEX['indexPercChang'] = 0;
    this.VNFINLEAD_INDEX['indexTotalQty'] = 0;
    this.VNFINLEAD_INDEX['indexTotalValue'] = 0;
    this.VNFINLEAD_INDEX['indexCode'] = '';
    this.VNFINLEAD_INDEX['indexCd'] = '';
    this.VNFINLEAD_INDEX['increase'] = 0;
    this.VNFINLEAD_INDEX['equaCeil'] = 0;
    this.VNFINLEAD_INDEX['noChange'] = 0;
    this.VNFINLEAD_INDEX['decrease'] = 0;
    this.VNFINLEAD_INDEX['equaFloor'] = 0;
    this.VNFINLEAD_INDEX['tradStatus'] = '';
    this.VNFINLEAD_INDEX['messageI'] = [];

    this.VNFINSELECT_INDEX['indexArr'] = [];
    this.VNFINSELECT_INDEX['ref'] = 0;
    this.VNFINSELECT_INDEX['indexValue'] = 0;
    this.VNFINSELECT_INDEX['indexValueChang'] = 0;
    this.VNFINSELECT_INDEX['indexPercChang'] = 0;
    this.VNFINSELECT_INDEX['indexTotalQty'] = 0;
    this.VNFINSELECT_INDEX['indexTotalValue'] = 0;
    this.VNFINSELECT_INDEX['indexCode'] = '';
    this.VNFINSELECT_INDEX['indexCd'] = '';
    this.VNFINSELECT_INDEX['increase'] = 0;
    this.VNFINSELECT_INDEX['equaCeil'] = 0;
    this.VNFINSELECT_INDEX['noChange'] = 0;
    this.VNFINSELECT_INDEX['decrease'] = 0;
    this.VNFINSELECT_INDEX['equaFloor'] = 0;
    this.VNFINSELECT_INDEX['tradStatus'] = '';
    this.VNFINSELECT_INDEX['messageI'] = [];

    this.VNDIAMOND_INDEX['indexArr'] = [];
    this.VNDIAMOND_INDEX['ref'] = 0;
    this.VNDIAMOND_INDEX['indexValue'] = 0;
    this.VNDIAMOND_INDEX['indexValueChang'] = 0;
    this.VNDIAMOND_INDEX['indexPercChang'] = 0;
    this.VNDIAMOND_INDEX['indexTotalQty'] = 0;
    this.VNDIAMOND_INDEX['indexTotalValue'] = 0;
    this.VNDIAMOND_INDEX['indexCode'] = '';
    this.VNDIAMOND_INDEX['indexCd'] = '';
    this.VNDIAMOND_INDEX['increase'] = 0;
    this.VNDIAMOND_INDEX['equaCeil'] = 0;
    this.VNDIAMOND_INDEX['noChange'] = 0;
    this.VNDIAMOND_INDEX['decrease'] = 0;
    this.VNDIAMOND_INDEX['equaFloor'] = 0;
    this.VNDIAMOND_INDEX['tradStatus'] = '';
    this.VNDIAMOND_INDEX['messageI'] = [];

    this.VNX200_INDEX['indexArr'] = [];
    this.VNX200_INDEX['ref'] = 0;
    this.VNX200_INDEX['indexValue'] = 0;
    this.VNX200_INDEX['indexValueChang'] = 0;
    this.VNX200_INDEX['indexPercChang'] = 0;
    this.VNX200_INDEX['indexTotalQty'] = 0;
    this.VNX200_INDEX['indexTotalValue'] = 0;
    this.VNX200_INDEX['indexCode'] = '';
    this.VNX200_INDEX['indexCd'] = 'VNX200';
    this.VNX200_INDEX['increase'] = 0;
    this.VNX200_INDEX['equaCeil'] = 0;
    this.VNX200_INDEX['noChange'] = 0;
    this.VNX200_INDEX['decrease'] = 0;
    this.VNX200_INDEX['equaFloor'] = 0;
    this.VNX200_INDEX['tradStatus'] = '';
    this.VNX200_INDEX['messageI'] = [];
    // Khởi tạo dữ liệu config
    const expTimeout = localStorage.getItem('expTimeoutLocal');
    if (!isNaN(expTimeout)) {
      this.expTimeout = Number(expTimeout);
    }
    const shortKeyOrder = localStorage.getItem('shortKeyOrder');
    const shortKeyOrderBook = localStorage.getItem('shortKeyOrderBook');
    if (shortKeyOrder) this.shortKeyOrder = shortKeyOrder;
    if (shortKeyOrderBook) this.shortKeyOrderBook = shortKeyOrderBook;

    // Dữ liệu local state main page
    this.localData = {
      sidebar: {},
      price_chart: {},
      price_table: {},
      chart: {},
      bottom: {},
      left_handle: {},
      right_handle: {},
      bottom_handle: {},
      bottom_tab: 'order-list',
    };

    this.actStockCode = '';

    // style bảng điện public
    this.mrk_css_1 = 'divPriceBoard1';
    this.mrk_css_2 = 'divPriceBoard2';
    this.mrk_css_3 = 'divPriceBoard3';

    // notify
    this.notify = {};
    this.notify['common'] = [];
    this.notify['common']['newTotal'] = 0;
    this.notify['chat'] = [];
    this.notify['chat']['newTotal'] = 0;

    // config theme page
    this.themePage = 'dark-theme';
    this.style = {
      'dark-theme': {
        sideBar: {
          colorSearch: "#D3D3D3",
          "background_search": "var(--component__main_dark)",
          "border_search": "1px solid #9E9DB6",
          "color_placehoder_search": "#9E9DB6",
          "background_focusrow": "#36324a",
          "background_menuList": "#67667C",
          background_hover_search: "#2d84a8"
        },
        priceboard: {
          background_focusrow: '#36324a'
        },
        placeOrder: {
          "background_search": "#67667C",
        },
        formControl: {
          borderColor: '#615885',
          backgroundColor: 'inherit',
          color: 'white'
        },
        chartOverView: {
          colorIndex: '#F2994A',
          colorVolume: '#56CCF2',
          colorRef: '#F2C94C',
          backgroundColor_chartArea: '#0d1719',
          backgroundColor: 'var(--secondary__background__color)',
          colorGrid: '#281B0D'
        },
        price_basic_color: '#f2c94c',
        price_basic_less: '#eb5757',
        price_basic_over: '#00ff77',
        price_ceil_color: '#f618fb',
        price_floor_color: '#00d3b8',
        ownForeginer: {
          colorTitle: '#2F80ED',
          colorDomestic: '#A6CEE3',
          colorForeigner: '#1F78B4',
          colordatalabels: '#F2C94C'
        },
        wizardModal: {
          backgroundColor: 'var(--component__main_dark)'
        },
        chartPieStkInfo: {
          fontColor: '#EBEBEB',
          backgroundColor: 'var(--component__main_dark);'
        },
        sparkline: {
          line: '#fc0',
          backgroundColor: '#eeeeee'
        }
      },
      'light-theme': {
        sideBar: {
          colorSearch: "",
          "background_search": "#F5F5F5",
          "border_search": "",
          "color_placehoder_search": "",
          "background_focusrow": "var(--altisss_light)",
          "background_hover_search": "#DEEBFF",
          "background_menuList": "white",
        },
        priceboard: {
          background_focusrow: 'var(--altisss_light)'
        },
        placeOrder: {
          "background_search": "var(--altisss_light)",
        },
        formControl: {
          borderColor: '#615885',
          backgroundColor: 'inherit',
          color: 'white'
        },
        chartOverView: {
          colorIndex: '#F2994A',
          colorVolume: '#2F80ED',
          colorRef: '#D3AF26',
          backgroundColor_chartArea: '#ececec',
          backgroundColor: '#ececec',
          colorGrid: 'rgba(0, 211, 184, 0.2)'
        },
        price_basic_color: 'orange',
        price_basic_less: '#F73032',
        price_basic_over: 'green',
        price_ceil_color: '#f618fb',
        price_floor_color: '#00c5c5',
        ownForeginer: {
          colorTitle: '#2F80ED',
          colorDomestic: '#A6CEE3',
          colorForeigner: '#1F78B4',
          colordatalabels: '#F2C94C'
        },
        wizardModal: {
          backgroundColor: 'var(--component__main_dark)'
        },
        chartPieStkInfo: {
          fontColor: 'var(--text__main_dark)',
          backgroundColor: '#ececec'
        },
        sparkline: {
          line: 'orange',
          backgroundColor: 'var(--component__green)'
        }
      },
      'dark-theme-china': {
        sideBar: {
          colorSearch: "#D3D3D3",
          "background_search": "var(--component__main_dark)",
          "border_search": "1px solid #9E9DB6",
          "color_placehoder_search": "#9E9DB6",
          "background_focusrow": "#36324a",
          "background_menuList": "#67667C",
          background_hover_search: "gray"
        },
        priceboard: {
          background_focusrow: '#36324a'
        },
        placeOrder: {
          "background_search": "#67667C",
        },
        formControl: {
          borderColor: '#615885',
          backgroundColor: 'inherit',
          color: 'white'
        },
        chartOverView: {
          colorIndex: '#F2994A',
          colorVolume: '#56CCF2',
          colorRef: '#F2C94C',
          backgroundColor_chartArea: '#080024',
          backgroundColor: 'var(--secondary__background__color)',
          colorGrid: '#281B0D'
        },
        price_basic_color: '#f2c94c',
        price_basic_less: '#00ff77',
        price_basic_over: '#eb5757',
        price_ceil_color: '#f618fb',
        price_floor_color: '#00d3b8',
        ownForeginer: {
          colorTitle: '#2F80ED',
          colorDomestic: '#A6CEE3',
          colorForeigner: '#1F78B4',
          colordatalabels: '#F2C94C'
        },
        wizardModal: {
          backgroundColor: 'var(--component__main_dark)'
        },
        chartPieStkInfo: {
          fontColor: '#EBEBEB',
          backgroundColor: 'var(--component__main_dark);'
        },
        sparkline: {
          line: '#fc0',
          backgroundColor: '#eeeeee'
        }
      },
      'light-theme-china': {
        sideBar: {
          colorSearch: "",
          "background_search": "#F5F5F5",
          "border_search": "",
          "color_placehoder_search": "",
          "background_focusrow": "var(--altisss_light)",
          "background_hover_search": "#DEEBFF",
          "background_menuList": "white",
        },
        priceboard: {
          background_focusrow: 'var(--altisss_light)'
        },
        placeOrder: {
          "background_search": "var(--altisss_light)",
        },
        formControl: {
          borderColor: '#615885',
          backgroundColor: 'inherit',
          color: 'white'
        },
        chartOverView: {
          colorIndex: '#F2994A',
          colorVolume: '#2F80ED',
          colorRef: '#D3AF26',
          backgroundColor_chartArea: '#ececec',
          backgroundColor: '#ececec',
          colorGrid: 'rgba(0, 211, 184, 0.2)'
        },
        price_basic_color: 'orange',
        price_basic_less: 'green',
        price_basic_over: '#F73032',
        price_ceil_color: '#f618fb',
        price_floor_color: '#00c5c5',
        ownForeginer: {
          colorTitle: '#2F80ED',
          colorDomestic: '#A6CEE3',
          colorForeigner: '#1F78B4',
          colordatalabels: '#F2C94C'
        },
        wizardModal: {
          backgroundColor: 'var(--component__main_dark)'
        },
        chartPieStkInfo: {
          fontColor: 'var(--text__main_dark)',
          backgroundColor: '#ececec'
        },
        sparkline: {
          line: 'orange',
          backgroundColor: 'var(--component__green)'
        }
      },
    }

    // flag synce account
    this.isSynceAccount = false;
    this.listAccountBroker = [];

    this.isSynceStk = true;

    // flag thay doi height tin tuc sidebar
    this.maxNewsSidebar = true;
    // object stklist all lang
    this.stkListJson = {};
    // mảng U8 của các sàn
    this.arrHSX = ["HSX|I|VN30","HSX|I|VN100","HSX|I|VNX50","HSX|I|VNXALL","HSX|I|VNFIN","HSX|I|VNREAL",
    "HSX|I|VNSML","HSX|I|VNMID","HSX|I|VNUTI","HSX|I|VNENE","HSX|I|VNMAT","HSX|I|VNCONS","HSX|I|VNALL",
    "HSX|I|VNSI","HSX|I|VNIND","HSX|I|VNIT","HSX|I|VNFINLEAD","HSX|I|VNFINSELECT","HSX|I|VNDIAMOND"];
    this.arrHNX = ["HNX|I|HNX30"];
    this.arrUPC = [];
    const { remote } = window.require('electron')
    const path = require('path')

    // -- Khởi tạo dữ liệu indexWebWorker -----------------------------  
    this.simsgWebWorker = isDev ? new Worker('../assets/WorkerReqMsgSi.js') : new Worker(`${path.join(remote.app.getAppPath(), 'build/assets/WorkerReqMsgSi.js')}`);
    this.storStkListWebWorker = isDev ? new Worker('../assets/WorkerStoreStkList.js') : new Worker(`${path.join(remote.app.getAppPath(), 'build/assets/WorkerStoreStkList.js')}`);

    this.simsgWebWorker.onmessage = (event) => {
      const obj = JSON.parse(event.data);
      if (obj) {
        const ck_exist = this.getIndexByMsgKey(obj['5']);
        // this.logMessage('Receive message Vào ck_exist: ' + ck_exist);
        if (obj['1'].U10 === '03') {
          if (ck_exist !== undefined && ck_exist != null && ck_exist >= 0) {
            let j = 0, itemNm = '';
            for (j = 0; j < obj['3'].length; j++) {
              itemNm = obj['3'][j];
              this.HNX_PRC_LIST[ck_exist][itemNm] = obj['1'][itemNm];
              if (itemNm === 't132_3') { this.HNX_PRC_LIST[ck_exist].t132_3_color = obj['1'].t132_3_color; }
              if (itemNm === 't132_2') { this.HNX_PRC_LIST[ck_exist].t132_2_color = obj['1'].t132_2_color; }
              if (itemNm === 't132_1') { this.HNX_PRC_LIST[ck_exist].t132_1_color = obj['1'].t132_1_color; }
              if (itemNm === 't133_1') { this.HNX_PRC_LIST[ck_exist].t133_1_color = obj['1'].t133_1_color; }
              if (itemNm === 't133_2') { this.HNX_PRC_LIST[ck_exist].t133_2_color = obj['1'].t133_2_color; }
              if (itemNm === 't133_3') { this.HNX_PRC_LIST[ck_exist].t133_3_color = obj['1'].t133_3_color; }
              // --- tp
            }
          } else {
            this.HNX_PRC_LIST[this.HNX_PRC_LIST.length] = obj['1'];
          }
          if (obj['3'] > 0) { this.event_ServerPushMRKRcvHnxUpd.next('update'); }
        } else if (obj['1'].U10 === '01') {
          if (ck_exist !== undefined && ck_exist != null && ck_exist >= 0) {
            let j = 0, itemNm = '';
            for (j = 0; j < obj['3'].length; j++) {
              itemNm = obj['3'][j];
              this.HSX_PRC_LIST[ck_exist][itemNm] = obj['1'][itemNm];
              if (itemNm === 't132_3') { this.HSX_PRC_LIST[ck_exist].t132_3_color = obj['1'].t132_3_color; }
              if (itemNm === 't132_2') { this.HSX_PRC_LIST[ck_exist].t132_2_color = obj['1'].t132_2_color; }
              if (itemNm === 't132_1') { this.HSX_PRC_LIST[ck_exist].t132_1_color = obj['1'].t132_1_color; }
              if (itemNm === 't133_1') { this.HSX_PRC_LIST[ck_exist].t133_1_color = obj['1'].t133_1_color; }
              if (itemNm === 't133_2') { this.HSX_PRC_LIST[ck_exist].t133_2_color = obj['1'].t133_2_color; }
              if (itemNm === 't133_3') { this.HSX_PRC_LIST[ck_exist].t133_3_color = obj['1'].t133_3_color; }
            }
          } else {
            this.HSX_PRC_LIST[this.HSX_PRC_LIST.length] = obj['1'];
          }
          // this.logMessage('Receive message Vào obj[1].U10 === 01: obj[3] ' + obj['3']);
          if (obj['3'] !== 0) {
            // this.logMessage('message SI event_ServerPushMRKRcvHsxUpd, clientSeq: ' + obj['3']);
            this.event_ServerPushMRKRcvHsxUpd.next('update');
          }
        } else if (obj['1'].U10 === '05') {
          if (ck_exist !== undefined && ck_exist != null && ck_exist >= 0) {
            let j = 0, itemNm = '';
            for (j = 0; j < obj['3'].length; j++) {
              itemNm = obj['3'][j];
              this.UPC_PRC_LIST[ck_exist][itemNm] = obj['1'][itemNm];
              if (itemNm === 't132_3') { this.UPC_PRC_LIST[ck_exist].t132_3_color = obj['1'].t132_3_color; }
              if (itemNm === 't132_2') { this.UPC_PRC_LIST[ck_exist].t132_2_color = obj['1'].t132_2_color; }
              if (itemNm === 't132_1') { this.UPC_PRC_LIST[ck_exist].t132_1_color = obj['1'].t132_1_color; }
              if (itemNm === 't133_1') { this.UPC_PRC_LIST[ck_exist].t133_1_color = obj['1'].t133_1_color; }
              if (itemNm === 't133_2') { this.UPC_PRC_LIST[ck_exist].t133_2_color = obj['1'].t133_2_color; }
              if (itemNm === 't133_3') { this.UPC_PRC_LIST[ck_exist].t133_3_color = obj['1'].t133_3_color; }
            }
          } else {
            this.UPC_PRC_LIST[this.UPC_PRC_LIST.length] = obj['1'];
          }
        }
        // -- update to flv list
        this.updateToFvlList(obj['5']);
        if (obj['4'] === 0) {
          if (obj['2'] != null && obj['2'].length > 2) {
            // this.logMessage('message SI event_ServerPushMRKRcvChangeBgrd, clientSeq: ' + obj['2']);
            this.event_ServerPushMRKRcvChangeBgrd.next(obj['2']);
          }
        }
      }
    }

    this.storStkListWebWorker.onmessage = (event) => {

      const obj = event.data;
      if (this.isChangeLang && obj) {
        this.HNX_PRC_LIST.forEach(item => {
          const objj = obj['1'].find(temp => temp.t55 === item.t55);
          if (objj) {
            item.U9 = objj.U9;
          }
        });
        this.HSX_PRC_LIST.forEach(item => {
          const objj = obj['2'].find(temp => temp.t55 === item.t55);
          if (objj) {
            item.U9 = objj.U9;
          }
        });
        this.UPC_PRC_LIST.forEach(item => {
          const objj = obj['3'].find(temp => temp.t55 === item.t55);
          if (objj) {
            item.U9 = objj.U9;
          }
        });
        this.mrk_StkList = obj['8'].sort(this.compareStkcode);
        this.tradview_StkList = obj['5'];
        obj['6'].forEach((value, key) => {
          this.stkInfoTradviewMap.set(key, value);
        });
        if (this.tradingViewFlag) {
          sessionStorage.setItem('tradinglist', JSON.stringify(this.tradview_StkList));
          sessionStorage.setItem('tradingmap', JSON.stringify(obj['7']));
        }
        const msg = { type: this.getStockListChangeLang };
        this.commonEvent.next(msg);
      } else if (obj) {
        this.HNX_PRC_LIST = obj['1'];
        this.HSX_PRC_LIST = obj['2'];
        this.UPC_PRC_LIST = obj['3'];
        this.mrk_StkList = obj['8'].sort(this.compareStkcode);
        this.tradview_StkList = this.tradview_StkList.concat(obj['5']);
        obj['6'].forEach((value, key) => {
          this.stkInfoTradviewMap.set(key, value);
        });
        if (this.tradingViewFlag) {
          sessionStorage.setItem('tradinglist', JSON.stringify(this.tradview_StkList));
          sessionStorage.setItem('tradingmap', JSON.stringify(obj['7']));
        }
        this.stkListDone = true;
        this.event_FinishGettingMrkInfo(-1);
        this.logMessage('done store stk list');
      }
      // this.storStkListWebWorker.terminate();
    }

    this.newStoreStockList = (stkInfo) => {
      this.storStkListWebWorker.postMessage(JSON.stringify(stkInfo));
    }

    this.event_FinishGettingMrkInfo = (clientSeq) => {
      this.sort_stkList();
      this.event_FinishGetMrkInfo.next(clientSeq);
    };

    //-- process all info from MKT_INFO chanel - server push realtime
    this.proc_ServerPushMRKRcv = (message) => {
      // -- receive info that push from server real time
      let jsonArr = [];
      const strdata = message['Data'];
      try {
        jsonArr = JSON.parse(strdata);
      } catch (error) {
        jsonArr = [];
        return;
      }
      this.process_MrkInfoMsgMuiltData(jsonArr, 0);
      // console.log(jsonArr[0]['t341'], jsonArr)
    };

    this.process_MrkInfoMsgMuiltData = (msgInfo = [], clientSeq = 0) => {
      let i = 0;
      for (i = 0; i < msgInfo.length; i++) {
        // console.log(msgInfo[i], clientSeq)
        this.sprocess_ForOneMsg(msgInfo[i], clientSeq);
      }
    }

    this.sprocess_ForOneMsg = (msg = {}, clientSeq = 0) => {
      if (msg['U8'] == null || msg['U8'] === undefined || msg['U8'].trim().length === 0) { return; }
      switch (msg['U7']) {
        case 'SI':
          if (msg['t167'] != null && msg['t167'] === 'BO' && msg['U10'] != null && msg['U10'] === '01') { break; };
          this.update2MrkInfoMsgMap('SI', msg, clientSeq);
          break;
        case 'TP':
          this.update2MrkInfoMsgMap('TP', msg, clientSeq);
          break;
        case 'EP':
          this.update2MrkInfoMsgMap('EP', msg, clientSeq);
          break;
        case 'I':
          this.update2MrkInfoMsgMap('I', msg, clientSeq);
          break;
        case 'BI':
          this.update2MrkInfoMsgMap('BI', msg, clientSeq);
          break;
        case 'TS':
          this.update2MrkInfoMsgMap('TS', msg, clientSeq);
          break;
        case 'AA':
          this.update2MrkInfoMsgMap('AA', msg, clientSeq);
          break;
        case 'S':
          this.update2MrkInfoMsgMap('S', msg, clientSeq);
          break;
        default:
          // this.logMessage("Invalid choice: " + msg['U7']);
          break;
      }
      return;
    };

    this.update2MrkInfoMsgMap = (msgTp, msgObj, clientSeq) => {
      // let splitted, msgKey;
      switch (msgTp) {
        case 'SI':
          setTimeout(() => { this.updSI_Msg2MrkInfoMap(msgObj, clientSeq); });
          break;
        case 'TP':
          const splitted = msgObj['U8'].split('|', 3);
          const msgKey = splitted[0] + '_' + splitted[2];
          this.TP_MSG_MAP.set(msgKey, msgObj);
          this.TPTimeout[++this.TPTimeoutCt] = setTimeout(() => {
            this.updTP_Msg2MrkInfoMap(this.TPTimeoutCt, clientSeq);
          });
          break;
        case 'EP':
          if (!this.tradingViewFlag && (this.objShareGlb['stkAtc']['t55'] !== msgObj['t55'] && this.objShareGlb['stkOrd']['t55'] !== msgObj['t55'])) { break; }
          this.updEP_Msg2MrkInfoMap(clientSeq, msgObj);
          break;
        case 'I':
          if (msgObj['U8'] == null || msgObj['U8'].trim().length === 0) { break; }
          this.updI_Msg2MrkInfoMap(clientSeq, msgObj);
          break;
        case 'BI':
          if (msgObj['U8'] == null || msgObj['U8'].trim().length === 0) { break; }
          this.updBI_Msg2MrkInfoMap(msgObj);
          break;
        case 'TS':
          if (msgObj == null || msgObj === undefined || clientSeq > 0) { break; }
          this.updTS_Msg2MrkInfoMap(msgObj);
          break;
        case 'AA':
          if (msgObj == null || msgObj === undefined) { break; }
          setTimeout(() => {
            this.updAA_Msg2MrkInfoMap(msgObj);
          }, 0);
          break;
        case 'S':
          // if(clientSeq == 0){
          // this.glbStore.mrkSmessage_MsgMap.set(msgObj["U8"], msgObj);
          // }
          break;
        default:
          // this.logMessage("Invalid choice");
          // this.logMessage("msTp: " + msgTp);
          break;
      }
      return;
    };

    this.proc_ClientReqMRKRcv = (message) => {
      const clientSeq = Number(message['ClientSeq']);
      if (clientSeq == null || clientSeq === undefined || clientSeq <= 0) { return; }

      let reqInfoMap = new requestInfo();
      reqInfoMap = this.getReqInfoMapValue(clientSeq);
      if (message['Message'] === 'DONE') {
        if (reqInfoMap != null && reqInfoMap.reqFunct === 'GET_INDEX_HIST') {
          this.finishGetImsg = true;
        } else if (reqInfoMap && (reqInfoMap.reqFunct === this.getLast_Imsg ||
          reqInfoMap.reqFunct === this.getStk_list || reqInfoMap.reqFunct === this.getMoreEp_msg)) {
          // -- Hoan tat lay thong tin CK    
          this.event_FinishGettingMrkInfo(clientSeq);
          if (reqInfoMap.reqFunct === this.getStk_list) {
            this.stkListDone = true;
          } else if (reqInfoMap.reqFunct === this.getLast_Imsg) {
            this.finishGetLastIndex = true;
            setTimeout(() => this.getIndexlist(), 0);
          }
        } else if (reqInfoMap && reqInfoMap.reqFunct && reqInfoMap.reqFunct.length >= 9 && (reqInfoMap.reqFunct.substr(0, 9) === 'SUBSCRIBE')) {
          this.event_FinishSunbcribeFunct.next(reqInfoMap.reqFunct);
        } else if (reqInfoMap && reqInfoMap.reqFunct && reqInfoMap.reqFunct === this.subactive_stk) {
          setTimeout(() => this.event_FinishSunbcribeFunct.next(reqInfoMap.reqFunct), 1000);
        }
      }

      let jsonArr = [];
      const strdata = message['Data'];
      if (strdata != null && strdata !== undefined && strdata.trim() !== '') {
        try {
          jsonArr = JSON.parse(strdata);
        } catch (error) {
          this.logMessage('Error when parse json the market info: ' + error);
          this.logMessage('message: ' + JSON.stringify(message));
          return;
        }
      }

      if (reqInfoMap && reqInfoMap.reqFunct === this.getStk_list) {
        if (Number(message['Result']) === 1 && jsonArr.length > 0) {
          this.storeStockList(jsonArr);
        }
      } else {
        if (Number(message['Result']) === 1 && jsonArr.length > 0) {
          this.process_MrkInfoMsgMuiltData(jsonArr, Number(message['ClientSeq']));
        }
      }
    };

    this.getIndexByMsgKey = (msgKey) => {
      let indexObj
      if (msgKey.substr(0, 3) === 'HSX') {
        indexObj = this.HSX_PRC_LIST.findIndex(o => o.itemName === msgKey);
      } else if (msgKey.substr(0, 3) === 'HNX') {
        indexObj = this.HNX_PRC_LIST.findIndex(o => o.itemName === msgKey);
        if (indexObj == null || indexObj === undefined || indexObj < 0) {
          indexObj = this.UPC_PRC_LIST.findIndex(o => o.itemName === msgKey);
        }
      }
      if (indexObj === -1) {
        indexObj = null;
      }
      return indexObj;
    };

    this.sort_stkList = () => {
      this.HSX_PRC_LIST.sort((a, b) => (a.t55 > b.t55) ? 1 : ((b.t55 > a.t55) ? -1 : 0));
      this.HNX_PRC_LIST.sort((a, b) => (a.t55 > b.t55) ? 1 : ((b.t55 > a.t55) ? -1 : 0));
      this.UPC_PRC_LIST.sort((a, b) => (a.t55 > b.t55) ? 1 : ((b.t55 > a.t55) ? -1 : 0));
    };

    //-- Start process a message from MKT_INFO chanel - auto pushed by server
    this.updSI_Msg2MrkInfoMap = (msgObj, clientSeq) => {
      // console.log('Start message SI clientSeq: ',msgObj);
      const splitted = msgObj['U8'].split('|', 3);
      const mskey = splitted[0] + '_' + splitted[2];
      let stkMsgObj = this.getMsgObjectByMsgKey(mskey);
      if (stkMsgObj == null || stkMsgObj === undefined) {
        stkMsgObj = new stkPriceBoard();
      }
      if (msgObj.seq >= stkMsgObj.seq) {
        let ls_unit_change = '', itemNm = '';
        const changList = [];
        let changListLength = 0;
        let ck_exist = -1, j = 0;

        /*eslint no-useless-concat: "off"*/
        if (stkMsgObj.itemName !== null && stkMsgObj.itemName !== undefined) {
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
          if (stkMsgObj.t332 !== msgObj.t332) { // giá trần
            changList.push('t332');
          }
          if (stkMsgObj.t333 == null || stkMsgObj.t333 === undefined) { stkMsgObj.t333 = 0; }
          if (msgObj.t333 == null || msgObj.t333 === undefined) { msgObj.t333 = 0; }
          if (stkMsgObj.t333 !== msgObj.t333) { // giá sàn
            changList.push('t333');
          }

          if (stkMsgObj.t260 == null || stkMsgObj.t260 === undefined) { stkMsgObj.t260 = 0; }
          if (msgObj.t260 == null || msgObj.t260 === undefined) { msgObj.t260 = 0; }
          if (stkMsgObj.t260 !== msgObj.t260) { // giá tham chiếu
            changList.push('t260');
          }

          //-- Chứng quyền        
          if (stkMsgObj.U24 == null || stkMsgObj.U24 === undefined) { stkMsgObj.U24 = ''; }
          if (msgObj.U24 == null || msgObj.U24 === undefined) { msgObj.U24 = ''; }
          if (stkMsgObj.U24 !== msgObj.U24) {
            changList.push('U24');
          }
          if (stkMsgObj.U22 == null || stkMsgObj.U22 === undefined) { stkMsgObj.U22 = 0; }
          if (msgObj.U22 == null || msgObj.U22 === undefined) { msgObj.U22 = 0; }
          if (stkMsgObj.U22 !== msgObj.U22) {
            changList.push('U22');
          }
          if (stkMsgObj.U23 == null || stkMsgObj.U23 === undefined) { stkMsgObj.U23 = ''; }
          if (msgObj.U23 == null || msgObj.U23 === undefined) { msgObj.U23 = ''; }
          if (stkMsgObj.U23 !== msgObj.U23) {
            changList.push('U23');
          }
          if (stkMsgObj.t109 == null || stkMsgObj.t109 === undefined) { stkMsgObj.t109 = 0; }
          if (msgObj.t109 == null || msgObj.t109 === undefined) { msgObj.t109 = 0; }
          if (stkMsgObj.t109 !== msgObj.t109) {
            changList.push('t109');
          }
          if (stkMsgObj.U20 == null || stkMsgObj.U20 === undefined) { stkMsgObj.U20 = ''; }
          if (msgObj.U20 == null || msgObj.U20 === undefined) { msgObj.U20 = ''; }
          if (stkMsgObj.U20 !== msgObj.U20) {
            changList.push('U20');
          }
          // if (stkMsgObj.U20 == null || stkMsgObj.U20 === undefined) { stkMsgObj.U20 = ''; }
          // if (msgObj.U20 == null || msgObj.U20 === undefined) { msgObj.U20 = ''; }
          // if (stkMsgObj.U20 !== msgObj.U20) {
          //   changList.push('U20');
          // }
          if (stkMsgObj.U21 == null || stkMsgObj.U21 === undefined) { stkMsgObj.U21 = ''; }
          if (msgObj.U21 == null || msgObj.U21 === undefined) { msgObj.U21 = ''; }
          if (stkMsgObj.U21 !== msgObj.U21) {
            changList.push('U21');
          }
          if (stkMsgObj.U19 == null || stkMsgObj.U19 === undefined) { stkMsgObj.U19 = ''; }
          if (msgObj.U19 == null || msgObj.U19 === undefined) { msgObj.U19 = ''; }
          if (stkMsgObj.U19 !== msgObj.U19) {
            changList.push('U19');
          }

        //-- U29, U30, U31--
				if (stkMsgObj.U29 === null || stkMsgObj.U29 === undefined) {
					stkMsgObj.U29 = 0;
				}
				if (msgObj.U29 === null || msgObj.U29 === undefined) {
					msgObj.U29 =  0;
				}
				if (stkMsgObj.U29 !== msgObj.U29) {
					changList.push('U29');
				}
				if (stkMsgObj.U30 === null || stkMsgObj.U30 === undefined) {
					stkMsgObj.U30 = 0;
				}
				if (msgObj.U30 === null || msgObj.U30 === undefined) {
					msgObj.U30 =  0;
				}
				if (stkMsgObj.U30 !== msgObj.U30) {
					changList.push('U30');
				}
				if (stkMsgObj.U31 === null || stkMsgObj.U31 === undefined) {
					stkMsgObj.U31 = 0;
				}
				if (msgObj.U31 === null || msgObj.U31 === undefined) {
					msgObj.U31 =  0;
				}
				if (stkMsgObj.U31 !== msgObj.U31) {
					changList.push('U31');
				}
				//-- end for U29, U30, U31

          changListLength = changList.length;
          if (changList.length === 0) {
            // --this.glbStore.msgQuese;
            return;
          }

          // -- Xét màu t31 - giá khớp hiện tại
          if (msgObj.t31 === 0 || msgObj.t31 === undefined || Math.round(msgObj.t31 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
            msgObj.t31_color = this.price_basic_color;
          } else if (Math.round(msgObj.t31 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t31 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
              msgObj.t31_color = this.price_ceil_color;
            } else {
              msgObj.t31_color = this.price_basic_over;
            }
          } else if (Math.round(msgObj.t31 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t31 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
              msgObj.t31_color = this.price_floor_color;
            } else {
              msgObj.t31_color = this.price_basic_less;
            }
          }
          // -- Xét màu t31mb - giá khớp hiện tại mobile
          if (msgObj.t31 === 0 || msgObj.t31 === undefined || msgObj.t31 === msgObj.t260) {
            msgObj.t31mb_color = this.price_basic_color_mb;
          } else if (msgObj.t31 > msgObj.t260) {
            if (msgObj.t31 === msgObj.t332) {
              msgObj.t31mb_color = this.price_ceil_color_mb;
            } else {
              msgObj.t31mb_color = this.price_basic_over_mb;
            }
          } else if (Math.round(msgObj.t31 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t31 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
              msgObj.t31mb_color = this.price_floor_color_mb;
            } else {
              msgObj.t31mb_color = this.price_basic_less_mb;
            }
          }// -- end xet mau t31mb
          // -- Xét màu t132_3 - Dư mua 3
          if (Math.round(msgObj.t132_3 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
            msgObj.t132_3_color = this.price_basic_color;
          } else if (Math.round(msgObj.t132_3 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t132_3 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
              msgObj.t132_3_color = this.price_ceil_color;
            } else {
              msgObj.t132_3_color = this.price_basic_over;
            }
          } else if (Math.round(msgObj.t132_3 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t132_3 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
              msgObj.t132_3_color = this.price_floor_color;
            } else {
              msgObj.t132_3_color = this.price_basic_less;
            }
          }
          // -- Xét màu t132_2 - Dư mua 2
          if (Math.round(msgObj.t132_2 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
            msgObj.t132_2_color = this.price_basic_color;
          } else if (Math.round(msgObj.t132_2 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t132_2 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
              msgObj.t132_2_color = this.price_ceil_color;
            } else {
              msgObj.t132_2_color = this.price_basic_over;
            }
          } else if (Math.round(msgObj.t132_2 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t132_2 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
              msgObj.t132_2_color = this.price_floor_color;
            } else {
              msgObj.t132_2_color = this.price_basic_less;
            }
          }
          // -- Xét màu t132_1 - Dư mua 1
          if (Math.round(msgObj.t132_1 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
            msgObj.t132_1_color = this.price_basic_color;
          } else if (Math.round(msgObj.t132_1 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
            if (msgObj.t132_1 === 777777710000 || msgObj.t132_1 === 777777720000) {
              msgObj.t132_1_color = this.defaultColor;
            } else if (Math.round(msgObj.t132_1 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
              msgObj.t132_1_color = this.price_ceil_color;
            } else {
              msgObj.t132_1_color = this.price_basic_over;
            }
          } else if (Math.round(msgObj.t132_1 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t132_1 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
              msgObj.t132_1_color = this.price_floor_color;
            } else {
              msgObj.t132_1_color = this.price_basic_less;
            }
          }
          // -- Xét màu t133_1 - Dư bán 1 (t332 == trần, t333 = sàn)
          if (Math.round(msgObj.t133_1 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
            msgObj.t133_1_color = this.price_basic_color;
          } else if (Math.round(msgObj.t133_1 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
            if (msgObj.t133_1 === 777777710000 || msgObj.t133_1 === 777777720000) {
              msgObj.t133_1_color = this.defaultColor;
            } else if (Math.round(msgObj.t133_1 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
              msgObj.t133_1_color = this.price_ceil_color;
            } else {
              msgObj.t133_1_color = this.price_basic_over;
            }
          } else if (Math.round(msgObj.t133_1 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
            if (msgObj.t133_1 === msgObj.t333) {
              msgObj.t133_1_color = this.price_floor_color;
            } else {
              msgObj.t133_1_color = this.price_basic_less;
            }
          }
          // -- Xét màu t133_2 - Dư bán 2
          if (Math.round(msgObj.t133_2 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
            msgObj.t133_2_color = this.price_basic_color;
          } else if (Math.round(msgObj.t133_2 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t133_2 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
              msgObj.t133_2_color = this.price_ceil_color;
            } else {
              msgObj.t133_2_color = this.price_basic_over;
            }
          } else if (Math.round(msgObj.t133_2 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t133_2 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
              msgObj.t133_2_color = this.price_floor_color;
            } else {
              msgObj.t133_2_color = this.price_basic_less;
            }
          }
          // -- Xét màu t133_3 - Dư bán 3
          if (Math.round(msgObj.t133_3 * 1000) / 1000 === Math.round(msgObj.t260 * 1000) / 1000) {
            msgObj.t133_3_color = this.price_basic_color;
          } else if (Math.round(msgObj.t133_3 * 1000) / 1000 > Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t133_3 * 1000) / 1000 === Math.round(msgObj.t332 * 1000) / 1000) {
              msgObj.t133_3_color = this.price_ceil_color;
            } else {
              msgObj.t133_3_color = this.price_basic_over;
            }
          } else if (Math.round(msgObj.t133_3 * 1000) / 1000 < Math.round(msgObj.t260 * 1000) / 1000) {
            if (Math.round(msgObj.t133_3 * 1000) / 1000 === Math.round(msgObj.t333 * 1000) / 1000) {
              msgObj.t133_3_color = this.price_floor_color;
            } else {
              msgObj.t133_3_color = this.price_basic_less;
            }
          }

          // -- Xét màu t137 -- Giá mở cửa
          if (msgObj.t137 === 0 || msgObj.t137 === msgObj.t260) {
            msgObj.t137_color = this.price_basic_color;
          } else if (msgObj.t137 > msgObj.t260) {
            if (msgObj.t137 === msgObj.t332) {
              msgObj.t137_color = this.price_ceil_color;
            } else {
              msgObj.t137_color = this.price_basic_over;
            }
          } else if (msgObj.t137 < msgObj.t260) {
            if (msgObj.t137 === msgObj.t333) {
              msgObj.t137_color = this.price_floor_color;
            } else {
              msgObj.t137_color = this.price_basic_less;
            }
          }
          // -- Xét màu t631 - Giá trung bình
          if (msgObj.t631 === 0 || msgObj.t631 === msgObj.t260) {
            msgObj.t631_color = this.price_basic_color;
          } else if (msgObj.t631 > msgObj.t260) {
            if (msgObj.t631 === msgObj.t332) {
              msgObj.t631_color = this.price_ceil_color;
            } else {
              msgObj.t631_color = this.price_basic_over;
            }
          } else if (msgObj.t631 < msgObj.t260) {
            if (msgObj.t631 === msgObj.t333) {
              msgObj.t631_color = this.price_floor_color;
            } else {
              msgObj.t631_color = this.price_basic_less;
            }
          }
          // -- Xét màu t266 - Gía cao
          if (msgObj.t266 === 0 || msgObj.t266 === msgObj.t260) {
            msgObj.t266_color = this.price_basic_color;
          } else if (msgObj.t266 > msgObj.t260) {
            if (msgObj.t266 === msgObj.t332) {
              msgObj.t266_color = this.price_ceil_color;
            } else {
              msgObj.t266_color = this.price_basic_over;
            }
          } else if (msgObj.t266 < msgObj.t260) {
            if (msgObj.t266 === msgObj.t333) {
              msgObj.t266_color = this.price_floor_color;
            } else {
              msgObj.t266_color = this.price_basic_less;
            }
          }
          // -- Xét màu t2661 - Gía thấp
          if (msgObj.t2661 === 0 || msgObj.t2661 === msgObj.t260) {
            msgObj.t2661_color = this.price_basic_color;
          } else if (msgObj.t2661 > msgObj.t260) {
            if (msgObj.t2661 === msgObj.t332) {
              msgObj.t2661_color = this.price_ceil_color;
            } else {
              msgObj.t2661_color = this.price_basic_over;
            }
          } else if (msgObj.t2661 < msgObj.t260) {
            if (msgObj.t2661 === msgObj.t333) {
              msgObj.t2661_color = this.price_floor_color;
            } else {
              msgObj.t2661_color = this.price_basic_less;
            }
          }
          // -- Xét màu t139 - Giá đóng cửa
          if (msgObj.t139 === 0 || msgObj.t139 === msgObj.t260) {
            msgObj.t139_color = this.price_basic_color;
          } else if (msgObj.t139 > msgObj.t260) {
            if (msgObj.t139 === msgObj.t332) {
              msgObj.t139_color = this.price_ceil_color;
            } else {
              msgObj.t139_color = this.price_basic_over;
            }
          } else if (msgObj.t139 < msgObj.t260) {
            if (msgObj.t139 === msgObj.t333) {
              msgObj.t139_color = this.price_floor_color;
            } else {
              msgObj.t139_color = this.price_basic_less;
            }
          }

          // -- Update new value which property change of an item (as cell of rows)
          // ck_exist = this.glbStore.msgMrkInfoArr_indexMap.get(mskey);
          ck_exist = this.getIndexByMsgKey(mskey);
          if (msgObj.U10 === '03') {
            if (ck_exist !== undefined && ck_exist != null && ck_exist >= 0) {

              for (j = 0; j < changListLength; j++) {

                itemNm = changList[j];
                // Lỗi t3301 of undefiend
                // console.log(ck_exist,this.HNX_PRC_LIST,this.HNX_PRC_LIST[ck_exist],itemNm,msgObj,msgObj[itemNm]);
                // console.log(this.HNX_PRC_LIST[ck_exist][itemNm]);
                if (this.HNX_PRC_LIST[ck_exist] == null) return; // fix tạm thời

                this.HNX_PRC_LIST[ck_exist][itemNm] = msgObj[itemNm];
                if (itemNm === 't31') {
                  const t31_incr = (msgObj[itemNm] === 777777710000 ? 0 : (msgObj[itemNm] === 777777720000 ? 0 : ((msgObj[itemNm] === undefined ? 0 : (msgObj[itemNm] - msgObj['t260'])))));
                  this.HNX_PRC_LIST[ck_exist].t31_incr = t31_incr;
                  const t31_incr_per = (msgObj[itemNm] == 777777710000 ? 0 : (msgObj[itemNm] == 777777720000 ? 0 : (((msgObj[itemNm] == undefined || msgObj['t260'] == undefined || msgObj['t260'] === 0) ? 0 : ((msgObj[itemNm] - msgObj['t260']) * 100) / msgObj['t260']))));
                  this.HNX_PRC_LIST[ck_exist].t31_incr_per = t31_incr_per;
                  this.HNX_PRC_LIST[ck_exist].t31_color = msgObj.t31_color;
                }
                // -- for t31mb
                if (itemNm === 't31') { this.HNX_PRC_LIST[ck_exist].t31mb_color = msgObj.t31mb_color; }
                if (itemNm === 't132_3') {
                  this.HNX_PRC_LIST[ck_exist].t132_3_color = msgObj.t132_3_color;
                }
                if (itemNm === 't132_2') {
                  this.HNX_PRC_LIST[ck_exist].t132_2_color = msgObj.t132_2_color;
                }
                if (itemNm === 't132_1') {
                  this.HNX_PRC_LIST[ck_exist].t132_1_color = msgObj.t132_1_color;
                }
                if (itemNm === 't133_1') {
                  this.HNX_PRC_LIST[ck_exist].t133_1_color = msgObj.t133_1_color;
                }
                if (itemNm === 't133_2') {
                  this.HNX_PRC_LIST[ck_exist].t133_2_color = msgObj.t133_2_color;
                }
                if (itemNm === 't133_3') {
                  this.HNX_PRC_LIST[ck_exist].t133_3_color = msgObj.t133_3_color;
                }
                if (itemNm === 't137') {
                  this.HNX_PRC_LIST[ck_exist].t137_color = msgObj.t137_color;
                }
                if (itemNm === 't631') {
                  this.HNX_PRC_LIST[ck_exist].t631_color = msgObj.t631_color;
                }
                if (itemNm === 't266') {
                  this.HNX_PRC_LIST[ck_exist].t266_color = msgObj.t266_color;
                }
                if (itemNm === 't2661') {
                  this.HNX_PRC_LIST[ck_exist].t2661_color = msgObj.t2661_color;
                }
                if (itemNm === 't139') {
                  this.HNX_PRC_LIST[ck_exist].t139_color = msgObj.t139_color;
                }
              }
              // if (clientSeq > 0) { this.event_ServerPushMRKRcvHnxUpd.next('update'); }
              // this.event_ServerPushMRKRcvHnxUpd.next('update');
              let objchange = { data: this.HNX_PRC_LIST[ck_exist], change: ls_unit_change.substr(0, ls_unit_change.length - 1) };
              this.mrkInfoEvent.next(objchange);
            }
          } else if (msgObj.U10 === '01') {
            if (ck_exist !== undefined && ck_exist != null && ck_exist >= 0) {
              for (j = 0; j < changListLength; j++) {
                itemNm = changList[j];
                this.HSX_PRC_LIST[ck_exist][itemNm] = msgObj[itemNm];
                if (itemNm === 't31') {
                  const t31_incr = (msgObj[itemNm] === 777777710000 ? 0 : (msgObj[itemNm] === 777777720000 ? 0 : ((msgObj[itemNm] === undefined ? 0 : (msgObj[itemNm] - msgObj['t260'])))));
                  const t31_incr_per = (msgObj[itemNm] === 777777710000 ? 0 : (msgObj[itemNm] === 777777720000 ? 0 : (((msgObj[itemNm] == undefined || msgObj['t260'] == undefined || msgObj['t260'] === 0) ? 0 : ((msgObj[itemNm] - msgObj['t260']) * 100) / msgObj['t260']))));
                  this.HSX_PRC_LIST[ck_exist].t31_incr_per = t31_incr_per;
                  this.HSX_PRC_LIST[ck_exist].t31_incr = t31_incr;
                  this.HSX_PRC_LIST[ck_exist].t31_color = msgObj.t31_color;
                  this.HSX_PRC_LIST[ck_exist].t31_bgr = msgObj.t31_bgr || '';
                }
                // -- for t31mb
                if (itemNm === 't31') { this.HSX_PRC_LIST[ck_exist].t31mb_color = msgObj.t31mb_color; }
                if (itemNm === 't132_3') {
                  this.HSX_PRC_LIST[ck_exist].t132_3_color = msgObj.t132_3_color;
                }
                if (itemNm === 't132_2') {
                  this.HSX_PRC_LIST[ck_exist].t132_2_color = msgObj.t132_2_color;
                }
                if (itemNm === 't132_1') {
                  this.HSX_PRC_LIST[ck_exist].t132_1_color = msgObj.t132_1_color;
                }
                if (itemNm === 't133_1') {
                  this.HSX_PRC_LIST[ck_exist].t133_1_color = msgObj.t133_1_color;
                }
                if (itemNm === 't133_2') {
                  this.HSX_PRC_LIST[ck_exist].t133_2_color = msgObj.t133_2_color;
                }
                if (itemNm === 't133_3') {
                  this.HSX_PRC_LIST[ck_exist].t133_3_color = msgObj.t133_3_color;
                }
                if (itemNm === 't137') {
                  this.HSX_PRC_LIST[ck_exist].t137_color = msgObj.t137_color;
                }
                if (itemNm === 't631') {
                  this.HSX_PRC_LIST[ck_exist].t631_color = msgObj.t631_color;
                }
                if (itemNm === 't266') {
                  this.HSX_PRC_LIST[ck_exist].t266_color = msgObj.t266_color;
                }
                if (itemNm === 't2661') {
                  this.HSX_PRC_LIST[ck_exist].t2661_color = msgObj.t2661_color;
                }
                if (itemNm === 't139') {
                  this.HSX_PRC_LIST[ck_exist].t139_color = msgObj.t139_color;
                }
              }
              // if (clientSeq > 0) {
              //   this.event_ServerPushMRKRcvHsxUpd.next('update');
              // }
              let objchange = { data: this.HSX_PRC_LIST[ck_exist], change: ls_unit_change.substr(0, ls_unit_change.length - 1) };
              this.mrkInfoEvent.next(objchange);
            }
          } else if (msgObj.U10 === '05') {
            if (ck_exist !== undefined && ck_exist != null && ck_exist >= 0) {
              for (j = 0; j < changListLength; j++) {
                itemNm = changList[j];
                this.UPC_PRC_LIST[ck_exist][itemNm] = msgObj[itemNm];
                if (itemNm === 't31') {
                  const t31_incr = (msgObj[itemNm] === 777777710000 ? 0 : (msgObj[itemNm] === 777777720000 ? 0 : ((msgObj[itemNm] === undefined ? 0 : (msgObj[itemNm] - msgObj['t260'])))));
                  const t31_incr_per = (msgObj[itemNm] == 777777710000 ? 0 : (msgObj[itemNm] == 777777720000 ? 0 : (((msgObj[itemNm] == undefined || msgObj['t260'] == undefined || msgObj['t260'] === 0) ? 0 : ((msgObj[itemNm] - msgObj['t260']) * 100) / msgObj['t260']))));
                  this.UPC_PRC_LIST[ck_exist].t31_incr_per = t31_incr_per;
                  this.UPC_PRC_LIST[ck_exist].t31_incr = t31_incr;
                  this.UPC_PRC_LIST[ck_exist].t31_color = msgObj.t31_color;
                }
                // -- for t31mb
                if (itemNm === 't31') { this.UPC_PRC_LIST[ck_exist].t31mb_color = msgObj.t31mb_color; }
                if (itemNm === 't132_3') {
                  this.UPC_PRC_LIST[ck_exist].t132_3_color = msgObj.t132_3_color;
                }
                if (itemNm === 't132_2') {
                  this.UPC_PRC_LIST[ck_exist].t132_2_color = msgObj.t132_2_color;
                }
                if (itemNm === 't132_1') {
                  this.UPC_PRC_LIST[ck_exist].t132_1_color = msgObj.t132_1_color;
                }
                if (itemNm === 't133_1') {
                  this.UPC_PRC_LIST[ck_exist].t133_1_color = msgObj.t133_1_color;
                }
                if (itemNm === 't133_2') {
                  this.UPC_PRC_LIST[ck_exist].t133_2_color = msgObj.t133_2_color;
                }
                if (itemNm === 't133_3') {
                  this.UPC_PRC_LIST[ck_exist].t133_3_color = msgObj.t133_3_color;
                }
                if (itemNm === 't137') {
                  this.UPC_PRC_LIST[ck_exist].t137_color = msgObj.t137_color;
                }
                if (itemNm === 't631') {
                  this.UPC_PRC_LIST[ck_exist].t631_color = msgObj.t631_color;
                }
                if (itemNm === 't266') {
                  this.UPC_PRC_LIST[ck_exist].t266_color = msgObj.t266_color;
                }
                if (itemNm === 't2661') {
                  this.UPC_PRC_LIST[ck_exist].t2661_color = msgObj.t2661_color;
                }
                if (itemNm === 't139') {
                  this.UPC_PRC_LIST[ck_exist].t139_color = msgObj.t139_color;
                }
              }
              // if (clientSeq > 0) { this.event_ServerPushMRKRcvUpcUpd.next('update'); }
              // this.event_ServerPushMRKRcvUpcUpd.next('update');
              let objchange = { data: this.UPC_PRC_LIST[ck_exist], change: ls_unit_change.substr(0, ls_unit_change.length - 1) };
              this.mrkInfoEvent.next(objchange);
            }
          }
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
          stkMsgObj.U24 = msgObj.U24; // CK cơ sở (cho Chứng quyền)
          stkMsgObj.U22 = msgObj.U22; // Giá thực hiện (cho Chứng quyền)
          stkMsgObj.U23 = msgObj.U23; // Tỷ lệ chuyển đổi (cho Chứng quyền)
          stkMsgObj.t109 = msgObj.t109; // Khối lượng niêm yết (cho Chứng quyền)
          stkMsgObj.U20 = msgObj.U20; // Ngày Đáo hạn
          stkMsgObj.U21 = msgObj.U21; // Ngày GD gần nhất
          stkMsgObj.U19 = msgObj.U19; // Loại chứng quyền      
          stkMsgObj.U19 = msgObj.U19; // Loại chứng quyền
          stkMsgObj.U29 = msgObj.U29; // Giá trần dự kiến
          stkMsgObj.U30 = msgObj.U30; // Giá sàn dự kiến
          stkMsgObj.U31 = msgObj.U31; // Giá tham chiếu dự kiến

          // -- Xét màu t31 - giá khớp hiện tại
          if (stkMsgObj.t31 === 0 || stkMsgObj.t31 === undefined || Math.round(stkMsgObj.t31 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
            stkMsgObj.t31_color = this.price_basic_color;
          } else if (Math.round(stkMsgObj.t31 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t31 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
              stkMsgObj.t31_color = this.price_ceil_color;
            } else {
              stkMsgObj.t31_color = this.price_basic_over;
            }
          } else if (Math.round(stkMsgObj.t31 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t31 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
              stkMsgObj.t31_color = this.price_floor_color;
            } else {
              stkMsgObj.t31_color = this.price_basic_less;
            }
          }
          // -- Xét màu t132_3 - Dư mua 3
          if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
            stkMsgObj.t132_3_color = this.price_basic_color;
          } else if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
              stkMsgObj.t132_3_color = this.price_ceil_color;
            } else {
              stkMsgObj.t132_3_color = this.price_basic_over;
            }
          } else if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (stkMsgObj.t132_3 === stkMsgObj.t333) {
              stkMsgObj.t132_3_color = this.price_floor_color;
            } else {
              stkMsgObj.t132_3_color = this.price_basic_less;
            }
          }
          // -- Xét màu t132_2 - Dư mua 2
          if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
            stkMsgObj.t132_2_color = this.price_basic_color;
          } else if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
              stkMsgObj.t132_2_color = this.price_ceil_color;
            } else {
              stkMsgObj.t132_2_color = this.price_basic_over;
            }
          } else if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
              stkMsgObj.t132_2_color = this.price_floor_color;
            } else {
              stkMsgObj.t132_2_color = this.price_basic_less;
            }
          }
          // -- Xét màu t132_1 - Dư mua 1
          if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
            stkMsgObj.t132_1_color = this.price_basic_color;
          } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (stkMsgObj.t132_1 === 777777710000 || stkMsgObj.t132_1 === 777777720000) {
              stkMsgObj.t132_1_color = this.defaultColor;
            } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
              stkMsgObj.t132_1_color = this.price_ceil_color;
            } else {
              stkMsgObj.t132_1_color = this.price_basic_over;
            }
          } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
              stkMsgObj.t132_1_color = this.price_floor_color;
            } else {
              stkMsgObj.t132_1_color = this.price_basic_less;
            }
          }
          // -- Xét màu t133_1 - Dư bán 1
          if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
            stkMsgObj.t133_1_color = this.price_basic_color;
          } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (msgObj.t133_1 === 777777710000 || msgObj.t133_1 === 777777720000) {
              msgObj.t133_1_color = this.defaultColor;
            } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
              stkMsgObj.t133_1_color = this.price_ceil_color;
            } else {
              stkMsgObj.t133_1_color = this.price_basic_over;
            }
          } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
              stkMsgObj.t133_1_color = this.price_floor_color;
            } else {
              stkMsgObj.t133_1_color = this.price_basic_less;
            }
          }
          // -- Xét màu t133_2 - Dư bán 2
          if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
            stkMsgObj.t133_2_color = this.price_basic_color;
          } else if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
              stkMsgObj.t133_2_color = this.price_ceil_color;
            } else {
              stkMsgObj.t133_2_color = this.price_basic_over;
            }
          } else if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
              stkMsgObj.t133_2_color = this.price_floor_color;
            } else {
              stkMsgObj.t133_2_color = this.price_basic_less;
            }
          }
          // -- Xét màu t133_3 - Dư bán 1
          if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
            stkMsgObj.t133_3_color = this.price_basic_color;
          } else if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
              stkMsgObj.t133_3_color = this.price_ceil_color;
            } else {
              stkMsgObj.t133_3_color = this.price_basic_over;
            }
          } else if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
            if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
              stkMsgObj.t133_3_color = this.price_floor_color;
            } else {
              stkMsgObj.t133_3_color = this.price_basic_less;
            }
          }

          // -- Xét màu t137 -- Giá mở cửa
          if (stkMsgObj.t137 === 0 || stkMsgObj.t137 === stkMsgObj.t260) {
            stkMsgObj.t137_color = this.price_basic_color;
          } else if (stkMsgObj.t137 > stkMsgObj.t260) {
            if (stkMsgObj.t137 === stkMsgObj.t332) {
              stkMsgObj.t137_color = this.price_ceil_color;
            } else {
              stkMsgObj.t137_color = this.price_basic_over;
            }
          } else if (stkMsgObj.t137 < stkMsgObj.t260) {
            if (stkMsgObj.t137 === stkMsgObj.t333) {
              stkMsgObj.t137_color = this.price_floor_color;
            } else {
              stkMsgObj.t137_color = this.price_basic_less;
            }
          }
          // -- Xét màu t631 - Giá trung bình
          if (stkMsgObj.t631 === 0 || stkMsgObj.t631 === stkMsgObj.t260) {
            stkMsgObj.t631_color = this.price_basic_color;
          } else if (stkMsgObj.t631 > stkMsgObj.t260) {
            if (stkMsgObj.t631 === stkMsgObj.t332) {
              stkMsgObj.t631_color = this.price_ceil_color;
            } else {
              stkMsgObj.t631_color = this.price_basic_over;
            }
          } else if (stkMsgObj.t631 < stkMsgObj.t260) {
            if (stkMsgObj.t631 === stkMsgObj.t333) {
              stkMsgObj.t631_color = this.price_floor_color;
            } else {
              stkMsgObj.t631_color = this.price_basic_less;
            }
          }
          // -- Xét màu t266 - Gía cao
          if (stkMsgObj.t266 === 0 || stkMsgObj.t266 === stkMsgObj.t260) {
            stkMsgObj.t266_color = this.price_basic_color;
          } else if (stkMsgObj.t266 > stkMsgObj.t260) {
            if (stkMsgObj.t266 === stkMsgObj.t332) {
              stkMsgObj.t266_color = this.price_ceil_color;
            } else {
              stkMsgObj.t266_color = this.price_basic_over;
            }
          } else if (stkMsgObj.t266 < stkMsgObj.t260) {
            if (stkMsgObj.t266 === stkMsgObj.t333) {
              stkMsgObj.t266_color = this.price_floor_color;
            } else {
              stkMsgObj.t266_color = this.price_basic_less;
            }
          }
          // -- Xét màu t2661 - Gía thấp
          if (stkMsgObj.t2661 === 0 || stkMsgObj.t2661 === stkMsgObj.t260) {
            stkMsgObj.t2661_color = this.price_basic_color;
          } else if (stkMsgObj.t2661 > stkMsgObj.t260) {
            if (stkMsgObj.t2661 === stkMsgObj.t332) {
              stkMsgObj.t2661_color = this.price_ceil_color;
            } else {
              stkMsgObj.t2661_color = this.price_basic_over;
            }
          } else if (stkMsgObj.t2661 < stkMsgObj.t260) {
            if (stkMsgObj.t2661 === stkMsgObj.t333) {
              stkMsgObj.t2661_color = this.price_floor_color;
            } else {
              stkMsgObj.t2661_color = this.price_basic_less;
            }
          }
          // -- Xét màu t139 - Giá đóng cửa
          if (stkMsgObj.t139 === 0 || stkMsgObj.t139 === stkMsgObj.t260) {
            stkMsgObj.t139_color = this.price_basic_color;
          } else if (stkMsgObj.t139 > stkMsgObj.t260) {
            if (stkMsgObj.t139 === stkMsgObj.t332) {
              stkMsgObj.t139_color = this.price_ceil_color;
            } else {
              stkMsgObj.t139_color = this.price_basic_over;
            }
          } else if (stkMsgObj.t139 < stkMsgObj.t260) {
            if (stkMsgObj.t139 === stkMsgObj.t333) {
              stkMsgObj.t139_color = this.price_floor_color;
            } else {
              stkMsgObj.t139_color = this.price_basic_less;
            }
          }

          const t31_incr = (stkMsgObj.t31 === 777777710000 ? 0 : (stkMsgObj.t31 === 777777720000 ? 0 : ((stkMsgObj.t31 === undefined ? 0 : (stkMsgObj.t31 - stkMsgObj.t260)))));
          stkMsgObj.t31_incr = t31_incr;
          const t31_incr_per = (stkMsgObj.t31 == 777777710000 ? 0 : (stkMsgObj.t31 == 777777720000 ? 0 : (((stkMsgObj.t31 == undefined || stkMsgObj.t260 == undefined || stkMsgObj.t260 === 0) ? 0 : ((stkMsgObj.t31 - stkMsgObj.t260) * 100) / stkMsgObj.t260))));
          stkMsgObj.t31_incr_per = t31_incr_per;
          if (msgObj.U10 === '03') {
            ck_exist = this.HNX_PRC_LIST.length;
            this.HNX_PRC_LIST[ck_exist] = stkMsgObj;
            // if (clientSeq > 0) { this.event_ServerPushMRKRcvHnxUpd.next('update'); }             
            let objchange = { data: this.HNX_PRC_LIST[ck_exist], change: ls_unit_change.substr(0, ls_unit_change.length - 1) };
            this.mrkInfoEvent.next(objchange);
          } else if (msgObj.U10 === '01') {
            ck_exist = this.HSX_PRC_LIST.length;
            this.HSX_PRC_LIST[ck_exist] = stkMsgObj;
            // if (clientSeq > 0) { this.event_ServerPushMRKRcvHsxUpd.next('update'); }            
            let objchange = { data: this.HSX_PRC_LIST[ck_exist], change: ls_unit_change.substr(0, ls_unit_change.length - 1) };
            this.mrkInfoEvent.next(objchange);
          } else if (msgObj.U10 === '05') {
            ck_exist = this.UPC_PRC_LIST.length;
            this.UPC_PRC_LIST[ck_exist] = stkMsgObj;
            // if (clientSeq > 0) { this.event_ServerPushMRKRcvUpcUpd.next('update'); }
            let objchange = { data: this.UPC_PRC_LIST[ck_exist], change: ls_unit_change.substr(0, ls_unit_change.length - 1) };
            this.mrkInfoEvent.next(objchange);
          }
        }

        // if (clientSeq === 0 && ls_unit_change != null && ls_unit_change.length > 2) {
        // this.event_ServerPushMRKRcvChangeBgrd.next(
        //   mskey +
        //   '|' +
        //   ck_exist +
        //   '|' +
        //   ls_unit_change.substr(0, ls_unit_change.length - 1)
        // );
        // }
        // -- update to flv list
        this.updateToFvlList(mskey);
        // this.logMessage('end message SI');
      };
      return;
    };

    this.updTP_Msg2MrkInfoMap = (timeoutTc = 0, clientSeq = 0) => {
      window.clearTimeout(this.TPTimeout[timeoutTc]);
      let mskey = '', msgObj, stkMsgObj;
      this.TP_MSG_MAP.forEach((value, key) => {
        // this.logMessage('start message TP clientSeq: ' + clientSeq);
        // console.log('start message TP clientSeq: ' + clientSeq);
        mskey = key;
        msgObj = value;
        this.TP_MSG_MAP.delete(key);
        stkMsgObj = this.getMsgObjectByMsgKey(mskey);
        if (stkMsgObj == null || stkMsgObj === undefined) {
          stkMsgObj = new stkPriceBoard();
        }
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

        let t556_4 = stkMsgObj.t556_4;
        stkMsgObj.t556_4 = 0;
        let t132_4 = stkMsgObj.t132_4;
        stkMsgObj.t132_4 = 0;
        let t133_4 = stkMsgObj.t133_4;
        stkMsgObj.t133_4 = 0;
        let t1321_4 = stkMsgObj.t1321_4;
        stkMsgObj.t1321_4 = 0;
        let t1331_4 = stkMsgObj.t1331_4;
        stkMsgObj.t1331_4 = 0;

        let t556_5 = stkMsgObj.t556_5;
        stkMsgObj.t556_5 = 0;
        let t132_5 = stkMsgObj.t132_5;
        stkMsgObj.t132_5 = 0;
        let t133_5 = stkMsgObj.t133_5;
        stkMsgObj.t133_5 = 0;
        let t1321_5 = stkMsgObj.t1321_5;
        stkMsgObj.t1321_5 = 0;
        let t1331_5 = stkMsgObj.t1331_5;
        stkMsgObj.t1331_5 = 0;

        let t556_6 = stkMsgObj.t556_6;
        stkMsgObj.t556_6 = 0;
        let t132_6 = stkMsgObj.t132_6;
        stkMsgObj.t132_6 = 0;
        let t133_6 = stkMsgObj.t133_6;
        stkMsgObj.t133_6 = 0;
        let t1321_6 = stkMsgObj.t1321_6;
        stkMsgObj.t1321_6 = 0;
        let t1331_6 = stkMsgObj.t1331_6;
        stkMsgObj.t1331_6 = 0;

        let t556_7 = stkMsgObj.t556_7;
        stkMsgObj.t556_7 = 0;
        let t132_7 = stkMsgObj.t132_7;
        stkMsgObj.t132_7 = 0;
        let t133_7 = stkMsgObj.t133_7;
        stkMsgObj.t133_7 = 0;
        let t1321_7 = stkMsgObj.t1321_7;
        stkMsgObj.t1321_7 = 0;
        let t1331_7 = stkMsgObj.t1331_7;
        stkMsgObj.t1331_7 = 0;

        let t556_8 = stkMsgObj.t556_8;
        stkMsgObj.t556_8 = 0;
        let t132_8 = stkMsgObj.t132_8;
        stkMsgObj.t132_8 = 0;
        let t133_8 = stkMsgObj.t133_8;
        stkMsgObj.t133_8 = 0;
        let t1321_8 = stkMsgObj.t1321_8;
        stkMsgObj.t1321_8 = 0;
        let t1331_8 = stkMsgObj.t1331_8;
        stkMsgObj.t1331_8 = 0;

        let t556_9 = stkMsgObj.t556_9;
        stkMsgObj.t556_9 = 0;
        let t132_9 = stkMsgObj.t132_9;
        stkMsgObj.t132_9 = 0;
        let t133_9 = stkMsgObj.t133_9;
        stkMsgObj.t133_9 = 0;
        let t1321_9 = stkMsgObj.t1321_9;
        stkMsgObj.t1321_9 = 0;
        let t1331_9 = stkMsgObj.t1331_9;
        stkMsgObj.t1331_9 = 0;

        let t556_10 = stkMsgObj.t556_10;
        stkMsgObj.t556_10 = 0;
        let t132_10 = stkMsgObj.t132_10;
        stkMsgObj.t132_10 = 0;
        let t133_10 = stkMsgObj.t133_10;
        stkMsgObj.t133_10 = 0;
        let t1321_10 = stkMsgObj.t1321_10;
        stkMsgObj.t1321_10 = 0;
        let t1331_10 = stkMsgObj.t1331_10;
        stkMsgObj.t1331_10 = 0;

        // stkMsgObj.t556_4 = 0;
        // stkMsgObj.t132_4 = 0;
        // stkMsgObj.t133_4 = 0;
        // stkMsgObj.t1321_4 = 0;
        // stkMsgObj.t1331_4 = 0;

        stkMsgObj.t55 = msgObj.t55;
        stkMsgObj.t555 = msgObj.t555;
        let ls_unit_change = '', changListLength = 0, ls_currVal = 0;
        const changList = [];

        // if (msgObj.t55 === 'ACB') {
        //   console.log(msgObj);
        // }

        if (msgObj.t555 >= 1 || msgObj.t555 === 0) {
          // -- mua tốt nhất + bán tốt nhất
          if (t556_1 === null || t556_1 === undefined) { t556_1 = 0; }
          if (msgObj['TP'][0] === undefined || msgObj['TP'][0].t556 === undefined || msgObj['TP'][0].t556 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][0].t556;
          }
          stkMsgObj.t556_1 = ls_currVal;
          // -- Giá dư mua 1
          if (t132_1 === null || t132_1 === undefined) { t132_1 = 0; }
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
        if (msgObj.t555 >= 4 || msgObj.t555 === 0) {
          if (t556_4 == null || t556_4 === undefined) { t556_4 = 0; }
          if (msgObj['TP'][3] === undefined || msgObj['TP'][3].t556 === undefined || msgObj['TP'][3].t556 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][3].t556;
          }
          stkMsgObj.t556_4 = ls_currVal;

          if (t132_4 == null || t132_4 === undefined) { t132_4 = 0; }
          if (msgObj['TP'][3] === undefined || msgObj['TP'][3].t132 === undefined || msgObj['TP'][3].t132 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][3].t132;
          }
          if (t132_4 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't132_4' +
              ':' +
              t132_4 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t132_4');
          }
          stkMsgObj.t132_4 = ls_currVal;

          if (t1321_4 == null || t1321_4 === undefined) { t1321_4 = 0; }
          if (msgObj['TP'][3] === undefined || msgObj['TP'][3].t1321 === undefined || msgObj['TP'][3].t1321 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][3].t1321;
          }

          if (t1321_4 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1321_4' +
              ':' +
              t1321_4 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t1321_4');
          }
          stkMsgObj.t1321_4 = ls_currVal;

          if (t133_4 == null || t133_4 === undefined) { t133_4 = 0; }
          if (msgObj['TP'][3] === undefined || msgObj['TP'][3].t133 === undefined || msgObj['TP'][3].t133 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][3].t133;
          }

          if (t133_4 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't133_4' +
              ':' +
              t133_4 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_4');
          }
          stkMsgObj.t133_4 = ls_currVal;

          if (t1331_4 == null || t1331_4 === undefined) { t1331_4 = 0; }
          if (msgObj['TP'][3] === undefined || msgObj['TP'][3].t1331 === undefined || msgObj['TP'][3].t1331 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][3].t1331;
          }
          if (t1331_4 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1331_4' +
              ':' +
              t1331_4 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_4');
          }
          stkMsgObj.t1331_4 = ls_currVal;
        }
        if (msgObj.t555 >= 5 || msgObj.t555 === 0) {
          if (t556_5 == null || t556_5 === undefined) { t556_5 = 0; }
          if (msgObj['TP'][4] === undefined || msgObj['TP'][4].t556 === undefined || msgObj['TP'][4].t556 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][4].t556;
          }
          stkMsgObj.t556_5 = ls_currVal;

          if (t132_5 == null || t132_5 === undefined) { t132_5 = 0; }
          if (msgObj['TP'][4] === undefined || msgObj['TP'][4].t132 === undefined || msgObj['TP'][4].t132 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][4].t132;
          }
          if (t132_5 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't132_5' +
              ':' +
              t132_5 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t132_5');
          }
          stkMsgObj.t132_5 = ls_currVal;

          if (t1321_5 == null || t1321_5 === undefined) { t1321_5 = 0; }
          if (msgObj['TP'][4] === undefined || msgObj['TP'][4].t1321 === undefined || msgObj['TP'][4].t1321 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][4].t1321;
          }

          if (t1321_5 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1321_5' +
              ':' +
              t1321_5 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t1321_5');
          }
          stkMsgObj.t1321_5 = ls_currVal;

          if (t133_5 == null || t133_5 === undefined) { t133_5 = 0; }
          if (msgObj['TP'][4] === undefined || msgObj['TP'][4].t133 === undefined || msgObj['TP'][4].t133 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][4].t133;
          }

          if (t133_5 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't133_5' +
              ':' +
              t133_5 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_5');
          }
          stkMsgObj.t133_5 = ls_currVal;

          if (t1331_5 == null || t1331_5 === undefined) { t1331_5 = 0; }
          if (msgObj['TP'][4] === undefined || msgObj['TP'][4].t1331 === undefined || msgObj['TP'][4].t1331 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][4].t1331;
          }
          if (t1331_5 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1331_5' +
              ':' +
              t1331_5 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_5');
          }
          stkMsgObj.t1331_5 = ls_currVal;
        }
        if (msgObj.t555 >= 6 || msgObj.t555 === 0) {
          if (t556_6 == null || t556_6 === undefined) { t556_6 = 0; }
          if (msgObj['TP'][5] === undefined || msgObj['TP'][5].t556 === undefined || msgObj['TP'][5].t556 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][5].t556;
          }
          stkMsgObj.t556_6 = ls_currVal;

          if (t132_6 == null || t132_6 === undefined) { t132_6 = 0; }
          if (msgObj['TP'][5] === undefined || msgObj['TP'][5].t132 === undefined || msgObj['TP'][5].t132 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][5].t132;
          }
          if (t132_6 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't132_6' +
              ':' +
              t132_6 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t132_6');
          }
          stkMsgObj.t132_6 = ls_currVal;

          if (t1321_6 == null || t1321_6 === undefined) { t1321_6 = 0; }
          if (msgObj['TP'][5] === undefined || msgObj['TP'][5].t1321 === undefined || msgObj['TP'][5].t1321 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][5].t1321;
          }

          if (t1321_6 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1321_6' +
              ':' +
              t1321_6 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t1321_6');
          }
          stkMsgObj.t1321_6 = ls_currVal;

          if (t133_6 == null || t133_6 === undefined) { t133_6 = 0; }
          if (msgObj['TP'][5] === undefined || msgObj['TP'][5].t133 === undefined || msgObj['TP'][5].t133 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][5].t133;
          }

          if (t133_6 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't133_6' +
              ':' +
              t133_6 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_6');
          }
          stkMsgObj.t133_6 = ls_currVal;

          if (t1331_6 == null || t1331_6 === undefined) { t1331_6 = 0; }
          if (msgObj['TP'][5] === undefined || msgObj['TP'][5].t1331 === undefined || msgObj['TP'][5].t1331 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][5].t1331;
          }
          if (t1331_6 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1331_6' +
              ':' +
              t1331_6 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_6');
          }
          stkMsgObj.t1331_6 = ls_currVal;
        }
        if (msgObj.t555 >= 7 || msgObj.t555 === 0) {
          if (t556_7 == null || t556_7 === undefined) { t556_7 = 0; }
          if (msgObj['TP'][6] === undefined || msgObj['TP'][6].t556 === undefined || msgObj['TP'][6].t556 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][6].t556;
          }
          stkMsgObj.t556_7 = ls_currVal;

          if (t132_7 == null || t132_7 === undefined) { t132_7 = 0; }
          if (msgObj['TP'][6] === undefined || msgObj['TP'][6].t132 === undefined || msgObj['TP'][6].t132 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][6].t132;
          }
          if (t132_7 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't132_7' +
              ':' +
              t132_7 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t132_7');
          }
          stkMsgObj.t132_7 = ls_currVal;

          if (t1321_7 == null || t1321_7 === undefined) { t1321_7 = 0; }
          if (msgObj['TP'][6] === undefined || msgObj['TP'][6].t1321 === undefined || msgObj['TP'][6].t1321 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][6].t1321;
          }

          if (t1321_7 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1321_7' +
              ':' +
              t1321_7 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t1321_7');
          }
          stkMsgObj.t1321_7 = ls_currVal;

          if (t133_7 == null || t133_7 === undefined) { t133_7 = 0; }
          if (msgObj['TP'][6] === undefined || msgObj['TP'][6].t133 === undefined || msgObj['TP'][6].t133 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][6].t133;
          }

          if (t133_7 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't133_7' +
              ':' +
              t133_7 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_7');
          }
          stkMsgObj.t133_7 = ls_currVal;

          if (t1331_7 == null || t1331_7 === undefined) { t1331_7 = 0; }
          if (msgObj['TP'][6] === undefined || msgObj['TP'][6].t1331 === undefined || msgObj['TP'][6].t1331 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][6].t1331;
          }
          if (t1331_7 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1331_7' +
              ':' +
              t1331_7 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_7');
          }
          stkMsgObj.t1331_7 = ls_currVal;
        }
        if (msgObj.t555 >= 8 || msgObj.t555 === 0) {
          if (t556_8 == null || t556_8 === undefined) { t556_8 = 0; }
          if (msgObj['TP'][7] === undefined || msgObj['TP'][7].t556 === undefined || msgObj['TP'][7].t556 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][7].t556;
          }
          stkMsgObj.t556_8 = ls_currVal;

          if (t132_8 == null || t132_8 === undefined) { t132_8 = 0; }
          if (msgObj['TP'][7] === undefined || msgObj['TP'][7].t132 === undefined || msgObj['TP'][7].t132 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][7].t132;
          }
          if (t132_8 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't132_8' +
              ':' +
              t132_8 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t132_8');
          }
          stkMsgObj.t132_8 = ls_currVal;

          if (t1321_8 == null || t1321_8 === undefined) { t1321_8 = 0; }
          if (msgObj['TP'][7] === undefined || msgObj['TP'][7].t1321 === undefined || msgObj['TP'][7].t1321 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][7].t1321;
          }

          if (t1321_8 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1321_8' +
              ':' +
              t1321_8 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t1321_8');
          }
          stkMsgObj.t1321_8 = ls_currVal;

          if (t133_8 == null || t133_8 === undefined) { t133_8 = 0; }
          if (msgObj['TP'][7] === undefined || msgObj['TP'][7].t133 === undefined || msgObj['TP'][7].t133 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][7].t133;
          }

          if (t133_8 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't133_8' +
              ':' +
              t133_8 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_8');
          }
          stkMsgObj.t133_8 = ls_currVal;

          if (t1331_8 == null || t1331_8 === undefined) { t1331_8 = 0; }
          if (msgObj['TP'][7] === undefined || msgObj['TP'][7].t1331 === undefined || msgObj['TP'][7].t1331 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][7].t1331;
          }
          if (t1331_8 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1331_8' +
              ':' +
              t1331_8 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_8');
          }
          stkMsgObj.t1331_8 = ls_currVal;
        }
        if (msgObj.t555 >= 9 || msgObj.t555 === 0) {
          if (t556_9 == null || t556_9 === undefined) { t556_9 = 0; }
          if (msgObj['TP'][8] === undefined || msgObj['TP'][8].t556 === undefined || msgObj['TP'][8].t556 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][8].t556;
          }
          stkMsgObj.t556_9 = ls_currVal;

          if (t132_9 == null || t132_9 === undefined) { t132_9 = 0; }
          if (msgObj['TP'][8] === undefined || msgObj['TP'][8].t132 === undefined || msgObj['TP'][8].t132 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][8].t132;
          }
          if (t132_9 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't132_9' +
              ':' +
              t132_9 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t132_9');
          }
          stkMsgObj.t132_9 = ls_currVal;

          if (t1321_9 == null || t1321_9 === undefined) { t1321_9 = 0; }
          if (msgObj['TP'][8] === undefined || msgObj['TP'][8].t1321 === undefined || msgObj['TP'][8].t1321 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][8].t1321;
          }

          if (t1321_9 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1321_9' +
              ':' +
              t1321_9 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t1321_9');
          }
          stkMsgObj.t1321_9 = ls_currVal;

          if (t133_9 == null || t133_9 === undefined) { t133_9 = 0; }
          if (msgObj['TP'][8] === undefined || msgObj['TP'][8].t133 === undefined || msgObj['TP'][8].t133 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][8].t133;
          }

          if (t133_9 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't133_9' +
              ':' +
              t133_9 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_9');
          }
          stkMsgObj.t133_9 = ls_currVal;

          if (t1331_9 == null || t1331_9 === undefined) { t1331_9 = 0; }
          if (msgObj['TP'][8] === undefined || msgObj['TP'][8].t1331 === undefined || msgObj['TP'][8].t1331 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][8].t1331;
          }
          if (t1331_9 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1331_9' +
              ':' +
              t1331_9 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_9');
          }
          stkMsgObj.t1331_9 = ls_currVal;
        }
        if (msgObj.t555 >= 10 || msgObj.t555 === 0) {
          if (t556_10 == null || t556_10 === undefined) { t556_10 = 0; }
          if (msgObj['TP'][9] === undefined || msgObj['TP'][9].t556 === undefined || msgObj['TP'][9].t556 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][9].t556;
          }
          stkMsgObj.t556_10 = ls_currVal;

          if (t132_10 == null || t132_10 === undefined) { t132_10 = 0; }
          if (msgObj['TP'][9] === undefined || msgObj['TP'][9].t132 === undefined || msgObj['TP'][9].t132 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][9].t132;
          }
          if (t132_10 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't132_10' +
              ':' +
              t132_10 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t132_10');
          }
          stkMsgObj.t132_10 = ls_currVal;

          if (t1321_10 == null || t1321_10 === undefined) { t1321_10 = 0; }
          if (msgObj['TP'][9] === undefined || msgObj['TP'][9].t1321 === undefined || msgObj['TP'][9].t1321 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][9].t1321;
          }

          if (t1321_10 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1321_10' +
              ':' +
              t1321_10 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t1321_10');
          }
          stkMsgObj.t1321_10 = ls_currVal;

          if (t133_10 == null || t133_10 === undefined) { t133_10 = 0; }
          if (msgObj['TP'][9] === undefined || msgObj['TP'][9].t133 === undefined || msgObj['TP'][9].t133 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][9].t133;
          }

          if (t133_10 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't133_10' +
              ':' +
              t133_10 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_10');
          }
          stkMsgObj.t133_10 = ls_currVal;

          if (t1331_10 == null || t1331_10 === undefined) { t1331_10 = 0; }
          if (msgObj['TP'][9] === undefined || msgObj['TP'][9].t1331 === undefined || msgObj['TP'][9].t1331 == null) {
            ls_currVal = 0;
          } else {
            ls_currVal = msgObj['TP'][9].t1331;
          }
          if (t1331_10 !== ls_currVal) {
            ls_unit_change =
              ls_unit_change +
              't1331_10' +
              ':' +
              t1331_10 +
              ':' +
              ls_currVal +
              '|';
            changList.push('t133_10');
          }
          stkMsgObj.t1331_10 = ls_currVal;
        }

        // -- Xét màu t132_10 - Dư mua 10
        if (Math.round(stkMsgObj.t132_10 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_10_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_10 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_10 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_10_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_10_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_10 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_10 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_10_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_10_color = this.price_basic_less;
          }
        }

        // -- Xét màu t132_9 - Dư mua 9
        if (Math.round(stkMsgObj.t132_9 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_9_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_9 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_9 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_9_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_9_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_9 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_9 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_9_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_9_color = this.price_basic_less;
          }
        }

        // -- Xét màu t132_8 - Dư mua 8
        if (Math.round(stkMsgObj.t132_8 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_8_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_8 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_8 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_8_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_8_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_8 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_8 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_8_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_8_color = this.price_basic_less;
          }
        }

        // -- Xét màu t132_7 - Dư mua 7
        if (Math.round(stkMsgObj.t132_7 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_7_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_7 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_7 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_7_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_7_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_7 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_7 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_7_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_7_color = this.price_basic_less;
          }
        }

        // -- Xét màu t132_6 - Dư mua 6
        if (Math.round(stkMsgObj.t132_6 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_6_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_6 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_6 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_6_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_6_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_6 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_6 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_6_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_6_color = this.price_basic_less;
          }
        }

        // -- Xét màu t132_5 - Dư mua 5
        if (Math.round(stkMsgObj.t132_5 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_5_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_5 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_5 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_5_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_5_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_5 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_5 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_5_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_5_color = this.price_basic_less;
          }
        }

        // -- Xét màu t132_4 - Dư mua 4
        if (Math.round(stkMsgObj.t132_4 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_4_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_4 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_4 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_4_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_4_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_4 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_4 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_4_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_4_color = this.price_basic_less;
          }
        }

        // -- Xét màu t132_3 - Dư mua 3
        if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_3_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_3_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_3_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_3 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_3_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_3_color = this.price_basic_less;
          }
        }
        // -- Xét màu t132_2 - Dư mua 2
        if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_2_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_2_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_2_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_2 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_2_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_2_color = this.price_basic_less;
          }
        }
        // -- Xét màu t132_1 - Dư mua 1
        if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t132_1_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (stkMsgObj.t132_1 === 777777710000 || stkMsgObj.t132_1 === 777777720000) {
            stkMsgObj.t132_1_color = this.defaultColor;
          } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t132_1_color = this.price_ceil_color;
          } else {
            stkMsgObj.t132_1_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t132_1 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t132_1_color = this.price_floor_color;
          } else {
            stkMsgObj.t132_1_color = this.price_basic_less;
          }
        }
        // -- Xét màu t133_1 - Dư bán 1
        if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_1_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (stkMsgObj.t133_1 === 777777710000 || stkMsgObj.t133_1 === 777777720000) {
            stkMsgObj.t133_1_color = this.defaultColor;
          } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_1_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_1_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_1 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_1_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_1_color = this.price_basic_less;
          }
        }
        // -- Xét màu t133_2 - Dư bán 2
        if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_2_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_2_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_2_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_2 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_2_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_2_color = this.price_basic_less;
          }
        }
        // -- Xét màu t133_3 - Dư bán 3
        if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_3_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_3_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_3_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_3 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_3_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_3_color = this.price_basic_less;
          }
        }

        // -- Xét màu t133_4 - Dư bán 4
        if (Math.round(stkMsgObj.t133_4 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_4_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_4 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_4 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_4_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_4_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_4 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_4 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_4_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_4_color = this.price_basic_less;
          }
        }

        // -- Xét màu t133_5 - Dư bán 5
        if (Math.round(stkMsgObj.t133_5 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_5_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_5 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_5 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_5_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_5_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_5 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_5 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_5_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_5_color = this.price_basic_less;
          }
        }

        // -- Xét màu t133_6 - Dư bán 6
        if (Math.round(stkMsgObj.t133_6 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_6_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_6 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_6 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_6_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_6_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_6 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_6 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_6_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_6_color = this.price_basic_less;
          }
        }

        // -- Xét màu t133_7 - Dư bán 7
        if (Math.round(stkMsgObj.t133_7 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_7_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_7 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_7 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_7_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_7_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_7 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_7 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_7_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_7_color = this.price_basic_less;
          }
        }

        // -- Xét màu t133_8 - Dư bán 8
        if (Math.round(stkMsgObj.t133_8 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_8_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_8 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_8 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_8_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_8_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_8 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_8 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_8_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_8_color = this.price_basic_less;
          }
        }

        // -- Xét màu t133_9 - Dư bán 9
        if (Math.round(stkMsgObj.t133_9 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_9_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_9 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_9 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_9_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_9_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_9 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_9 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_9_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_9_color = this.price_basic_less;
          }
        }

        // -- Xét màu t133_10 - Dư bán 10
        if (Math.round(stkMsgObj.t133_10 * 1000) / 1000 === Math.round(stkMsgObj.t260 * 1000) / 1000) {
          stkMsgObj.t133_10_color = this.price_basic_color;
        } else if (Math.round(stkMsgObj.t133_10 * 1000) / 1000 > Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_10 * 1000) / 1000 === Math.round(stkMsgObj.t332 * 1000) / 1000) {
            stkMsgObj.t133_10_color = this.price_ceil_color;
          } else {
            stkMsgObj.t133_10_color = this.price_basic_over;
          }
        } else if (Math.round(stkMsgObj.t133_10 * 1000) / 1000 < Math.round(stkMsgObj.t260 * 1000) / 1000) {
          if (Math.round(stkMsgObj.t133_10 * 1000) / 1000 === Math.round(stkMsgObj.t333 * 1000) / 1000) {
            stkMsgObj.t133_10_color = this.price_floor_color;
          } else {
            stkMsgObj.t133_10_color = this.price_basic_less;
          }
        }


        let ck_exist = -1, itemNm = '', j = 0;
        changListLength = changList.length;
        // ck_exist = this.glbStore.msgMrkInfoArr_indexMap.get(mskey);
        ck_exist = this.getIndexByMsgKey(mskey);
        if (stkMsgObj.U10 === '03') {
          if (ck_exist !== undefined && ck_exist != null && ck_exist >= 0) {
            for (j = 0; j < changListLength; j++) {
              itemNm = changList[j];
              this.HNX_PRC_LIST[ck_exist][itemNm] = stkMsgObj[itemNm];

              if (itemNm === 't132_10') { this.HNX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_10_color; }
              if (itemNm === 't132_9') { this.HNX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_9_color; }
              if (itemNm === 't132_8') { this.HNX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_8_color; }
              if (itemNm === 't132_7') { this.HNX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_7_color; }
              if (itemNm === 't132_6') { this.HNX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_6_color; }
              if (itemNm === 't132_5') { this.HNX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_5_color; }
              if (itemNm === 't132_4') { this.HNX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_4_color; }
              if (itemNm === 't132_3') { this.HNX_PRC_LIST[ck_exist].t132_3_color = stkMsgObj.t132_3_color; }
              if (itemNm === 't132_2') { this.HNX_PRC_LIST[ck_exist].t132_2_color = stkMsgObj.t132_2_color; }
              if (itemNm === 't132_1') { this.HNX_PRC_LIST[ck_exist].t132_1_color = stkMsgObj.t132_1_color; }
              if (itemNm === 't133_1') { this.HNX_PRC_LIST[ck_exist].t133_1_color = stkMsgObj.t133_1_color; }
              if (itemNm === 't133_2') { this.HNX_PRC_LIST[ck_exist].t133_2_color = stkMsgObj.t133_2_color; }
              if (itemNm === 't133_3') { this.HNX_PRC_LIST[ck_exist].t133_3_color = stkMsgObj.t133_3_color; }
              if (itemNm === 't133_4') { this.HNX_PRC_LIST[ck_exist].t133_4_color = stkMsgObj.t133_4_color; }
              if (itemNm === 't133_5') { this.HNX_PRC_LIST[ck_exist].t133_5_color = stkMsgObj.t133_5_color; }
              if (itemNm === 't133_6') { this.HNX_PRC_LIST[ck_exist].t133_6_color = stkMsgObj.t133_6_color; }
              if (itemNm === 't133_7') { this.HNX_PRC_LIST[ck_exist].t133_7_color = stkMsgObj.t133_7_color; }
              if (itemNm === 't133_8') { this.HNX_PRC_LIST[ck_exist].t133_8_color = stkMsgObj.t133_8_color; }
              if (itemNm === 't133_9') { this.HNX_PRC_LIST[ck_exist].t133_9_color = stkMsgObj.t133_9_color; }
              if (itemNm === 't133_10') { this.HNX_PRC_LIST[ck_exist].t133_10_color = stkMsgObj.t133_10_color; }
            }
          } else {
            // this.glbStore.msgMrkInfoArr_indexMap.set(mskey, ck_exist);
            this.HNX_PRC_LIST[this.HNX_PRC_LIST.length] = stkMsgObj;
          }
          // this.event_ServerPushMRKRcvHnxUpd.next('update');
          // if (clientSeq !== 0) {
          //   this.event_ServerPushMRKRcvHnxUpd.next('update');
          // }
          let objchange = { data: this.HNX_PRC_LIST[ck_exist], change: ls_unit_change.substr(0, ls_unit_change.length - 1) };
          this.mrkInfoEvent.next(objchange);
        } else if (stkMsgObj.U10 === '01') {
          if (ck_exist !== undefined && ck_exist != null && ck_exist >= 0) {
            for (j = 0; j < changListLength; j++) {
              itemNm = changList[j];
              this.HSX_PRC_LIST[ck_exist][itemNm] = stkMsgObj[itemNm];
              if (itemNm === 't132_10') { this.HSX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_10_color; }
              if (itemNm === 't132_9') { this.HSX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_9_color; }
              if (itemNm === 't132_8') { this.HSX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_8_color; }
              if (itemNm === 't132_7') { this.HSX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_7_color; }
              if (itemNm === 't132_6') { this.HSX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_6_color; }
              if (itemNm === 't132_5') { this.HSX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_5_color; }
              if (itemNm === 't132_4') { this.HSX_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_4_color; }
              if (itemNm === 't132_3') { this.HSX_PRC_LIST[ck_exist].t132_3_color = stkMsgObj.t132_3_color; }
              if (itemNm === 't132_2') { this.HSX_PRC_LIST[ck_exist].t132_2_color = stkMsgObj.t132_2_color; }
              if (itemNm === 't132_1') { this.HSX_PRC_LIST[ck_exist].t132_1_color = stkMsgObj.t132_1_color; }
              if (itemNm === 't133_1') { this.HSX_PRC_LIST[ck_exist].t133_1_color = stkMsgObj.t133_1_color; }
              if (itemNm === 't133_2') { this.HSX_PRC_LIST[ck_exist].t133_2_color = stkMsgObj.t133_2_color; }
              if (itemNm === 't133_3') { this.HSX_PRC_LIST[ck_exist].t133_3_color = stkMsgObj.t133_3_color; }
              if (itemNm === 't133_4') { this.HSX_PRC_LIST[ck_exist].t133_4_color = stkMsgObj.t133_4_color; }
              if (itemNm === 't133_5') { this.HSX_PRC_LIST[ck_exist].t133_5_color = stkMsgObj.t133_5_color; }
              if (itemNm === 't133_6') { this.HSX_PRC_LIST[ck_exist].t133_6_color = stkMsgObj.t133_6_color; }
              if (itemNm === 't133_7') { this.HSX_PRC_LIST[ck_exist].t133_7_color = stkMsgObj.t133_7_color; }
              if (itemNm === 't133_8') { this.HSX_PRC_LIST[ck_exist].t133_8_color = stkMsgObj.t133_8_color; }
              if (itemNm === 't133_9') { this.HSX_PRC_LIST[ck_exist].t133_9_color = stkMsgObj.t133_9_color; }
              if (itemNm === 't133_10') { this.HSX_PRC_LIST[ck_exist].t133_10_color = stkMsgObj.t133_10_color; }
            }
          } else {
            ck_exist = this.HSX_PRC_LIST.length;
            // this.glbStore.msgMrkInfoArr_indexMap.set(mskey, ck_exist);
            this.HSX_PRC_LIST[this.HSX_PRC_LIST.length] = stkMsgObj;
          }
          // if (clientSeq !== 0) {
          // this.logMessage('message TP: event_ServerPushMRKRcvHsxUpd');
          // this.event_ServerPushMRKRcvHsxUpd.next('update');
          // }
          // this.event_ServerPushMRKRcvHsxUpd.next('update');
          let objchange = { data: this.HSX_PRC_LIST[ck_exist], change: ls_unit_change.substr(0, ls_unit_change.length - 1) };
          this.mrkInfoEvent.next(objchange);
        } else if (stkMsgObj.U10 === '05') {
          if (ck_exist !== undefined && ck_exist != null && ck_exist >= 0) {
            for (j = 0; j < changListLength; j++) {
              itemNm = changList[j];
              this.UPC_PRC_LIST[ck_exist][itemNm] = stkMsgObj[itemNm];
              if (itemNm === 't132_10') { this.UPC_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_10_color; }
              if (itemNm === 't132_9') { this.UPC_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_9_color; }
              if (itemNm === 't132_8') { this.UPC_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_8_color; }
              if (itemNm === 't132_7') { this.UPC_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_7_color; }
              if (itemNm === 't132_6') { this.UPC_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_6_color; }
              if (itemNm === 't132_5') { this.UPC_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_5_color; }
              if (itemNm === 't132_4') { this.UPC_PRC_LIST[ck_exist].t132_4_color = stkMsgObj.t132_4_color; }
              if (itemNm === 't132_3') { this.UPC_PRC_LIST[ck_exist].t132_3_color = stkMsgObj.t132_3_color; }
              if (itemNm === 't132_2') { this.UPC_PRC_LIST[ck_exist].t132_2_color = stkMsgObj.t132_2_color; }
              if (itemNm === 't132_1') { this.UPC_PRC_LIST[ck_exist].t132_1_color = stkMsgObj.t132_1_color; }
              if (itemNm === 't133_1') { this.UPC_PRC_LIST[ck_exist].t133_1_color = stkMsgObj.t133_1_color; }
              if (itemNm === 't133_2') { this.UPC_PRC_LIST[ck_exist].t133_2_color = stkMsgObj.t133_2_color; }
              if (itemNm === 't133_3') { this.UPC_PRC_LIST[ck_exist].t133_3_color = stkMsgObj.t133_3_color; }
              if (itemNm === 't133_4') { this.UPC_PRC_LIST[ck_exist].t133_4_color = stkMsgObj.t133_4_color; }
              if (itemNm === 't133_5') { this.UPC_PRC_LIST[ck_exist].t133_5_color = stkMsgObj.t133_5_color; }
              if (itemNm === 't133_6') { this.UPC_PRC_LIST[ck_exist].t133_6_color = stkMsgObj.t133_6_color; }
              if (itemNm === 't133_7') { this.UPC_PRC_LIST[ck_exist].t133_7_color = stkMsgObj.t133_7_color; }
              if (itemNm === 't133_8') { this.UPC_PRC_LIST[ck_exist].t133_8_color = stkMsgObj.t133_8_color; }
              if (itemNm === 't133_9') { this.UPC_PRC_LIST[ck_exist].t133_9_color = stkMsgObj.t133_9_color; }
              if (itemNm === 't133_10') { this.UPC_PRC_LIST[ck_exist].t133_10_color = stkMsgObj.t133_10_color; }
            }
          } else {
            ck_exist = this.UPC_PRC_LIST.length;
            // this.glbStore.msgMrkInfoArr_indexMap.set(mskey, ck_exist);
            this.UPC_PRC_LIST[this.UPC_PRC_LIST.length] = stkMsgObj;
          }
          // if (clientSeq !== 0) {
          // this.event_ServerPushMRKRcvUpcUpd.next('update');
          // }
          let objchange = { data: this.UPC_PRC_LIST[ck_exist], change: ls_unit_change.substr(0, ls_unit_change.length - 1) };
          this.mrkInfoEvent.next(objchange);
        }
        // if (this.TP_MSG_MAP.size <= this.maxMsgQuese && clientSeq === 0) {
        //   // -- call event change to briceboard
        //   if (ls_unit_change.length > 2) {
        //     this.event_ServerPushMRKRcvChangeBgrd.next(
        //       mskey +
        //       '|' +
        //       ck_exist +
        //       '|' +
        //       ls_unit_change.substr(0, ls_unit_change.length - 1)
        //     );
        //   }
        // }
        // -- update to flv list
        // this.updateToFvlList(mskey);
        // this.logMessage('End message TP clientSeq: ' + clientSeq);
      })
      return;
    };

    this.updI_Msg2MrkInfoMap = (clientSeq = 0, msgObj = {}) => {

      if (clientSeq > 0) {
        const u8Arr = msgObj['U8'].split('|');
        if (u8Arr[2] != null && u8Arr[2] !== undefined) {
          const dextObj = {};
          let ls_sanGd = 'HNX';
          if (u8Arr[0] === 'HSX') {
            ls_sanGd = 'HOSE';
          }
          const symbol = u8Arr[2].toUpperCase();
          dextObj['symbol'] = symbol;
          dextObj['full_name'] = symbol;
          dextObj['description'] = msgObj['t18'];
          dextObj['exchange'] = ls_sanGd;
          dextObj['type'] = 'index';
          if (this.tradview_StkList.length === 0 || this.tradview_StkList.findIndex(x => x.symbol === symbol) < 0) {
            this.tradview_StkList.push(dextObj);
            const stkTradInfo = {};
            stkTradInfo['name'] = symbol;
            stkTradInfo['full_name'] = symbol;
            stkTradInfo['exchange'] = ls_sanGd;
            stkTradInfo['exchange-traded'] = ls_sanGd;
            stkTradInfo['exchange-listed'] = ls_sanGd;
            stkTradInfo['timezone'] = 'Asia/Bangkok';
            stkTradInfo['minmov'] = 1;
            stkTradInfo['minmov2'] = 0;
            stkTradInfo['pointvalue'] = 1;
            stkTradInfo['session'] = '0915-1530';
            stkTradInfo['has_intraday'] = false;
            stkTradInfo['has_no_volume'] = false;
            stkTradInfo['pricescale'] = 100;
            stkTradInfo['description'] = msgObj['t18'];
            stkTradInfo['type'] = 'index';
            stkTradInfo['currency_code'] = 'VND';
            stkTradInfo['supported_resolutions'] = ['D', 'W', 'M', '3M'];
            stkTradInfo['ticker'] = symbol;
            this.stkInfoTradviewMap.set(symbol, stkTradInfo);
            if (this.tradingViewFlag) {
              const mapArr = [];
              this.stkInfoTradviewMap.forEach((value, key) => {
                const mapObj = {};
                mapObj[0] = key;
                mapObj[1] = value;
                mapArr.push(mapObj);
              });
              sessionStorage.setItem('tradinglist', JSON.stringify(this.tradview_StkList));
              sessionStorage.setItem('tradingmap', JSON.stringify(mapArr));
            }
          }
        }
      }
      if ((Number(msgObj['seq']) + Number(msgObj['subseq'])) > 0 && msgObj['U12'] === 0) {
        return;
      }

      if (clientSeq === 0 && !this.finishGetImsg) { return; }
      
      // console.log(msgObj,(Number(msgObj['seq']) + Number(msgObj['subseq'])), msgObj['U12'], !this.finishGetImsg);
      // console.log(msgObj);

      const splitted = msgObj['U8'].split('|', 3);
      const msgKey = splitted[0] + '_' + splitted[2];
      let calTime = msgObj['t4'];
      let reqInfoMap = new requestInfo();
      reqInfoMap = this.getReqInfoMapValue(clientSeq);
      const indexCode = msgObj['t2'];
      if (clientSeq === 0) {
        this.mrkIndex_MsgMap.set(indexCode.toUpperCase(), msgObj);
      } else if (
        clientSeq > 0 &&
        (reqInfoMap != null &&
          reqInfoMap !== undefined &&
          reqInfoMap.reqFunct === this.getLast_Imsg)
      ) {
        const mrkIndexObj = this.mrkIndex_MsgMap.get(indexCode.toUpperCase());
        if (
          mrkIndexObj == null ||
          mrkIndexObj['seq'] < msgObj['seq']
        ) {
          this.mrkIndex_MsgMap.set(indexCode.toUpperCase(), msgObj);
        }
      }

      if (clientSeq != null && clientSeq > 0) {
        if (reqInfoMap != null && reqInfoMap.reqFunct === 'GET_INDEX_HIST') {
          return;
        }
      }

      let mrkIndex_MsgObj = [], length = 0;
      if (msgKey.toUpperCase() === 'HNX_HNXINDEX') {
        mrkIndex_MsgObj = this.HNX_INDEX['indexArr'];
        // if (
        //   mrkIndex_MsgObj == null ||
        //   mrkIndex_MsgObj === undefined ||
        //   mrkIndex_MsgObj.length === 0
        // ) {
        //   mrkIndex_MsgObj = [];
        //   mrkIndex_MsgObj.push(['Time', 'HNX', 'Vol', 'Ref']);
        // } else {
        //   length = mrkIndex_MsgObj.length;
        //   if (mrkIndex_MsgObj[length - 1][0][0] === 15 && mrkIndex_MsgObj[length - 1][0][1] === 0 && mrkIndex_MsgObj[length - 1][0][2] === 0) {
        //     mrkIndex_MsgObj.pop();
        //   }
        // }
      } else if (msgKey.toUpperCase() === 'HSX_HSXINDEX') {
        mrkIndex_MsgObj = this.VN_INDEX['indexArr'];
        // if (
        //   mrkIndex_MsgObj == null ||
        //   mrkIndex_MsgObj === undefined ||
        //   mrkIndex_MsgObj.length === 0
        // ) {
        //   mrkIndex_MsgObj = [];
        //   mrkIndex_MsgObj.push(['Time', 'VNI', 'Vol', 'Ref']);
        // } else {
        //   length = mrkIndex_MsgObj.length;
        //   if (mrkIndex_MsgObj[length - 1][0][0] === 15 && mrkIndex_MsgObj[length - 1][0][1] === 0 && mrkIndex_MsgObj[length - 1][0][2] === 0) {
        //     mrkIndex_MsgObj.pop();
        //   }
        // }
      } else if (msgKey.toUpperCase() === 'HNX_HNXUPCOMINDEX') {
        mrkIndex_MsgObj = this.UPCOM_INDEX['indexArr'];
        // if (
        //   mrkIndex_MsgObj == null ||
        //   mrkIndex_MsgObj === undefined ||
        //   mrkIndex_MsgObj.length === 0
        // ) {
        //   mrkIndex_MsgObj = [];
        //   mrkIndex_MsgObj.push(['Time', 'UPCOM', 'Vol', 'Ref']);
        // } else {
        //   length = mrkIndex_MsgObj.length;
        //   if (mrkIndex_MsgObj[length - 1][0][0] === 15 && mrkIndex_MsgObj[length - 1][0][1] === 0 && mrkIndex_MsgObj[length - 1][0][2] === 0) {
        //     mrkIndex_MsgObj.pop();
        //   }
        // }
      }
      else {
        // -- tất cả các index còn lại
        mrkIndex_MsgObj = [];
      }
      // if (mrkIndex_MsgObj.length === 3) {
      //   mrkIndex_MsgObj[1] = [mrkIndex_MsgObj[1][0], mrkIndex_MsgObj[1][1], null, mrkIndex_MsgObj[1][3]];
      // } else if (mrkIndex_MsgObj.length === 2) {
      //   mrkIndex_MsgObj[1] = [mrkIndex_MsgObj[1][0], mrkIndex_MsgObj[1][1], 0, mrkIndex_MsgObj[1][3]];
      // }
      let newIndexNode;
      if (calTime != null && calTime !== undefined && calTime.length >= 8) {
        // calTime = calTime.substr(0, 8);
        // const calTimeSpilit = calTime.split(':', 3);
        const time = moment(calTime, 'HH:mm:ss').valueOf();
        if (Number(msgObj['U12']) <= 0) {
          return;
        } else {
          newIndexNode = [
            time,
            Number(msgObj['t3']),
            Number(msgObj['U12']), Number(msgObj['t3']) - Number(msgObj['t5'])
          ];
        }
      } else {
        if (Number(msgObj['U12']) === 0 && (msgObj['seq'] === 0 && msgObj['subseq'] === 0)) {
          if (msgKey.toUpperCase() === 'HNX_HNXINDEX') { this.HNX_INDEX['ref'] = Number(msgObj['t3']); }
          if (msgKey.toUpperCase() === 'HSX_HSXINDEX') { this.VN_INDEX['ref'] = Number(msgObj['t3']); }
          if (msgKey.toUpperCase() === 'HNX_HNXUPCOMINDEX') { this.UPCOM_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HNX_HNX30') { this.HNX30_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VN30') { this.VN30_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VN100') { this.VN100_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNX50') { this.VNX50_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNXALL') { this.VNXALL_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNFIN') { this.VNFIN_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNREAL') { this.VNREAL_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNSML') { this.VNSML_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNMID') { this.VNMID_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNUTI') { this.VNUTI_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNCONS') { this.VNCONS_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNALL') { this.VNALL_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNSI') { this.VNSI_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNENE') { this.VNENE_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNIND') { this.VNIND_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNMAT') { this.VNMAT_INDEX['ref'] = Number(msgObj['t3']); }
          // if (msgKey.toUpperCase() === 'HSX_VNIT') { this.VNIT_INDEX['ref'] = Number(msgObj['t3']); }

          // newIndexNode = [moment('09:00:00','HH:mm:ss').valueOf(), Number(msgObj['t3']), 0, Number(msgObj['t3'])];
          // return;
        }
      }
      // console.log(newIndexNode);
      if (
        newIndexNode != null &&
        newIndexNode !== undefined &&
        newIndexNode.length > 0
      ) {
        // if (msgKey === 'HNX_HNXUpcomIndex') console.log(msgKey,mrkIndex_MsgObj,newIndexNode);
        mrkIndex_MsgObj.push(newIndexNode);
      }
      const indexValue = Number(msgObj['t3']);
      const indexValueChang = Number(msgObj['t5']);
      const indexPercChang = Number(msgObj['t6']);
      const indexTotalQty = Number(msgObj['t7']);
      const indexTotalValue =
        Math.round(Number(msgObj['t14']) / 1000000) / 1000;

      // if (msgKey === 'HNX_HNXUpcomIndex') console.log(msgKey,newIndexNode,mrkIndex_MsgObj);
      // -- đẩy thông tin index thu gọn vào 5 đồ thị nhỏ trên bảng giá
      // this.logMessage("index: " + JSON.stringify(msgObj));
      if (msgKey.toUpperCase() === 'HNX_HNXINDEX') {
        this.HNX_INDEX['ref'] = newIndexNode[3];
        this.HNX_INDEX['indexArr'] = mrkIndex_MsgObj ? mrkIndex_MsgObj : [];
        this.HNX_INDEX['indexValue'] = indexValue;
        this.HNX_INDEX['indexValueChang'] = indexValueChang;
        this.HNX_INDEX['indexPercChang'] = indexPercChang;
        this.HNX_INDEX['indexTotalQty'] = indexTotalQty;
        this.HNX_INDEX['indexTotalValue'] = indexTotalValue;
        this.HNX_INDEX['indexCode'] = msgObj['t18'];
        // this.HNX_INDEX['indexCd'] = msgObj['t2'];

        this.HNX_INDEX['indexHighest'] = msgObj['t24'];
        this.HNX_INDEX['indexLowest'] = msgObj['t25'];
        this.HNX_INDEX['totalStock'] = msgObj['t22'];
        this.HNX_INDEX['indexOpen'] = msgObj['U27'];

        this.event_ServerPushIndexChart.next('HNX_INDEX');
      } else if (msgKey.toUpperCase() === 'HSX_HSXINDEX') {
        this.VN_INDEX['ref'] = newIndexNode[3];
        this.VN_INDEX['indexArr'] = mrkIndex_MsgObj ? mrkIndex_MsgObj : [];
        this.VN_INDEX['indexValue'] = indexValue;
        this.VN_INDEX['indexValueChang'] = indexValueChang;
        this.VN_INDEX['indexPercChang'] = indexPercChang;
        this.VN_INDEX['indexTotalQty'] = indexTotalQty;
        this.VN_INDEX['indexTotalValue'] = indexTotalValue;
        this.VN_INDEX['indexCode'] = msgObj['t18'];
        // this.VN_INDEX['indexCd'] = msgObj['t2'];

        this.VN_INDEX['indexHighest'] = msgObj['t24'];
        this.VN_INDEX['indexLowest'] = msgObj['t25'];
        this.VN_INDEX['totalStock'] = msgObj['t22'];
        this.VN_INDEX['indexOpen'] = msgObj['U27'];

        this.event_ServerPushIndexChart.next('VN_INDEX');
      } else if (msgKey.toUpperCase() === 'HNX_HNXUPCOMINDEX') {
        this.UPCOM_INDEX['ref'] = newIndexNode[3];
        this.UPCOM_INDEX['indexArr'] = mrkIndex_MsgObj ? mrkIndex_MsgObj : [];
        this.UPCOM_INDEX['indexValue'] = indexValue;
        this.UPCOM_INDEX['indexValueChang'] = indexValueChang;
        this.UPCOM_INDEX['indexPercChang'] = indexPercChang;
        this.UPCOM_INDEX['indexTotalQty'] = indexTotalQty;
        this.UPCOM_INDEX['indexTotalValue'] = indexTotalValue;
        this.UPCOM_INDEX['indexCode'] = msgObj['t18'];
        // this.UPCOM_INDEX['indexCd'] = msgObj['t2'];

        this.UPCOM_INDEX['indexHighest'] = msgObj['t24'];
        this.UPCOM_INDEX['indexLowest'] = msgObj['t25'];
        this.UPCOM_INDEX['totalStock'] = msgObj['t22'];
        this.UPCOM_INDEX['indexOpen'] = msgObj['U27'];

        this.event_ServerPushIndexChart.next('UPCOM_INDEX');

      } else if (msgKey.toUpperCase() === 'HNX_HNX30') {
        this.updateValueIndex('HNX30', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VN30') {
        this.updateValueIndex('VN30', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VN100') {
        this.updateValueIndex('VN100', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNX50') {
        this.updateValueIndex('VNX50', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNXALL') {
        this.updateValueIndex('VNXALL', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNFIN') {
        this.updateValueIndex('VNFIN', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNREAL') {
        this.updateValueIndex('VNREAL', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNSML') {
        this.updateValueIndex('VNSML', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNMID') {
        this.updateValueIndex('VNMID', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNUTI') {
        this.updateValueIndex('VNUTI', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNCONS') {
        this.updateValueIndex('VNCONS', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNALL') {
        this.updateValueIndex('VNALL', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNSI') {
        this.updateValueIndex('VNSI', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNENE') {
        this.updateValueIndex('VNENE', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNIND') {
        this.updateValueIndex('VNIND', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNMAT') {
        this.updateValueIndex('VNMAT', newIndexNode,indexValue,indexValueChang,indexPercChang,
        indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNIT') {
        this.updateValueIndex('VNIT', newIndexNode,indexValue,indexValueChang,indexPercChang,
          indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNFINSELECT') {
        this.updateValueIndex('VNFINSELECT', newIndexNode,indexValue,indexValueChang,indexPercChang,
          indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNFINLEAD') {
        this.updateValueIndex('VNFINLEAD', newIndexNode,indexValue,indexValueChang,indexPercChang,
          indexTotalQty, indexTotalValue, msgObj);
      } else if (msgKey.toUpperCase() === 'HSX_VNDIAMOND') {
        this.updateValueIndex('VNDIAMOND', newIndexNode,indexValue,indexValueChang,indexPercChang,
          indexTotalQty, indexTotalValue, msgObj);
      }
      // console.log('VN_INDEX', this.VN_INDEX['indexArr'].length)
      // console.log('HNX', this.HNX_INDEX['indexArr'].length)
      // console.log('UPCOME', this.UPCOM_INDEX['indexArr'].length)
      return;
    };

    this.updateValueIndex = (key, newIndexNode, indexValue,indexValueChang,indexPercChang,
      indexTotalQty, indexTotalValue, msgObj) => {
      // this[key + '_INDEX'].ref = newIndexNode[3];
      this[key + '_INDEX'].indexValue = indexValue;
      this[key + '_INDEX'].indexValueChang = indexValueChang;
      this[key + '_INDEX'].indexPercChang = indexPercChang;
      this[key + '_INDEX'].indexTotalQty = indexTotalQty;
      this[key + '_INDEX'].indexTotalValue = indexTotalValue;
      this[key + '_INDEX'].indexHighest = Number(msgObj.t24);
      this[key + '_INDEX'].indexLowest = Number(msgObj.t25);
      this[key + '_INDEX'].totalStock = Number(msgObj.t22);
      this[key + '_INDEX'].indexOpen = msgObj['U27'];
      this[key + '_INDEX'].indexCode = msgObj.t18;
      this[key + '_INDEX'].indexCd = msgObj.t2;
      this[key + '_INDEX'].seq = msgObj.seq;
      this[key + '_INDEX'].subseq = msgObj.subseq;
      this[key + '_INDEX'].lastTime = msgObj.t4;
      this[key + '_INDEX'].indexVolumne = msgObj.U12;
      this.event_ServerPushIndexChart.next(key);
    };

    this.getAllIndex = () => {
      const arr = [
        this.VN_INDEX,
        // this.VN30_INDEX, 
        this.HNX_INDEX,
        this.HNX30_INDEX,
        this.UPCOM_INDEX,
        // this.VN100_INDEX,
        // this.VNX50_INDEX,
        // this.VNXALL_INDEX,
        // this.VNFIN_INDEX,
        // this.VNREAL_INDEX,
        // this.VNSML_INDEX,
        // this.VNMID_INDEX,
        // this.VNUTI_INDEX,
        // this.VNCONS_INDEX,
        // this.VNALL_INDEX,
        // this.VNSI_INDEX,
        // this.VNENE_INDEX,
        // this.VNIND_INDEX,
        // this.VNMAT_INDEX,
        // this.VNIT_INDEX
      ];
      this.tradview_StkList_HSX.forEach(item => {
        if (item.key !== 'CW') arr.push(this[item.key + '_INDEX'])
      })
      return arr;
    }

    this.updEP_Msg2MrkInfoMap = (clientSeq = 0, msgObj = {}) => {
      // let reqInfoMap = new requestInfo();
      // reqInfoMap = this.getReqInfoMapValue(clientSeq);
      // if (reqInfoMap.reqFunct == "SUBSCRIBE_EXTEND") return;
      if (msgObj['t33'] !== 'M1' && msgObj['t33'] !== 'M') return;
      const splitted = msgObj['U8'].split('|', 3);
      const msgKey = splitted[0] + '_' + splitted[2];

      let stkMsgObj = this.getMsgObjectByMsgKey(msgKey);
      if (stkMsgObj == null || stkMsgObj === undefined) {
        stkMsgObj = new stkPriceBoard();
      }
      // console.log(stkMsgObj);
      const sendtime = msgObj['t52'].substr(9);
      if (sendtime.length !== 8) { return; }
      const seq = msgObj['seq'];
      let subseq = msgObj['subseq'];
      if (subseq == null || subseq === undefined) { subseq = 0; }
      // const sendTimeSplit = sendtime.split(':', 3);
      // const sendtimeArr = [
      //   Number(sendTimeSplit[0]),
      //   Number(sendTimeSplit[1]),
      //   Number(sendTimeSplit[2])
      // ];
      const sendtimeArr = moment(sendtime, 'HH:mm:ss').valueOf();
      const matchPrice = Number(msgObj['t31']);
      const matchVolum = Number(msgObj['t32']);

      // - Mảng lịch sử khớp lệnh: Sum khối lượng khớp theo thời gian
      let autionTimePrcObj = this.autionMatch_timePriceSumVol_Map.get(msgKey);
      let autionTimePrcObjChart = this.autionMatch_timePriceSumVol_chart_Map.get(msgKey);
      // let find = false;
      if (autionTimePrcObj != null && autionTimePrcObj.length > 0) {
        const objFind = autionTimePrcObj.find(o => o.c3 === seq && o.c4 === subseq);
        if (objFind) { return };

        if (clientSeq > 0) {
          autionTimePrcObj.push({
            c0: sendtime,
            c1: matchVolum,
            c2: matchPrice,
            c3: seq,
            c4: subseq
          });
          const newObj = [sendtimeArr, matchPrice, matchVolum, stkMsgObj['t260']];
          autionTimePrcObjChart.splice(0, 0, newObj);
        } else {
          autionTimePrcObj.splice(0, 0, {
            c0: sendtime,
            c1: matchVolum,
            c2: matchPrice,
            c3: seq,
            c4: subseq
          });
          const newObj = [sendtimeArr, matchPrice, matchVolum, stkMsgObj['t260']];
          autionTimePrcObjChart.push(newObj);
          // console.log('vào clientSeq=0, 2: autionTimePrcObjChart' + JSON.stringify(autionTimePrcObjChart));
        }
      } else {
        autionTimePrcObj = [];
        autionTimePrcObjChart = [];
        autionTimePrcObj.push({
          c0: sendtime,
          c1: matchVolum,
          c2: matchPrice,
          c3: seq,
          c4: subseq
        });
        // let labelObj = ['Time', 'Price', 'Volume', 'Ref'];
        // autionTimePrcObjChart.push(labelObj);
        // labelObj = [[9, 0, 0], null, null, stkMsgObj['t260']];
        // autionTimePrcObjChart.push(labelObj);
        const newObj = [sendtimeArr, matchPrice, matchVolum, stkMsgObj['t260']];
        autionTimePrcObjChart.push(newObj);
        // console.log('vào not found, : autionTimePrcObjChart' + JSON.stringify(autionTimePrcObjChart));
      }

      this.autionMatch_timePriceSumVol_Map.set(msgKey, autionTimePrcObj);
      this.autionMatch_timePriceSumVol_chart_Map.set(msgKey, autionTimePrcObjChart);


      // this.glbStore.autionMatch_timePrice_Map.set(msgKey, autionTimePriceObj);
      // -- send event change EP to stock extention page if data is realtime pushed
      if (clientSeq === 0) {
        // console.log('autionMatch_timePriceSumVol_chart_Map',autionTimePrcObjChart);
        this.event_ServerPushMRKRcvChangeEpMsg.next(msgKey);
      }
      return;
    };

    this.updBI_Msg2MrkInfoMap = (msgObj = {}) => {
      // if (msgObj["U8"].length <= 7) return;
      const t340 = msgObj['t340'], t336 = msgObj['t336'];
      let t340_code = '', t340_nm = '';
      if (t340 === '0' || t340 === '90') {
        t340_code = 'BEFORE_OPEN';
      } else if (t340 === '2' || t340 === '3' || t340 === '4' || t340 === '6') {
        t340_code = 'PENDING';
      } else if (t340 === '6' || t340 === '97') {
        t340_code = 'RELEASE';
      } else if (t340 === '1' || t340 === '5') {
        if (t336 == null || t336.length < 4) {
          t340_code = 'NONE';
        } else {
          const t = t336.substring(4, t336.length);
          if (t === 'ATO_NML') {
            t340_code = 'OPEN_ATO';
          } else if (t === 'CON_NML' || t === 'CON_NEW' || t === 'CON_SPC') {
            t340_code = 'OPEN_LO';
          } else if (
            t === 'AUC_C_NML' ||
            t === 'AUC_C_NEW' ||
            t === 'AUC_C_NML_LOC' ||
            t === 'AUC_C_NEW_LOC'
          ) {
            t340_code = 'OPEN_ATC';
          } else if (t === 'PTH_P_NML') {
            t340_code = 'CLOSE';
          } else if (t === 'LIS_BRK_NML') {
            t340_code = 'BREAK_TIME';
          } else {
            t340_code = 'RELEASE';
          }
        }
      }
      if (t340_code === 'OPEN_ATO') {
        t340_nm = 'priceboard_ATO_session'; // -- Phiên ATO;
      } else if (t340_code === 'OPEN_ATC') {
        t340_nm = 'priceboard_ATC_session'; // -- Phiên ATC
      } else if (t340_code === 'OPEN_LO') {
        t340_nm = 'priceboard_Continuous'; // -- Phiên liên tục
      } else if (t340_code === 'BREAK_TIME') {
        t340_nm = 'priceboard_Break_time'; // Nghỉ trưa
      } else if (t340_code === 'PENDING') {
        t340_nm = 'priceboard_Pending'; // -- Nghỉ trưa
      } else if (t340_code === 'CLOSE') {
        t340_nm = 'priceboard_Close'; // -- Phiên GDTT
      } else if (t340_code === 'RELEASE') {
        t340_nm = 'priceboard_Release'; // --Hết giờ GD
      } else {
        t340_nm = 'priceboard_Not_traded'; // -- Chưa đến giờ GD
      }
      // -----------------------------------------------------
      if (msgObj['U10'] === '03' || msgObj['U10'] === '05') {
        // this.logMessage('MessageBI: ' + JSON.stringify(msgObj));
        if (msgObj['t341'].toUpperCase() === 'LIS') {
          const oldStatus = this.mrkInfo['boardStatus']['HNX']['t340_code'];
          this.mrkInfo['boardStatus']['HNX'] = {
            t340: t340,
            t340_code: t340_code,
            t340_nm: t340_nm
          };
          // if (msgObj["t341"] === "LIS" && t340_code !== "RELEASE") {
          if (msgObj['t341'] === 'LIS') {
            this.HNX_INDEX['increase'] = msgObj['t251'];
            this.HNX_INDEX['equaCeil'] = 0;
            this.HNX_INDEX['noChange'] = (this.HNX_PRC_LIST.length === 0 ? 0 : (this.HNX_PRC_LIST.length - (msgObj['t251'] + msgObj['t253'])));
            this.HNX_INDEX['decrease'] = msgObj['t253'];
            this.HNX_INDEX['equaFloor'] = 0;
            this.HNX_INDEX.qtyBiglot = msgObj.t240; // t240 KLGDTT
            this.HNX_INDEX.valueBiglot = msgObj.t241; // t241 GTGDTT
            this.event_ServerPushIndexChart.next('HNX');
          } else {
            // -- cacs chi so khac
          }
          this.HNX_INDEX['tradStatus'] = t340_nm;
          this.HNX30_INDEX['tradStatus'] = t340_nm;
          this.event_ServerPushIndexChart.next('HNX');
          this.event_ServerPushIndexChart.next('HNX30');
          if (oldStatus != null && oldStatus !== undefined && oldStatus !== t340_code) {
            const toastObj = { key: 'PRC_BOARD_STATUS', msg: ['HNX', t340_nm] };
            this.event_ToastCommonInfo.next(toastObj);
          }
          if (msgObj['U8'].toUpperCase() === 'HNX|BI|HNX30') {
            this.HNX30_INDEX['increase'] = msgObj['t251'];
            this.HNX30_INDEX['equaCeil'] = 0;
            this.HNX30_INDEX['noChange'] = 30 - (msgObj['t251'] + msgObj['t253']);
            this.HNX30_INDEX['decrease'] = msgObj['t253'];
            this.HNX30_INDEX['equaFloor'] = 0;
            this.event_ServerPushIndexChart.next('HNX30');
          }
        } else if (msgObj['t341'].toUpperCase() === 'UPC') {
          const oldStatus = this.mrkInfo['boardStatus']['UPC']['t340_code'];
          this.mrkInfo['boardStatus']['UPC'] = {
            t340: t340,
            t340_code: t340_code,
            t340_nm: t340_nm
          };
          // if (msgObj["t341"] === "UPC" && t340_code !== "RELEASE") {
          if (msgObj['t341'] === 'UPC') {
            this.UPCOM_INDEX['increase'] = msgObj['t251'];
            this.UPCOM_INDEX['equaCeil'] = 0;
            this.UPCOM_INDEX['noChange'] = (this.UPC_PRC_LIST.length === 0 ? 0 : (this.UPC_PRC_LIST.length - (msgObj['t251'] + msgObj['t253'])));
            this.UPCOM_INDEX['decrease'] = msgObj['t253'];
            this.UPCOM_INDEX['equaFloor'] = 0;
            this.UPCOM_INDEX.qtyBiglot = msgObj.t240; // t240 KLGDTT
            this.UPCOM_INDEX.valueBiglot = msgObj.t241; // t241 GTGDTT
            this.event_ServerPushIndexChart.next('UPCOM');
          } else {
            // -- cacs chi so khac
          }
          this.UPCOM_INDEX['tradStatus'] = t340_nm;
          this.event_ServerPushIndexChart.next('UPCOM');
          if (
            oldStatus != null &&
            oldStatus !== undefined &&
            oldStatus !== t340_code
          ) {
            const toastObj = { key: 'PRC_BOARD_STATUS', msg: ['UPC', t340_nm] };
            this.event_ToastCommonInfo.next(toastObj);
          }
        }
      } else if (msgObj['U10'] === '01') {
        // this.logMessage(JSON.stringify(msgObj));
        if (msgObj['U8']) {
          if (msgObj['U8'].toUpperCase() === 'HSX|BI|HSXINDEX') {
            const oldStatus = this.mrkInfo['boardStatus']['HSX']['t340_code'];
            this.mrkInfo['boardStatus']['HSX'] = {
              t340: t340,
              t340_code: t340_code,
              t340_nm: t340_nm
            };
            this.VN_INDEX['increase'] = msgObj['t251'];
            this.VN_INDEX['equaCeil'] = 0;
            this.VN_INDEX['noChange'] = (this.HSX_PRC_LIST.length === 0 ? 0 : (this.HSX_PRC_LIST.length - (msgObj['t251'] + msgObj['t253'])));
            this.VN_INDEX['decrease'] = msgObj['t253'];
            this.VN_INDEX['equaFloor'] = 0;
            this.VN_INDEX['tradStatus'] = t340_nm;
            this.VN30_INDEX['tradStatus'] = t340_nm;
            this.VN_INDEX.qtyBiglot = msgObj.t240; // t240 KLGDTT
            this.VN_INDEX.valueBiglot = msgObj.t241; // t241 GTGDTT
            this.event_ServerPushIndexChart.next('VNI');
            this.event_ServerPushIndexChart.next('VNI30');
            if (
              oldStatus != null &&
              oldStatus !== undefined &&
              oldStatus !== t340_code
            ) {
              const toastObj = { key: 'PRC_BOARD_STATUS', msg: ['HSX', t340_nm] };
              this.event_ToastCommonInfo.next(toastObj);
            }
          } else if (msgObj['U8'].toUpperCase() === 'HSX|BI|VN30') {
            this.VN30_INDEX['increase'] = msgObj['t251'];
            this.VN30_INDEX['equaCeil'] = 0;
            this.VN30_INDEX['noChange'] = 30 - (msgObj['t251'] + msgObj['t253']);
            this.VN30_INDEX['decrease'] = msgObj['t253'];
            this.VN30_INDEX['equaFloor'] = 0;
            this.event_ServerPushIndexChart.next('VNI30');
          }
        }
      }
      return;
    };

    this.updAA_Msg2MrkInfoMap = (msgObj = {}) => {
      if (
        msgObj['ClientSeq'] === 0 ||
        msgObj['ClientSeq'] == null ||
        msgObj['ClientSeq'] === undefined
      ) {
        let msgInfo = '', AAFlag = '', sbTp = '';
        if (msgObj['U19'] === 'C') {
          AAFlag = '[Hủy]';
        } else {
          AAFlag = '[Mới]';
        }
        if (msgObj['U14'] === 'S') {
          sbTp = 'Quảng cáo Bán';
        } else {
          sbTp = 'Quảng cáo Mua';
        }
        if (msgObj['U10'] === '01') {
          msgInfo = 'Thông báo ' + AAFlag + ' lệnh quảng cáo sở GDCK HOSE';
        } else {
          msgInfo = 'Thông báo ' + AAFlag + ' lệnh quảng cáo sở GDCK HNX';
        }
        msgInfo = msgInfo + '. ' + sbTp + ', từ thành viên: ' + msgObj['U18'];

        const splitted = msgObj['U8'].split('|', 3);
        const stkCd = splitted[2];
        msgInfo = msgInfo + '. ' + 'Mã CK: ' + stkCd + ', ' + 'KL: ' +
          FormatNumber(Number(msgObj['U16'])) +
          ', ' + 'giá: ' +
          FormatNumber(Number(msgObj['U17'])) +
          '. ' + 'Vui lòng liên hệ: ' + msgObj['U15'];
        const toastObj = { key: 'ADVERT_ORDER', msg: msgInfo };
        this.event_ToastCommonInfo.next(toastObj);
      }
      if (msgObj != null && msgObj.length > 0) {
        this.mrkInfo['advert_order'].push(msgObj);
      }
      return;
    };

    this.updTS_Msg2MrkInfoMap = (msgObj = {}) => {
      // this.mrkInfo['trad_dt'] = msgObj['t388'];
      // this.mrkInfo['trad_tm'] = msgObj['t399'];
      // const workDt = msgObj['t388'], timee = msgObj['t399']; // 11:20:15
      // Tạm thời chỉ lấy time theo client
      // if (workDt && timee) {
      //   this.orgTime = new Date(Number(workDt.substr(0, 4)), Number(workDt.substr(4, 2)) - 1, Number(workDt.substr(6, 2)),
      //     Number(timee.substr(0, 2)), Number(timee.substr(3, 2)), Number(timee.substr(6, 2)));
      // }
      return;
    };
    //-- End process a message from MKT_INFO chanel - auto pushed by server

    this.set_language = (lang) => {
      if (lang != null && lang.length > 0) {
        sessionStorage.setItem('lang', lang);
      }
    };

    this.get_language = () => {
      const lang = sessionStorage.getItem('lang');
      if (lang != null) { return lang.toUpperCase(); }
      return 'VI';
    };

    this.getIndexlist = () => {
      // console.log(this.tradview_StkList.length)
      let objMsgValue = {};
      let keyUpper = '', i = 0;
      const cw = { key: 'CW', value: 'covered_warrant' }
      const pt_hsx = { key: 'pt_hsx', value: 'put_through_tab' }
      const pt_hnx = { key: 'pt_hnx', value: 'put_through_tab' }
      const pt_upc = { key: 'pt_upc', value: 'put_through_tab' }
      this.tradview_StkList_HSX.push(cw);
      this.tradview_StkList_HSX.push(pt_hsx);
      this.tradview_StkList_HNX.push(pt_hnx);
      this.tradview_StkList_UPC.push(pt_upc);

      for (i = 0; i < this.tradview_StkList.length; i++) {
        if (this.tradview_StkList[i]['type'] === 'index') {
          keyUpper = this.tradview_StkList[i]['symbol'].toUpperCase();
          // if (keyUpper !== 'HNXINDEX' && keyUpper !== 'HNXUPCOMINDEX' && keyUpper !== 'HSXINDEX') {
          if (keyUpper !== 'HSXINDEX') {
            objMsgValue = { key: this.tradview_StkList[i]['symbol'], value: this.tradview_StkList[i]['full_name'] };
            if (this.tradview_StkList[i]['exchange'] === 'HOSE') {
              this.tradview_StkList_HSX.push(objMsgValue);
              // console.log('vào HSX indx: ' + JSON.stringify(objMsgValue));
            } else {

              if (this.tradview_StkList[i]['symbol'] !== 'HNXUPCOMINDEX') {
                if (objMsgValue.value !== 'HNXINDEX' && objMsgValue.value !== 'HNX30TRI') this.tradview_StkList_HNX.push(objMsgValue);
              } else {
                if (objMsgValue.value !== 'HNXUPCOMINDEX') { this.tradview_StkList_UPC.push(objMsgValue); }

              }
              // console.log('vào HNX indx: ' + JSON.stringify(objMsgValue));
            }
          }
        }
      }
      // console.log('done getIndexlist')
    }

    this.updateToFvlList = (mskey = '') => {
      if (mskey == null || mskey.length === 0) { return; }
      const flbLength = this.FVL_STK_LIST.length;
      let fliLength = 0, i = 0, j = 0, stkCd = '';
      const stkMsgObj = this.getMsgObjectByMsgKey(mskey);
      let find = false;
      if (stkMsgObj == null || stkMsgObj === undefined) { return; }
      // sanGd = mskey.substr(0, 3);
      stkCd = mskey.substr(4);
      for (i = 0; i < flbLength; i++) {
        if (this.FVL_STK_LIST[i]['STK_LIST'].indexOf(stkCd) < 0) {
          continue;
        }
        fliLength = this.FVL_STK_LIST[i]['FVL_PRICEBOARD'].length;
        if (fliLength > 0) {
          find = false;
          for (j = 0; j < fliLength; j++) {
            const mrk_msg = this.FVL_STK_LIST[i]['FVL_PRICEBOARD'][j];
            if (mrk_msg !== null && mskey === mrk_msg['itemName']) {
              this.FVL_STK_LIST[i]['FVL_PRICEBOARD'][j] = stkMsgObj;
              find = true;
              break;
            }
          }
          if (!find) { this.FVL_STK_LIST[i]['FVL_PRICEBOARD'][j] = stkMsgObj; }
        } else {
          this.FVL_STK_LIST[i]['FVL_PRICEBOARD'][0] = stkMsgObj;
        }
      }
      return;
    };

    this.updateFvlGroup = (actionTp = 0, fvlId = 0, fvlNm = '') => {
      // console.log('updateFvlGroup',this.FVL_STK_LIST);
      if (actionTp !== 0 && actionTp !== 1 && actionTp !== 2) { return; };
      if (fvlId == null) { return; }
      if (actionTp === 0) {
        if (fvlNm == null || fvlNm.trim().length === 0) { return; }
        const fvlObj = { GRP_ID: fvlId, GRP_NM: fvlNm, STK_LIST: [], FVL_PRICEBOARD: [] };
        this.FVL_STK_LIST.push(fvlObj);
        const msg = { type: this.UPDATE_GRP_FVL };
        this.commonEvent.next(msg);
      } else {
        const fvlLength = this.FVL_STK_LIST.length;
        let i = 0;
        for (i = 0; i < fvlLength; i++) {
          if (this.FVL_STK_LIST[i]['GRP_ID'] === fvlId) {
            if (actionTp === 1) {
              this.FVL_STK_LIST.splice(i, 1);
            } else {
              this.FVL_STK_LIST[i]['GRP_NM'] = fvlNm;
            }
            const msg = { type: this.UPDATE_GRP_FVL };
            this.commonEvent.next(msg);
            return;
          }
        }
      }
      return;
    };

    this.updateStock2Fvl = (actionTp = 0, fvlId = 0, stkCd = '') => {
      // console.log('updateFvlGroup',this.FVL_STK_LIST,actionTp,fvlId,stkCd);
      if (actionTp !== 0 && actionTp !== 1) { return; } // -- 0 -> Add stk, 1 -> Remove stk
      if (fvlId == null || stkCd.trim().length === 0) { return; }
      const fvlLength = this.FVL_STK_LIST.length;
      let i = 0;
      for (i = 0; i < fvlLength; i++) {
        if (this.FVL_STK_LIST[i]['GRP_ID'] === fvlId) {
          if (actionTp === 0) {
            let msgObj, index;
            // index = this.glbStore.msgMrkInfoArr_indexMap.get('HSX_' + stkCd.trim());
            index = this.getIndexByMsgKey('HSX_' + stkCd.trim());
            if (index != null && index !== undefined) {
              msgObj = this.HSX_PRC_LIST[index];
            }
            if (msgObj == null || msgObj === undefined) {
              // index = this.glbStore.msgMrkInfoArr_indexMap.get('HNX_' + stkCd.trim());
              index = this.getIndexByMsgKey('HNX_' + stkCd.trim());
              if (index != null && index !== undefined) {
                msgObj = this.HNX_PRC_LIST[index];
                if (msgObj == null || msgObj === undefined || msgObj['t55'] !== stkCd.trim()) {
                  msgObj = this.UPC_PRC_LIST[index];
                }
              }
            }
            if (msgObj != null && msgObj !== undefined) {
              this.FVL_STK_LIST[i]['STK_LIST'].push(stkCd.trim());
              this.FVL_STK_LIST[i]['FVL_PRICEBOARD'].push(msgObj);
            }
            // console.log('updateFvlGroup',this.FVL_STK_LIST);
            const msg = { type: this.UPDATE_FVL, GRP_ID: fvlId };
            this.commonEvent.next(msg);
            return;
          } else {
            const fvlgrpLength = this.FVL_STK_LIST[i]['FVL_PRICEBOARD'].length;
            let j = 0, index = 0;
            let stkPriceB;
            for (j = 0; j < fvlgrpLength; j++) {
              stkPriceB = this.FVL_STK_LIST[i]['FVL_PRICEBOARD'][j]['t55'];
              if (stkPriceB != null && stkPriceB.trim() === stkCd.trim()) {
                index = this.FVL_STK_LIST[i]['STK_LIST'].indexOf(stkCd.trim());
                if (index >= 0) {
                  this.FVL_STK_LIST[i]['STK_LIST'].splice(index, 1)
                }
                this.FVL_STK_LIST[i]['FVL_PRICEBOARD'].splice(j, 1);
                // console.log('updateFvlGroup',this.FVL_STK_LIST);
                const msg = { type: this.UPDATE_FVL, GRP_ID: fvlId };
                this.commonEvent.next(msg);
                return;
              }
            }
          }
        }
      }

      return;
    };

    this.setReqInfoMapValue = (key = 0, valObj = {}) => {
      this.reqInfoMap.set(key, valObj);
    };

    this.getReqInfoMapValue = (key) => {
      return this.reqInfoMap.get(key);
    };

    this.storeStockList = (stkInfo = []) => {
      let i = 0, stkMsgObj = {}, tradObj = {}, stkTradInfo = {};
      for (i = 0; i < stkInfo.length; i++) {
        tradObj = {};
        stkTradInfo = {};
        stkMsgObj = new stkPriceBoard();
        stkMsgObj['U8'] = stkInfo[i]['U8'];
        stkMsgObj['U9'] = stkInfo[i]['U9'];
        stkMsgObj['U10'] = stkInfo[i]['U10'];
        stkMsgObj['t55'] = stkInfo[i]['t55'];
        stkMsgObj['t260'] = stkInfo[i]['t260']; // giá tham chiếu
        stkMsgObj['t332'] = stkInfo[i]['t332'];
        stkMsgObj['t333'] = stkInfo[i]['t333'];
        let ls_sanGd;
        if (stkInfo[i]['U10'] === '05') { ls_sanGd = 'UPC'; }
        if (stkInfo[i]['U10'] === '01') { ls_sanGd = 'HOSE'; }
        if (stkInfo[i]['U10'] === '03') { ls_sanGd = 'HNX'; }
        const stkfullNm = stkInfo[i]['t55'].trim() + ' - ' + ls_sanGd + ' - ' + stkInfo[i]['U9'].trim();
        const stkItem = { value: stkMsgObj['t55'], label: stkfullNm };
        if (stkInfo[i]['t55'] != null && stkInfo[i]['t55'] !== undefined &&
          stkInfo[i]['U9'] != null && stkInfo[i]['U9'] !== undefined) {
          /* eslint-disable */
          if (this.mrk_StkList.findIndex(x => x.value === stkMsgObj['t55']) < 0) {
            this.mrk_StkList.push(stkItem);
          }

          if (this.tradview_StkList.findIndex(x => x.symbol === stkInfo[i]['t55']) < 0) {
            tradObj['symbol'] = stkInfo[i]['t55'];
            tradObj['full_name'] = stkInfo[i]['t55'];
            tradObj['description'] = stkfullNm;
            tradObj['exchange'] = ls_sanGd;
            tradObj['type'] = 'stock';
            this.tradview_StkList.push(tradObj);
            // -- đẩy dữ liệu vào hashmap thông tin CK
            stkTradInfo['name'] = stkInfo[i]['t55'];
            stkTradInfo['full_name'] = ls_sanGd + ':' + stkInfo[i]['t55'];
            stkTradInfo['exchange'] = ls_sanGd;
            stkTradInfo['exchange-traded'] = ls_sanGd;
            stkTradInfo['exchange-listed'] = ls_sanGd;
            stkTradInfo['timezone'] = 'Asia/Bangkok';
            stkTradInfo['minmov'] = 1;
            stkTradInfo['minmov2'] = 0;
            stkTradInfo['pointvalue'] = 1;
            stkTradInfo['session'] = '0915-1530';
            stkTradInfo['has_intraday'] = false;
            stkTradInfo['has_no_volume'] = false;
            stkTradInfo['pricescale'] = 1;
            stkTradInfo['description'] = stkfullNm;
            stkTradInfo['type'] = 'stock';
            stkTradInfo['currency_code'] = 'VND';
            stkTradInfo['supported_resolutions'] = ['D', 'W', 'M', '3M'];
            stkTradInfo['ticker'] = stkInfo[i]['t55'];
            stkTradInfo['pro_name'] = ls_sanGd + ':' + stkInfo[i]['t55'];
            this.stkInfoTradviewMap.set(stkInfo[i]['t55'], stkTradInfo);
          }
          /* eslint-enable */
        }
        if (stkMsgObj['U8'] != null && stkMsgObj['U8'] !== undefined && stkMsgObj['U8'].trim() !== '') {
          this.updSI_Msg2MrkInfoMap(stkMsgObj, -1);
        }
      }
      if (this.tradingViewFlag) {
        this.stkListDone = true;
        const mapArr = [];
        this.stkInfoTradviewMap.forEach((value, key) => {
          const mapObj = {};
          mapObj[0] = key;
          mapObj[1] = value;
          mapArr.push(mapObj);
        })
        sessionStorage.setItem('tradinglist', JSON.stringify(this.tradview_StkList));
        sessionStorage.setItem('tradingmap', JSON.stringify(mapArr));
      }
    };

    this.convUnixTime2StrDt = (unixTm) => {
      const x = new Date(unixTm * 1000);
      const y = x.getFullYear();
      const m = x.getMonth() + 1;
      const sm = ('0' + m).slice(-2);
      const d = x.getDate();
      const sd = ('0' + d).slice(-2);
      const result = y + '' + sm + '' + sd;
      return result;
    }

    this.convStrDt2UnixTime = (strTime) => {
      try {
        const y = Number(strTime.substr(0, 4));
        const m = Number(strTime.substr(4, 2)) - 1;
        const d = Number(strTime.substr(6, 2));
        const dates = new Date(y, m, d);
        const unixtime = dates.getTime() / 1000
        return unixtime;
      } catch (error) {
        // this.logMessage('Error at convStrDt2UnixTime: ' + error);
        return -1;
      }
    }

    this.convDate2StrDt = (Datt) => {
      const y2 = Datt.getFullYear();
      const m2 = Datt.getMonth() + 1;
      const sm = ('0' + m2).slice(-2);
      const d2 = Datt.getDate();
      const sd = ('0' + d2).slice(-2);
      const result = y2 + '' + sm + '' + sd;
      return result;
    };

    this.get_language = () => {
      const lang = sessionStorage.getItem('lang');
      if (lang != null) { return lang; }
      return 'VI';
    };

    this.constructorInputPrm = (svInput) => {
      svInput['Otp'] = this.objShareGlb['sessionInfo']['Otp'] || '';
      svInput['Lang'] = this.language || 'VI';
      svInput['AppLoginID'] = this.objShareGlb['sessionInfo']['userID'].toLowerCase() || '';
      svInput['TimeOut'] = 15;
      svInput['SecCode'] = this.activeCode || '---';
      svInput['PCName'] = '';
      return svInput;
    };

    this.filterStrBfParse = (str) => {
      let result = '', i = 0;
      for (i = 0; i < str.length; i++) {
        let tt = str.substr(i, 1);
        const ascII = tt.charCodeAt(0);
        if (ascII <= 31) {
          tt = '';
        }
        if (ascII === 4) { tt = "'|'"; } // -- EOT
        result = result + tt;
      }
      return result;
    };

    this.logMessage = (message) => {
      // if (this.configInfo['isDebug']) {
        const now = new Date();
        console.log(message);
      // }
    }

    this.openAlertModal = (modalSize, modalTitle, modalContent, textBtn, typeBtn, idStr, isTransv, codesv, component, callback) => {
      const messObj = {
        type: this.SHOW_ALERT_MODAL,
        values: {
          size: modalSize || "sm",
          title: modalTitle,
          content: modalContent,
          textButton: textBtn || "common_Ok",
          btnType: typeBtn || "warning",
          aftCloseFocus: idStr,
          isTrans: isTransv,
          code: codesv || " ",
          component,
          callback
        }
      };
      this.commonEvent.next(messObj);
    }

    this.hideTitle = (id) => {
      const elemms = document.querySelectorAll('.' + id);
      for (let i = 0; i < elemms.length; i++) {
        const current = elemms[i];
        if (current === undefined || current === null) { return; }
        else if (!current.classList.contains('hide_title')) {
          current.classList.add('hide_title');
        }
      }
    };

    this.showTitle = (id) => {
      const elemms = document.querySelectorAll('.' + id);
      for (let i = 0; i < elemms.length; i++) {
        const current = elemms[i];
        if (current === undefined || current === null) { return; }
        else if (current.classList.contains('hide_title')) {
          current.classList.remove('hide_title');
        }
      }
    };

    this.filterNumber = (numberstr) => {
      if (typeof numberstr === 'number') return numberstr;
      else if (numberstr != null && numberstr.length > 0) {
        return Number(numberstr.replace(/\D/g, ''));
      }
    };

    this.getMsgObjectByMsgKey = (msgKey) => {
      if (msgKey.substr(0, 3) === 'HSX') {
        return this.HSX_PRC_LIST.find(o => o.itemName === msgKey);
      } else if (msgKey.substr(0, 3) === 'HNX') {
        let msgObj = this.HNX_PRC_LIST.find(o => o.itemName === msgKey);
        let stkCd = '';
        if (msgObj != null && msgObj !== undefined) {
          stkCd = msgObj.t55;
          if (stkCd === msgKey.substr(4)) {
            return msgObj;
          }
        }
        if (msgObj == null || msgObj === undefined) {
          msgObj = this.UPC_PRC_LIST.find(o => o.itemName === msgKey);
        }
        return msgObj;
      }
      return null;
    };

    this.getTimeoutNum = (timoutTp) => {
      if (timoutTp === 1) {
        return this.timeoutService;
      } else if (timoutTp === 2) {
        return this.timeoutClient;
      } else if (timoutTp === 3) {
        return this.timeoutClientBank;
      }
      return this.timeoutClient;
    };

    // -- sắp xếp lại mảng mrk_StkList
    this.compareStkcode = (a, b) => {
      const stkA = a.value;
      const stkB = b.value;
      let comparison = 0;
      if (stkA > stkB) {
        comparison = -1;
      } else if (stkA < stkB) {
        comparison = 1;
      }
      return comparison;
    };

    // -- thời gian bảng điện
    this.setItervClientTimeFunct = () => {
      if (this.orgTime == null || this.orgTime === undefined) {
        this.orgTime = new Date();
      } else {
        this.orgTime = new Date(this.orgTime.getTime() + 30000);
      }
      const h = this.addZero(this.orgTime.getHours(), 2) + '';
      const m = this.addZero(this.orgTime.getMinutes(), 2) + '';
      this.mrkInfo['trad_time'] = h + ':' + m;
    };

    this.addZero = (x, n) => {
      while (x.toString().length < n) {
        x = '0' + x;
      }
      return x;
    };
    
    this.convDate2StrTime = (Datt) => {
      const y2 = Datt.getFullYear();
      const m2 = Datt.getMonth() + 1;
      const sm = ('0' + m2).slice(-2);
      const d2 = Datt.getDate();
      const sd = ('0' + d2).slice(-2);
      const hr = Datt.getHours() + 1;
      const hrs = ('0' + hr).slice(-2);
      const mi = Datt.getMinutes() + 1;
      const mis = ('0' + mi).slice(-2);
      const ss = Datt.getSeconds() + 1;
      const sss = ('0' + ss).slice(-2);
      const result = y2 + '' + sm + '' + sd + '' + hrs + '' + mis + '' + sss;
      return result;
    };

    this.getStkfull = (stk) => {
      if (stk.length === 3) {
        const objStk = this.mrk_StkList.find(o => o.value === stk);
        if (objStk) return objStk.label;
        else return stk;
      } else return stk;
    };

    // kiểm tra xem otp đã dc nhập chưa
    this.checkOtp = (functNm) => {
      // if (this.objShareGlb['sessionInfo']['OtpType'] == null ||
      //   this.objShareGlb['sessionInfo']['OtpType'] === undefined ||
      //   Number(this.objShareGlb['sessionInfo']['OtpType']) !== 3) {
      //   return true; 666777
      // }
      // console.log('checkOtp', this.objShareGlb['sessionInfo']);
      if (this.objShareGlb['userInfo']['c22'] && this.objShareGlb['userInfo']['c22'] === 'N') return true;
      if (this.objShareGlb['sessionInfo']['Otp'] == null ||
        this.objShareGlb['sessionInfo']['Otp'] === undefined ||
        this.objShareGlb['sessionInfo']['Otp'] === '') {
        const message = {};
        message['type'] = this.misTypeGetOtp;
        message['data'] = functNm;
        console.log("this.checkOtp -> message", message)
        this.commonEvent.next(message);
        return false;
      }
      return true;
    };

    this.getCurrentValues = (nowDt, stk) => {
      const stkInfo = this.stkInfoTradviewMap.get(stk);
      // tslint:disable-next-line:prefer-const
      let stkType = 'stock', mrkObj = {}, itemPointCandleStk = new Array(6);
      if (stkInfo) {
        stkType = stkInfo['type'];
      }
      if (stkType === 'stock') {
        let stkCd = 'HNX_' + stk;
        mrkObj = this.getMsgObjectByMsgKey(stkCd);
        if (mrkObj == null || mrkObj === undefined) {
          stkCd = 'HSX_' + stk;
          mrkObj = this.getMsgObjectByMsgKey(stkCd);
          if (mrkObj == null || mrkObj === undefined) {
            stkCd = 'UPC_' + stk;
            mrkObj = this.getMsgObjectByMsgKey(stkCd);
          }
        }
        if (mrkObj != null && mrkObj !== undefined) {
          itemPointCandleStk['c0'] = nowDt;
          itemPointCandleStk['c6'] = mrkObj['t137'] || mrkObj['t260']; // -- Open Price
          itemPointCandleStk['c5'] = mrkObj['t266'] || mrkObj['t260']; // -- hight Price (giá đặt mua tốt nhất)
          itemPointCandleStk['c4'] = mrkObj['t2661'] || mrkObj['t260']; // -- low price
          itemPointCandleStk['c7'] = mrkObj['t31'] > 0 ? mrkObj['t31'] : (mrkObj['t139'] > 0 ? mrkObj['t139'] : mrkObj['t260']); // -- Close Price
          itemPointCandleStk['c8'] = mrkObj['t387'] || 0; // -- volumn
          // console.log('getCurrentValues: ' + JSON.stringify(mrkObj));
          return itemPointCandleStk;
        }
      } else if (stkType === 'index') {
        mrkObj = this.mrkIndex_MsgMap.get(stk);
        if (mrkObj != null && mrkObj !== undefined) {
          itemPointCandleStk['c0'] = nowDt;
          // itemPointCandleStk['c6'] = (mrkObj['t3'] - mrkObj['t5']); // -- Open Price
          itemPointCandleStk['c6'] = (this.activeCode === '075') ? (mrkObj['t3'] - mrkObj['t5']) : mrkObj['U27']; // -- Open Price
          itemPointCandleStk['c5'] = mrkObj['t24'] || (mrkObj['t3'] - mrkObj['t5']); // -- hight Price (giá đặt mua tốt nhất)
          itemPointCandleStk['c4'] = mrkObj['t25'] || (mrkObj['t3'] - mrkObj['t5']); // -- Low Price (giá đặt bán tốt nhất)
          itemPointCandleStk['c7'] = mrkObj['t26'] || (mrkObj['t3'] - mrkObj['t5']); // -- Close Price
          itemPointCandleStk['c8'] = mrkObj['t7'] || 0;
          return itemPointCandleStk;
        }
      }
      return null;
    };

    this.convData2TradFormat = (dataArrS) => {
      // -- sort lại time
      const dataArr = dataArrS.sort(function (a, b) { return (a['c0'] > b['c0']) ? 1 : ((b['c0'] > a['c0']) ? -1 : 0); });
      const objData = { 't': [], 'o': [], 'h': [], 'l': [], 'c': [], 'v': [], 's': 'no_data' };
      if (dataArr != null && dataArr !== undefined) {
        let i = 0, uTc = 0;
        for (i = 0; i < dataArr.length; i++) {
          uTc = Number(new Date()) / 1000;
          if (objData['t'].indexOf(uTc) < 0) {
            // console.log(uTc);
            objData['t'].push(uTc);
            objData['o'].push(Number(dataArr[i]['c6']));
            objData['h'].push(Number(dataArr[i]['c5']));
            objData['l'].push(Number(dataArr[i]['c4']));
            objData['c'].push(Number(dataArr[i]['c7']));
            objData['v'].push(Number(dataArr[i]['c8']));
          }
        }
        objData['s'] = 'ok';
      }
      // console.log('obj se them vao tradview', objData);
      return objData;
    };

    this.focusELM = (key) => {
      const elm = document.getElementById(key);
      if (elm) elm.focus();
    };

    this.getIndexChartSidebar = (key) => {
      const index = this[key + '_INDEX'];
      if (index == null) return {};
      const data = {};
      data.indexValue = index.indexValue;
      data.indexPercChang = index.indexPercChang;
      data.indexValueChang = index.indexValueChang;
      return data;
    };

    this.showLogin = () => {
      this.commonEvent.next({ type: this.OPEN_MODAL_LOGIN, data: 'notify_required_login' });
    }

    this.checkToast = (toast, type, message, toastId) => {
      if (toast.isActive(toastId)) {
        return;
      }
      toast[type](message, { toastId });
    };

    this.dateToChartTimeMinute = (date) => {
      return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0) / 1000;
    };
    this.convertUTCDateToLocalDate = (date) => {
      var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    
      var offset = date.getTimezoneOffset() / 60;
      var hours = date.getHours();
    
      newDate.setHours(hours + offset);
    
      return newDate;
    }
  }
}
const theInstance = new globalService();
export default theInstance;
