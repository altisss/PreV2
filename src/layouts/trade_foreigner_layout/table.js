import React from "react";
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import uniqueId from 'lodash/uniqueId';
import {getMsgObjectByMsgKey} from '../../utils/get_msg_obj_by_msg_key'
import {inform_broadcast} from '../../utils/broadcast_service'
import commuChanel from '../../constants/commChanel'

const TableHistoryIndex = (props) => {
    const {component, get_value_from_glb_sv_seq, dataTable = [] } = props


    const getColorPrice = (value, item) =>  {
        if (item.REF) {
            if (item.FL && item.REF && value > 0 && value > item.FL && value < item.REF) return 'price_basic_less';
            else if (value > 0 && value < item.CE && value > item.REF) return 'price_basic_over';
            else if (value === 0 || value === 0.0 || value === item.REF) return 'price_basic_color';
            else if (value > 0 && value === item.CE) return 'price_ceil_color';
            else if (value > 0 && value === item.FL) return 'price_floor_color';
        } else {
            return Number(item.ChgRatio) > 0 ? 'price_basic_over' : (Number(item.ChgRatio) < 0 ? 'price_basic_less' : 'price_basic_color');
        }
    }

    const send2stkinfo = (stk) => {
        const sq= get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
            const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')

            let data, stkCd = 'HNX_' + stk;
            let mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            stkCd = 'HSX_' + stk;
            mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
            stkCd = 'UPC_' + stk;
            mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            if (mrkObj != null && mrkObj !== undefined) {
                data = mrkObj;
            }
    
            let msg = { type: commuChanel.STOCK_INFO_TAB, data, component: component };
            inform_broadcast(commuChanel.STOCK_INFO_TAB, msg)

            msg = { type: commuChanel.misTypeChgStock, data, component: component };
            setTimeout(() => inform_broadcast(commuChanel.misTypeChgStock, msg), 500);
        })
        
    }

    const { t } = props;

    return (
        <table className="tableNormal table_sticky table table-sm tablenowrap table-bordered table-striped">
            <thead className="header">
                <tr>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('stock_symbol_short')}
                    </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        +/-
                        </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('priceboard_total_value_trading')}{' '}{t('priceboard_buy')}({t('billion')})
                        </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('priceboard_total_value_trading')}{' '}{t('priceboard_sell')}({t('billion')})
                        </th>
                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                        {t('trade_total_net_value')}
                    </th>
                </tr>
            </thead>
            <tbody>
                {dataTable.map((item, index) =>
                    <tr key={uniqueId('dataDetails')} className='cursor_ponter' onClick={() => send2stkinfo(item.StkCd)}>
                        <td className={"text-center " + (getColorPrice(item.CurrPri, item))} style={{ verticalAlign: 'middle' }}>
                            {item.StkCd}
                        </td>
                        <td className={"text-right " + (getColorPrice(item.CurrPri, item))} style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(Number(item.ChgRatio), 2, 0)}%
                          </td>
                        <td className={"text-right "} style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(Number(item.FBA), 2, 0)}
                        </td>
                        <td className="text-right" style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(Number(item.FSA), 2, 0)}
                        </td>
                        <td className="text-right" style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(Number(item.FBA) - Number(item.FSA), 2, 0)}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export default TableHistoryIndex