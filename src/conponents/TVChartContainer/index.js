import React, { PureComponent } from 'react'
// import { UDFCompatibleDatafeed } from '../datafeeds/lib/udf-compatible-datafeed'
// import { widget } from '../../charting_library/charting_library.min.js';
import { widget } from '../charting_library/charting_library.min.js'
import glb_sv from '../../utils/globalSv/service/global_service'
import socket_sv from '../../utils/globalSv/service/socket_service'
glb_sv.tradingViewData = {}
glb_sv.tradingViewDoneGetData = false
glb_sv.tradingViewFirstRq = false

class TradingViewContainer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            load: false,
        }
        this.styleTV = { width: '100%', position: 'relative', overflow: 'auto', height: 'calc(100% - 85px)' };
    }

    componentDidMount() {
        const stk = sessionStorage.getItem('stkNm')
        const lang = sessionStorage.getItem('lang')
        if (glb_sv.finishGetImsg) {
            setTimeout(() => {
                this.createTradView(stk, lang)
                sessionStorage.clear('stkNm')
                sessionStorage.clear('lang')
            }, 0)

            if (glb_sv.tradingViewPage) {
                const elm = document.getElementById('tv_chart_container')
                elm.style.height = 'calc(100vh - 10px)'
            }
        }
    }

    createTradView(stk, lang) {
        if (glb_sv.tradingView === undefined) {
            if (glb_sv.TradingviewDatafeed === undefined) {
                // glb_sv.TradingviewDatafeed = new UDFCompatibleDatafeed(glb_sv, socket_sv, 'http://altisss.vn');
                glb_sv.TradingviewDatafeed = new UDFCompatibleDatafeed(glb_sv, socket_sv, socket_sv.domain)
            }
            let currLangugage = 'vi'
            if (lang === 'EN') {
                currLangugage = 'en'
            } else if (lang === 'CN' || lang === 'ZH') {
                currLangugage = 'zh'
            } else if (lang === 'KO') {
                currLangugage = 'ko'
            }
            const widgetOptions = {
                autosize: true,
                symbol: stk || 'AAA',
                interval: 'D',
                container_id: 'tv_chart_container',
                datafeed: glb_sv.TradingviewDatafeed,
                library_path: '/charting_library/',
                theme: glb_sv.themePage === 'dark-theme' || glb_sv.themePage === 'dark-theme-china' ? 'Dark' : 'Light',
                // "toolbar_bg": glb_sv.configInfo['style'].color_brand,
                style: '1',
                hide_side_toolbar: false,
                timezone: 'exchange',
                locale: currLangugage,
                padding: 0,
                // "studies": [
                // 	"Volume@tv-basicstudies"
                // ],
                // "hidevolume": true,
                studies: ['Volume@tv-basicstudies'],
                disabled_features: ['create_volume_indicator_by_default'],
                overrides: {
                    'paneProperties.background':
                        glb_sv.themePage === 'dark-theme' || glb_sv.themePage === 'dark-theme-china'
                            ? '#1C172F'
                            : '#F5F5F5',
                },
                studies_overrides: {
                    // "volume.volume.color.0": "rgb(235, 77, 92)",
                    // "volume.volume.color.1": "rgb(83, 185, 135)",
                    // "volume.volume.boder": "rgb(0,0,0)",
                    // "volume.volume.color.0": "#00FFFF",
                    // "volume.volume.color.1": "#0000FF",
                    // "volume.volume.transparency": 70,
                    // "volume.show ma": true,
                    // "bollinger bands.median.color": "#33FF88",
                    // "bollinger bands.upper.linewidth": 7
                },
                //----------- Đường dẫn lưu thông tin chart -------
                charts_storage_url: socket_sv.domain + '/tradingview',
                client_id: 'webtrading',
                user_id: 'userweb',
                charts_storage_api_version: '1.1.0',
                //-------------------------------------------------
            }
            if (glb_sv.tradingView === undefined) {
                glb_sv.tradingView = new widget(widgetOptions)
                glb_sv.tradingView.onChartReady(() => {
                    // const button = glb_sv.tradingView.createButton()
                    // 	.attr('title', 'Click to show a notification popup')
                    // 	.addClass('apply-common-tooltip')
                    // 	.on('click', () => glb_sv.tradingView.showNoticeDialog({
                    // 		title: 'Notification',
                    // 		body: 'TradingView Charting Library API works correctly',
                    // 		callback: () => {
                    // 			console.log('Noticed!');
                    // 		},
                    // 	}));
                    // console.log(glb_sv.tradingView.chart());
                    // button[0].innerHTML = 'Check API';
                    glb_sv.tradingView.chart().createStudy('Moving Average Exponential', false, false, [5])
                    glb_sv.tradingView.chart().createStudy('Moving Average Exponential', false, false, [20])
                    // glb_sv.tradingView.chart().createStudy('Moving Average Exponential', false, false, [60]);
                    // glb_sv.tradingView.chart().createStudy('Moving Average Exponential', false, false, [120]);
                    // glb_sv.tradingView.chart().createStudy('Moving Average Exponential', false, false, [240]);
                    glb_sv.tradingView.chart().createStudy('Volume')
                    // glb_sv.tradingView.chart().createStudy('MACD');

                    const iframe = document.getElementById('tv_chart_container').childNodes[0]
                    if (iframe) {
                        const styles = `
							body.chart-page {
								margin-top: 5px !important;
								margin-left: 5px !important;
							}
							html.theme-light .group-wWM3zP_M- {
								background-color: #FDFDFD !important;
							}
							html.theme-light .group-2JyOhh7Z- {
								background-color: #FDFDFD !important;
							}
							html.theme-light .chart-controls-bar {
								background-color: #FDFDFD;
							}

							html.theme-dark .group-wWM3zP_M- {
								background-color: #080024 !important;
							}
							html.theme-dark .group-2JyOhh7Z- {
								background-color: #080024 !important;
							}
							html.theme-dark .chart-controls-bar {
								background-color: #080024;
							}
						`

                        const styleSheet = document.createElement('style')
                        styleSheet.type = 'text/css'
                        styleSheet.innerText = styles
                        iframe.contentWindow.document.head.appendChild(styleSheet)
                    }
                })
            }
        }
    }

    componentWillUnmount() {
        glb_sv.TradingviewDatafeed = undefined
        glb_sv.tradingView = undefined
        if (this.subcr_openStkInfo) this.subcr_openStkInfo.unsubscribe()
        if (this.subr_evencommon) this.subr_evencommon.unsubscribe()
    }

    render() {
        return (
            <div id="tv_chart_container" st className="TVChartContainer fix" style={this.styleTV} />
        )
    }
}
export default TradingViewContainer;