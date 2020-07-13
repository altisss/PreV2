import React from 'react'
import { translate } from 'react-i18next'
import BubbleComponent from './bubble_component'
import BarComponent from './bar_component'

function LeftContent(props) {
    const { t, handleChangeIndex, handleChangeTime, handleShowMeanGraph, time_ChartData, isShowShare } = props
    const { renderState = {} } = props

    return (
        <>
            <div className="">
                <select className="form-control-custom" onChange={handleChangeIndex}>
                    <option value="HSX">VNI</option>
                    <option value="HNX">HNX</option>
                    <option value="UPC">UPCOM</option>
                </select>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span
                    onClick={() => handleChangeTime('1D')}
                    className={'time_chart ' + (time_ChartData === '1D' ? 'active' : '')}
                >
                    {t('common_daily')}
                </span>
                &nbsp;&nbsp;
                <span
                    onClick={() => handleChangeTime('1W')}
                    className={'time_chart ' + (time_ChartData === '1W' ? 'active' : '')}
                >
                    1W
                </span>
                &nbsp;&nbsp;
                <span
                    onClick={() => handleChangeTime('1M')}
                    className={'time_chart ' + (time_ChartData === '1M' ? 'active' : '')}
                >
                    1M
                </span>
                &nbsp;&nbsp;
                <span
                    onClick={() => handleChangeTime('3M')}
                    className={'time_chart ' + (time_ChartData === '3M' ? 'active' : '')}
                >
                    3M
                </span>
                &nbsp;&nbsp;
                <span
                    onClick={() => handleChangeTime('6M')}
                    className={'time_chart ' + (time_ChartData === '6M' ? 'active' : '')}
                >
                    6M
                </span>
                &nbsp;&nbsp;
                <span
                    onClick={() => handleChangeTime('1Y')}
                    className={'time_chart ' + (time_ChartData === '1Y' ? 'active' : '')}
                >
                    1Y
                </span>
                &nbsp;&nbsp;
                <span
                    onClick={() => handleChangeTime('3Y')}
                    className={'time_chart ' + (time_ChartData === '3Y' ? 'active' : '')}
                >
                    3Y
                </span>
                &nbsp;&nbsp;
                <span
                    onClick={() => handleChangeTime('5Y')}
                    className={'time_chart ' + (time_ChartData === '5Y' ? 'active' : '')}
                >
                    5Y
                </span>
                &nbsp;&nbsp;
                <span onClick={handleShowMeanGraph} className="cursor_ponter">
                    <i className="fa fa-info-circle"></i> {t('meaning_graph')}
                </span>
                &nbsp;&nbsp;
            </div>
            <div className="row" style={{ margin: 0, marginTop: 5, height: 250 }}>
                <BubbleComponent t={t} bubbleState={renderState.bubbleStateData} />
            </div>
            <div className="row" style={{ margin: 0, marginTop: 5, height: 350 }}>
                <BarComponent t={t} barState={renderState.barStateData} />
            </div>
        </>
    )
}

export default translate('translations')(LeftContent)
