
export default {
    /* APP.JS CHANNEL */
    disable: 'disable', // sends disable onclick event for the corresponding button in menubar 
    enable: 'enable', // sends enable onclick event for the corresponding button in menubar
    open_OVERVIEW_MARKET_TAB_layout: 'open_OVERVIEW_MARKET_TAB_layout', //sends open_OVERVIEW_MARKET_TAB_layout event from another component.
    open_layout_from_component: 'open_layout_from_component',

    readConfigInfo: 'readConfigInfo', // reads the config whenever loaded main page
    
    active_component: 'active_component', // send opened layout to main page
    active_component_close: 'active_component_close', // send closed layout to main page
    
    done_read_config: 'done_read_config', // send broadcast whenever finished reading config 
    active_tab: 'active_tab',// check if the tab is active or not. if active layout will move focus directly to the tab

    open_main_window: 'open_main_window',
    open_config_info: 'open_config_info',

/***********************************************************************************************************************************************************************************/

    /* BROADCAST CHANNEL SERVICE */
    RESET_CONTAINER: 'RESET_CONTAINER',
    Inform_Broadcast: 'Inform_Broadcast',
    Inform_stkTradEvent_Broadcast: 'Inform_stkTradEvent_Broadcast',
    stkTradEvent: 'stkTradEvent',
    Send_stkTradEvent_Broadcast: 'Send_stkTradEvent_Broadcast',
    Send_Broadcast: 'Send_Broadcast',
    GET_NEW_FVL: 'GET_NEW_FVL',
    OPEN_MODAL_AddModFav: 'OPEN_MODAL_AddModFav',
    CHANGE_THEME: 'CHANGE_THEME', //Broadcast// Service change theme for app. 
    CHANGE_LANG: 'CHANGE_LANG',//Broadcast// Service change language for app. 
    CHANG_INDEX: 'CHANG_INDEX', //Broadcast// Service change index for app. 
    STK_FROM_MENU: 'STK_FROM_MENU', //Broadcast// Service change stk name for app. 
    getStockListChangeLang: 'getStockListChangeLang', //Broadcast// Service change language of StockList for app. 
    ORDER: 'ORDER',
    NOTIFY: 'NOTIFY',
    TRY_CONNECT: 'TRY_CONNECT',
    CLOSE_MODAL_MESSAGE: 'CLOSE_MODAL_MESSAGE',
    CLEAR_NOTIFY_TOP: 'CLEAR_NOTIFY_TOP',
    CHANGE_ACT: 'CHANGE_ACT',
    ACTION_SUCCESS: 'ACTION_SUCCESS',
    ESC_KEY: 'ESC_KEY',
    CONNECT_SV_SUCCESS: 'CONNECT_SV_SUCCESS',
    misTypeChgStock: 'misTypeChgStock',
    STOCK_INFO_TAB: 'STOCK_INFO_TAB',
    misTypeTradvStock: 'misTypeTradvStock',
    MOVE_STK2FIRST_PRTABLE: 'MOVE_STK2FIRST_PRTABLE',
    misTypeReconect: 'misTypeReconect',
    UPDATE_FVL: 'UPDATE_FVL',
    CHANGE_HEIGHT_PRICEBOARD: 'CHANGE_HEIGHT_PRICEBOARD',
    PUT_THROUGH_TAB: 'PUT_THROUGH_TAB',
    REFOCUS_SELECT_STK: 'REFOCUS_SELECT_STK',
    SHOW_ALERT_MODAL: 'SHOW_ALERT_MODAL',
    OPEN_MODAL_LOGIN: 'OPEN_MODAL_LOGIN',
    MARKET_INDEX_TAB: 'MARKET_INDEX_TAB',
    ACTION_SUCCUSS: 'ACTION_SUCCUSS',
    REGET_RECOMMAND: 'REGET_RECOMMAND',
    UPDATE_GRP_FVL: 'UPDATE_GRP_FVL',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    CLOSE_SIDEBAR: 'CLOSE_SIDEBAR',
    OPEN_MODAL_NEWS: 'OPEN_MODAL_NEWS',
    LOGOUT:'LOGOUT',
    EXPIRE_SESSION: 'EXPIRE_SESSION',
    misTypeSuccsOtp: 'misTypeSuccsOtp',
    SYNCE_ACCOUNT: 'SYNCE_ACCOUNT',
    FLAG_SYNCE_ACCOUNT: 'FLAG_SYNCE_ACCOUNT',
    SYNCE_ACCOUNT_BROKER: 'SYNCE_ACCOUNT_BROKER',
    PLACE_ORDER: 'PLACE_ORDER',
    OPEN_OTP: 'OPEN_OTP',
    AFTER_OTP: 'AFTER_OTP',
    misTypeGetOtp: 'misTypeGetOtp',
    CLOSE_MODAL_OTP: 'CLOSE_MODAL_OTP',
    FLAG_SYNCE_STK: 'FLAG_SYNCE_STK',
    CHANGE_STK: 'CHANGE_STK',
    RESET_CHART_INTRADAY: 'RESET_CHART_INTRADAY',
/***********************************************************************************************************************************************************************************/

    /* SERVER CHANNEL */
    event_SysMsg: 'event_SysMsg',
    event_NotifyRcv: 'event_NotifyRcv',
    event_FinishGetMrkInfo: 'event_FinishGetMrkInfo',
    mrkInfoEvent: 'mrkInfoEvent',
    event_ToastCommonInfo: 'event_ToastCommonInfo',
    event_ClientReqMRKRcv: 'event_ClientReqMRKRcv',
    event_ServerPushMRKRcvChangeEpMsg: 'event_ServerPushMRKRcvChangeEpMsg',
    event_ServerPushIndexChart: 'event_ServerPushIndexChart',// main page sends received info from event_ServerPushIndexChart on server to corresponding component
    event_ClientReqRcv: 'event_ClientReqRcv',
/***********************************************************************************************************************************************************************************/

    /* SUBCRIBE CHANNEL */
    on_subcribeIndex: 'on_subcribeIndex',
    on_subcribeIndexList:'on_subcribeIndexList',
    on_subcribeIndexAll:'on_subcribeIndexAll',
    on_subcribeListCont: 'on_subcribeListCont',
    on_subcribeOneStkFVLt: 'on_subcribeOneStkFVLt',
    on_unSubcribeFVL: 'on_unSubcribeFVL',
    on_unSubStkList: 'on_unSubStkList',
    on_unsubcribeIndex: 'on_unsubcribeIndex',
    on_subcribeMrk: 'on_subcribeMrk',
    on_unsubcribeMrk: 'on_unsubcribeMrk',

/***********************************************************************************************************************************************************************************/

    /* PRIVATE CHANNEL SERVICE */
    get_value_from_glb_sv: 'get_value_from_glb_sv', // component sends request to App for getting global variable from glv_sv
    reply_get_value_from_glb_sv: 'reply_get_value_from_glb_sv', // App replys the request get_value_from_glb_sv
    update_value_for_glb_sv: 'update_value_for_glb_sv',
    get_glb_sv: 'get_glb_sv',
    reply_get_glb_sv: 'reply_get_glb_sv',
    get_socket_sv: 'get_socket_sv',
    reply_get_socket_sv: 'reply_get_socket_sv',
    get_socket_n_glb_sv: 'get_socket_n_glb_sv',
    reply_get_socket_n_glb_sv: 'reply_get_socket_n_glb_sv',

    SubMarketInfor: 'SubMarketInfor', // send node and key for table-priceboard.

    reply_send_req: 'reply_send_req', // main page sends received info from server to corresponding component
    send_req: 'send_req', // the component sends request to server through main page
    reply_send_event_FinishSunbcribeFunct: 'reply_send_event_FinishSunbcribeFunct',// main page sends received info from event_FinishSunbcribeFunct on server to corresponding component

    bf_popout: 'bf_popout', // main page gets infor before popout the component to a windows
    update_state_bf_popout: 'update_state_bf_popout', // component sends info to mainpage before popout to a new windows
    popout: 'popout', // open new windows
    update_state_af_popout: 'update_state_af_popout',  // update state after popout for the component in a new windows
    
    bf_popin_window: 'bf_popin_window', // sends a message to activate the event popin_window
    popin_window: 'popin_window', // popin the curent windows back to main page


  };
  