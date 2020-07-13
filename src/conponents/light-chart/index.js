import React from 'react';
import { translate } from 'react-i18next';
import { createChart } from 'lightweight-charts';
import FormatNumber from '../formatNumber/FormatNumber';

class LightChart extends React.Component {
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
    const id = this.props.keyIndex ? this.props.keyIndex + this.component + "light_chart" : this.component + "light_chart";
    const chart = createChart(id, {
      width: 320,
      height: 300,
      layout: {
        fontFamily: 'Arial',
      },
      priceScale: {
        borderColor: 'rgba(197, 203, 206, 1)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 1)',
        timeVisible: true,
        secondsVisible: true,
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

    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(33, 150, 243, 0.56)',
      bottomColor: 'rgba(33, 150, 243, 0.04)',
      lineColor: 'rgba(33, 150, 243, 1)',
      lineWidth: 1,
    });


    // var lineMA5 = chart.addLineSeries({
    //   color: '${LINE_MA5}',
    //   lineWidth: 1,
    //   lastValueVisible: false,
    //   priceLineVisible: false
    // });
    // var lineMA10 = chart.addLineSeries({
    //   color: '${LINE_MA10}',
    //   lineWidth: 1,
    //   lastValueVisible: false,
    //   priceLineVisible: false
    // });
    // var lineMA20 = chart.addLineSeries({
    //   color: '${LINE_MA20}',
    //   lineWidth: 1,
    //   lastValueVisible: false,
    //   priceLineVisible: false
    // });
    // var lineMA30 = chart.addLineSeries({
    //   color: '${LINE_MA30}',
    //   lineWidth: 1,
    //   lastValueVisible: false,
    //   priceLineVisible: false
    // });

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
    areaSeries.setData(this.props.DATA_LINE);
    volumeSeries.setData(this.props.DATA_VOLUME);

    // lineMA5.setData(DATA_SMA5);
    // lineMA10.setData(DATA_SMA10);
    // lineMA20.setData(DATA_SMA20);
    // lineMA30.setData(DATA_SMA30);

    chart.applyOptions({
      width: this.props.width,
      height: this.props.height,
      localization: {
        locale: this.languageChart,
        priceFormatter: function (price) { return FormatNumber(price) },
      },
    });
    // chart.subscribeVisibleTimeRangeChange(function(e) {
    //   window.ReactNativeWebView.postMessage(JSON.stringify(e));
    // });
    chart.timeScale().fitContent();
  }

  render() {
    return (
      <div id={this.props.keyIndex ? this.props.keyIndex + this.component + "light_chart" : this.component + "light_chart"} />
    )
  }

}
export default translate('translations')(LightChart);
