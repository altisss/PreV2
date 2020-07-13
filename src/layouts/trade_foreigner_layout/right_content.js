import React from 'react'
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
        heightTable,
    } = props
    return (
        <div className="card stockInfoExtent" style={{ boxShadow: 'unset', marginBottom: 0, marginTop: 0 }}>
            <div className="card-header">
                {isShowShare && time_ChartData === '1D' && t('top_50_value_room')}
                {isShowShare && time_ChartData !== '1D' && t('top_100_value_room')}
                {!isShowShare && time_ChartData === '1D' && t('top_50_stocks_room')}
                {!isShowShare && time_ChartData !== '1D' && t('top_100_stocks_room')}
                {'  '}
                <i
                    style={{ float: 'right', cursor: 'pointer' }}
                    onClick={handleChangeTop}
                    title={isShowShare ? 'Chuyển qua top GTGD' : 'Chuyển qua top KLGD'}
                    className="fa fa-exchange"
                ></i>
            </div>
            <PerfectScrollbar>
                <div
                    className="card-body widget-body"
                    id="table-room-market"
                    style={{ padding: '0', position: 'relative', maxHeight: 580 }}
                >
                    <Table
                        t={t}
                        dataTable={renderState.dataCurrentTable}
                        component={component}
                        get_value_from_glb_sv_seq={get_value_from_glb_sv_seq}
                    />
                </div>
            </PerfectScrollbar>
        </div>
    )
}

export default RightContent
