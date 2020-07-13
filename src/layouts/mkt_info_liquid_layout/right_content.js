import React from 'react'
import { translate } from 'react-i18next'
import Table from './table'
import PerfectScrollbar from 'react-perfect-scrollbar'

function RightContent(props) {
    const {
        component,
        get_value_from_glb_sv_seq,
        t,
        renderState = {},
        handleChangeTop,
        time_ChartData,
        isShowShare,
    } = props
    return (
        <div className="card stockInfoExtent" style={{ boxShadow: 'unset', marginBottom: 0, marginTop: 0 }}>
            <div className="card-header">
                {!isShowShare && time_ChartData === '1D' && t('top_50_stocks_shares_trade')}
                {isShowShare && time_ChartData === '1D' && t('top_50_stocks_value_trade')}
                {!isShowShare && time_ChartData !== '1D' && t('top_100_stocks_shares_trade')}
                {isShowShare && time_ChartData !== '1D' && t('top_100_stocks_value_trade')}
                {'  '}
                <i
                    style={{ float: 'right', cursor: 'pointer' }}
                    onClick={() => handleChangeTop()}
                    title={isShowShare ? 'Chuyển qua top GTGD' : 'Chuyển qua top KLGD'}
                    className="fa fa-exchange"
                ></i>
            </div>
            <PerfectScrollbar>
                <div className="card-body widget-body" style={{ padding: '0', position: 'relative', maxHeight: 580 }}>
                    <Table
                        t={t}
                        name_col_last="priceboard_total_qtty_trading"
                        dataTable={renderState.dataCurrentTable}
                        component={component}
                        get_value_from_glb_sv_seq={get_value_from_glb_sv_seq}
                    />
                </div>
            </PerfectScrollbar>
        </div>
    )
}

export default translate('translations')(RightContent)
