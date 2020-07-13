import React from 'react';
import { translate } from 'react-i18next';
import { createChart } from 'lightweight-charts';
import FormatNumber from '../formatNumber/FormatNumber';

class CandleChart extends React.Component {
    constructor(props) {
        super(props);
        this.component = this.props.component;
        this.languageChart = 'vi-VN';
        if (props.language === 'EN') this.languageChart = 'en-US';
        if (props.language === 'CN') this.languageChart = 'zh-CN';
        if (props.language === 'KO') this.languageChart = 'ko-KR';
        if (props.language === 'JA') this.languageChart = 'ja-JP';
    }

    componentDidMount() {
        const width = this.props.width;
        const height = this.props.height;
        console.log("CandleChart -> componentDidMount -> height", height,width)
        const id = this.props.keyIndex ? this.props.keyIndex + this.component + "candle_chart" : this.component + "candle_chart";
        const chart = createChart(id, {
            width,
            height,
            layout: {
                fontFamily: 'Arial',
            },
            priceScale: {
                scaleMargins: {
                    top: 0.35,
                    bottom: 0.2,
                },
                borderVisible: false,
            },
            timeScale: {
                borderVisible: false,
            },
            crosshair: {
                horzLine: {
                    visible: false,
                    labelVisible: false
                },
                vertLine: {
                    visible: true,
                    style: 0,
                    width: 2,
                    color: 'rgba(32, 38, 46, 0.1)',
                    labelVisible: false,
                }
            },
            localization: {
                locale: this.languageChart
            },
            layout: this.props.themePage === 'dark-theme' ? {
                backgroundColor: '#131722',
                textColor: '#d1d4dc',
            } : {},
            grid: this.props.themePage === 'dark-theme' ? {
                vertLines: {
                    color: 'rgba(42, 46, 57, 0)',
                },
                horzLines: {
                    color: 'rgba(42, 46, 57, 0.6)',
                },
            } : {}
        });

        const chartElement = document.getElementById(id);

        const areaSeries = chart.addCandlestickSeries();

        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            lineWidth: 2,
            priceFormat: {
                type: 'volume',
            },
            overlay: true,
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });


        const toolTip = document.createElement('div');
        toolTip.className = 'three-line-legend';
        chartElement.appendChild(toolTip);
        toolTip.style.display = 'block';
        toolTip.style.left = 3 + 'px';
        toolTip.style.top = 3 + 'px';

        areaSeries.setData(this.props.DATA_LINE);
        volumeSeries.setData(this.props.DATA_VOLUME);


        chart.subscribeCrosshairMove(function (param) {
            if (param === undefined || param.time === undefined || param.point.x < 0 || param.point.x > width || param.point.y < 0 || param.point.y > height) {
            } else {
                const dateStr = param.time.day + ' - ' + param.time.month + ' - ' + param.time.year;
                var ohlc = param.seriesPrices.get(areaSeries);
                var volume = param.seriesPrices.get(volumeSeries);
                if (!ohlc || !ohlc.open.toFixed(0) || !ohlc.high.toFixed(0) || !ohlc.low.toFixed(0) || !ohlc.close.toFixed(0)) return;
                if (!volume) return;
                toolTip.innerHTML = '<div style="font-size: 14px; margin: 4px 0px; width: 305px"> O: ' + ohlc.open.toFixed(0).toLocaleString() + '  H: ' + ohlc.high.toFixed(0).toLocaleString() + ' L: ' + ohlc.low.toFixed(0).toLocaleString() + ' C: ' + ohlc.close.toFixed(0).toLocaleString() + '</div><div>V: ' + volume.toLocaleString() + '</div> <div>' + dateStr + '</div>';
            }
        });
        chart.applyOptions({ 
            width, 
            height,
            localization: {
                locale: this.languageChart,
                priceFormatter: function(price) { return FormatNumber(price) },
            },
        });
        chart.timeScale().fitContent();
    }

    render() {
        if (this.props.DATA_LINE.length === 0) {
            return <div></div>
        }
        return (
            <div id={this.props.keyIndex ? this.props.keyIndex + this.component + "candle_chart" : this.component + "candle_chart"} />
        )
    }

}
export default translate('translations')(CandleChart);
