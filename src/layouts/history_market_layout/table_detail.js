import React, { useEffect, useState } from "react";
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import uniqueId from 'lodash/uniqueId';
import commuChanel from '../../constants/commChanel'
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import socket_sv from '../../utils/globalSv/service/socket_service'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import { getUniqueListBy } from '../../utils/utils_func'
import functionList from "../../constants/functionList";
import { update_value_for_glb_sv } from "../../utils/update_value_for_glb_sv";
import glb_sv from '../../utils/globalSv/service/global_service';

const TableDetail = ({ tableType, ...props }) => {

    const { component, get_value_from_glb_sv_seq, get_rq_seq_comp, req_component } = props
    const { index, indexNum, time_ChartData } = props

    const getMktInfo_SymbolInfo_FunctNm = 'getMktInfo_SymbolInfo_FunctNm';

    let tempObj = {}
    const [dataList, setDataList] = useState([]);
    useEffect(() => {
        const sq = get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: component, value: 'dataHisMrktop', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
            getMktInfo_SymbolInfo(index);
        })

    }, [component, time_ChartData, index]);

    const getMktInfo_SymbolInfo = (stk) => {
        // -- call service for place order
        const request_seq_comp = get_rq_seq_comp()
        // -- push request to request hashmap
        let reqInfo = new requestInfo();
        let svInputPrm = new serviceInputPrm();

        reqInfo.reqFunct = getMktInfo_SymbolInfo_FunctNm;
        reqInfo.component = component;
        reqInfo.receiveFunct = handle_getMktInfo_MKInfo;
        reqInfo.inputParam = svInputPrm.InVal;

        // -- service info
        svInputPrm.WorkerName = 'ALTqMktInfo01';
        svInputPrm.ServiceName = 'ALTqMktInfo01_SymbolInfo';
        svInputPrm.ClientSentTime = '0';
        svInputPrm.Operation = 'Q';
        svInputPrm.InVal = ['1', stk];
        svInputPrm.TotInVal = svInputPrm.InVal.length;
        tempObj.getSymbolInfo_ReqTimeOut = setTimeout(functSolveTimeOut,
        functionList.reqTimeout, request_seq_comp);
        // make request
        req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm
        })
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

    let tempData = [];
    const handle_getMktInfo_MKInfo = (reqInfoMap, message) => {
        
        clearTimeout(tempObj['getMktInfo_MktInfo_ReqTimeOut' + tableType.type]);
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return;
        }
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2;
            reqInfoMap.resSucc = false;
            if (message['Code'] !== '080128') { 
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger','', '', false, this.component)
            }
            return;
        } else 
        {
            reqInfoMap.procStat = 1;
            let jsondata;
            try {
                jsondata = JSON.parse(message['Data']);
            } catch (err) {
                jsondata = [];
            }
            tempData = tempData.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                const sq = get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: component, value: 'dataHisMrktop', sq: sq })
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
                    reqInfoMap.procStat = 2;
                    tempData = getUniqueListBy(tempData.concat(jsondata), 'c1')
                    setDataList(tempData)
                    if (index === 'HSXIndex') {
                        agrs[time_ChartData].dataKLGD_HSX = dataList.slice();
                        update_value_for_glb_sv({component: component, key: 'dataHisMrktop', value: agrs})
                    }
                    if (index === 'HNXIndex') {
                        agrs[time_ChartData].dataKLGD_HNX = dataList.slice();
                        update_value_for_glb_sv({component: component, key: 'dataHisMrktop', value: agrs})
                    }
                    if (index === 'HNXUpcomIndex') {
                        agrs[time_ChartData].dataKLGD_UPC = dataList.slice();
                        update_value_for_glb_sv({component: component, key: 'dataHisMrktop', value: agrs})
                    }
                    if (typeof (Storage) !== 'undefined') {
                        localStorage.setItem('dataHisMrktop', JSON.stringify(agrs));
                    }
                })
                
            }
        }
        
    }

    const { t } = props;
    return (
        <table className="tableNormal table table-sm tablenowrap table-bordered table-striped">
            <thead className="header">
                <tr>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('time')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('common_bottom')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('common_top')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('common_change')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('priceboard_total_qtty_trading')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('priceboard_total_value_trading')}{' '}({t('billion')})
                        </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('common_average_tradVol')}
                    </th>
                </tr>
            </thead>
            <tbody>
                {dataList.map(item =>
                    <tr key={uniqueId('dataDetails')}>
                        <td className="text-center" style={{ verticalAlign: 'middle' }}>
                            {item.c1}
                        </td>
                        <td className="text-right" style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(item.c2, 2, 0)}
                        </td>
                        <td className="text-right" style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(item.c4, 2, 0)}
                        </td>
                        <td className={"text-right " + (Number(item.c9) > 0 ? 'price_basic_over' : (Number(item.c9) < 0 ? 'price_basic_less' : ''))} style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(Math.round(Number(item.c9) * 100) / 100, 2, 0)}%
                            </td>
                        <td className="text-right" style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(item.c6, 0, 0)}
                        </td>
                        <td className="text-right" style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(Math.round(Number(item.c7) * 1000) / 1000, 3, 0)}
                        </td>
                        <td className="text-right" style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(item.c8, 0, 0)}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export default TableDetail