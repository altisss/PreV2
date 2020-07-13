import React, { useEffect, useState } from "react";
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import NumberFormat from 'react-number-format';
import glb_sv from '../../utils/globalSv/service/global_service';
import uniqueId from 'lodash/uniqueId';
import commuChanel from '../../constants/commChanel'
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import socket_sv from '../../utils/globalSv/service/socket_service'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import { getUniqueListBy } from '../../utils/utils_func'
import {getMsgObjectByMsgKey} from '../../utils/get_msg_obj_by_msg_key'
import { inform_broadcast } from "../../utils/broadcast_service"
import functionList from "../../constants/functionList";

const TableHistoryIndex = ({ tableType, ...props }) => {

    const { component, get_value_from_glb_sv_seq, get_rq_seq_comp, req_component, request_seq_comp } = props
    const { index, indexNum, time_ChartData } = props

    // console.log("Bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    const getMktInfo_MktInfo_FunctNm = 'getMktInfo_MktInfo_FunctNm';
    let temp = {}
    const [dataList, setDataList] = useState([]);
    useEffect(() => {
        const sq = get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: component, value: 'dataHisMrktop', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
            getMktInfo_MktInfo(indexNum, time_ChartData, tableType.type);
        })
        // console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", component);

    }, [component, time_ChartData, indexNum]);

    const send2stkinfo = (stk) => {
        const sq= get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
            const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
            let data, stkCd = 'HNX_' + stk;
            // let mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd);
            let mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST);
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            stkCd = 'HSX_' + stk;
            mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST);
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            stkCd = 'UPC_' + stk;
            mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST);
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            if (data === null) return;
            let msg = { type: commuChanel.STOCK_INFO_TAB, data };
            // glb_sv.commonEvent.next(msg);
            inform_broadcast(glb_sv.STOCK_INFO_TAB, msg)
    
            msg = { type: glb_sv.misTypeChgStock, data , component: component};
            setTimeout(() => inform_broadcast(commuChanel.misTypeChgStock, msg), 500);
        })
        
    }

    const getColor = (value) => {
        if (value < 0) return 'price_basic_less';
        else if (value > 0) return 'price_basic_over';
        else if (value === 0) return 'price_basic_color';

    }
    let tempData = [];

    const getMktInfo_MktInfo = (index, time, type) => {
        // -- push request to request hashmap
        let reqInfo = new requestInfo();
        let svInputPrm = new serviceInputPrm();
        const request_seq_comp = get_rq_seq_comp()
        
        // console.log("IN TABLE", { type, reqInfo });
        // -- service info
        reqInfo.reqFunct = getMktInfo_MktInfo_FunctNm + type;
        reqInfo.component = component;
        reqInfo.receiveFunct = handle_getMktInfo_MKInfo;
        reqInfo.inputParam = svInputPrm.InVal;
        
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
        svInputPrm.WorkerName = 'ALTqMktInfo01';
        svInputPrm.ServiceName = 'ALTqMktInfo01_MktInfo';
        svInputPrm.ClientSentTime = '0';
        svInputPrm.Operation = 'Q';
        svInputPrm.InVal = ['1', index, time, type, '-1'];
        svInputPrm.TotInVal = svInputPrm.InVal.length;
        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
        tempData = []
        temp['getMktInfo_MktInfo_ReqTimeOut' + type] = setTimeout(functSolveTimeOut,
        functionList.reqTimeout, request_seq_comp);

        req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm
        })

        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    }

    const functSolveTimeOut = (cltSeq) => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
        // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
        const reqIfMap = req_component.get(cltSeq);
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
        const timeResult = new Date();
        reqIfMap.resTime = timeResult;
        reqIfMap.procStat = 4;
    }

    

    const handle_getMktInfo_MKInfo = (reqInfoMap, message) => {
        const sq= get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: component, value: 'dataHisMrktop', sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
            clearTimeout(temp['getMktInfo_MktInfo_ReqTimeOut' + tableType.type]);
            if (Number(message['Result']) === 0) {
                reqInfoMap.procStat = 2;
                reqInfoMap.resSucc = false;
                if (message['Code'] !== '080128') { 
                    glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
                }
                return;
            } else {
                reqInfoMap.procStat = 1;
                let jsondata;
                try {
                    jsondata = JSON.parse(message['Data']);
                } catch (err) {
                    // glb_sv.logMessage(err);
                    jsondata = [];
                }
                tempData = tempData.concat(jsondata)
                // console.log(jsondata)
                if (Number(message['Packet']) <= 0) {
                    reqInfoMap.procStat = 2;
                    // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
                    // console.log('TV', data);
                    tempData = getUniqueListBy(tempData.concat(jsondata), 'c3')
                    setDataList(tempData)
                    if (index === 'HSXIndex') agrs[time_ChartData].dataKLGD_HSX = dataList.slice();
                    if (index === 'HNXIndex') agrs[time_ChartData].dataKLGD_HNX = dataList.slice();
                    if (index === 'HNXUpcomIndex') agrs[time_ChartData].dataKLGD_UPC = dataList.slice();
                    if (typeof (Storage) !== 'undefined') {
                        localStorage.setItem('dataHisMrktop', JSON.stringify(agrs));
                    }
                }
            }
        })
        
    }

    const { t, name_col_last } = props;
    return (
        <table className="tableNormal table_sticky table table-sm tablenowrap table-bordered table-striped">
            <thead className="header">
                <tr>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('common_index')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('stock_symbol_short')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        + / -
                        </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('common_bottom')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('common_top')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t(name_col_last)}{' '}{name_col_last === 'priceboard_total_value_trading' ? '(' + t('billion') + ')' : ''}
                    </th>

                </tr>
            </thead>
            <tbody>
                {dataList.map((item, index) =>
                    <tr key={uniqueId('history-index')} className="cursor_ponter" onClick={() => send2stkinfo(item.c3)}>
                        <td className="text-center" style={{ whiteSpace: 'nowrap' }} style={{ verticalAlign: 'middle' }}>
                            {index + 1}
                        </td>
                        <td className="text-center fix cursor_ponter" style={{ verticalAlign: 'middle' }}>
                            <span className={getColor(Number(item.c11))}>{item.c3}</span>
                        </td>
                        <td className="text-right fix cursor_ponter" style={{ verticalAlign: 'middle' }}>
                            <span className={getColor(Number(item.c11))}>
                                {(item.c11 === null || item.c11 === undefined) ? '0.00' : (<>
                                    {FormatNumber(item['c11'] * 100, 2, 0)} <>%</> </>)}
                            </span>
                        </td>
                        <td className="text-right" style={{ verticalAlign: 'middle' }}>
                            <span>
                                {item.c4 === undefined || item.c4 === 0 ? null : (
                                    <NumberFormat value={item.c4 * 1000} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={false} prefix={''} />
                                )}
                            </span>
                        </td>
                        <td className="text-right " style={{ verticalAlign: 'middle' }}>
                            <span>
                                {item.c6 === undefined || item.c6 === 0 ? null : (
                                    <NumberFormat value={item.c6 * 1000} className="cursor_ponter" displayType={'text'} thousandSeparator={true} decimalScale={0} fixedDecimalScale={false} prefix={''} />
                                )}
                            </span>
                        </td>
                        <td className="text-right cursor_ponter" style={{ verticalAlign: 'middle' }}>
                            <span>
                                {name_col_last === 'priceboard_total_qtty_trading'
                                    ? FormatNumber(item['c8'])
                                    : FormatNumber(item['c9'], 0, 0)}
                            </span>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export default TableHistoryIndex