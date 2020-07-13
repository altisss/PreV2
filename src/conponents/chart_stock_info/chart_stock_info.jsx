import React from 'react';
// import Chart from '../Chart/Chart';
import socket_sv from '../../utils/globalSv/service/socket_service';
import glb_sv from '../../utils/globalSv/service/global_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import commuChanel from '../../constants/commChanel'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import { getUniqueListBy } from '../../utils/utils_func';
import CandleChart from '../light-chart/CandleChart';
import moment from 'moment';

export default class ChartComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			dataStock_line: [],
			dataStock_line: [],
			dataStock_volume: []
		}
		this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
		this.component = this.props.component
		this.getChartData = 'getChartData-ChartComponent';
		this.req_component = this.props.req_component
		this.get_rq_seq_comp = this.props.get_rq_seq_comp
	}


	componentDidMount() {
		if (this.props.stkType === 'INDEX' && this.props.curStk && this.props.time) {
			const sq = this.get_value_from_glb_sv_seq()
			window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'dataHisMrktop', sq: sq })
			window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
				if (agrs[this.props.time] && (agrs[this.props.time][this.props.curStk] == null ||
					agrs[this.props.time][this.props.curStk].length === 0)
				) {
					this.sendRequestGetChartData(this.props.curStk, this.props.stkType, this.props.time);
				} else {
					const dataStock_line = agrs[this.props.time][this.props.curStk];
					if (dataStock_line == null) {
						return;
					}

				}
			})

		}
	}

	componentWillReceiveProps(nextProps) {
		// console.log(nextProps,this.state);
		const sq = this.props.get_value_from_glb_sv_seq()
		window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'dataHisMrktop', sq: sq })
		window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
			if (nextProps.curStk !== this.state.curStk || nextProps.time !== this.state.time || nextProps.stkType !== this.state.stkType) {
				this.setState({ curStk: nextProps.curStk, time: nextProps.time, stkType: nextProps.stkType })
				if (nextProps.stkType === 'INDEX') {
					if (agrs[nextProps.time] && (agrs[nextProps.time][nextProps.curStk] == null ||
						agrs[nextProps.time][nextProps.curStk].length === 0
					)) {
						this.sendRequestGetChartData(nextProps.curStk, nextProps.stkType, nextProps.time);
					} else {
						const dataStock_line = agrs[nextProps.time][nextProps.curStk];
						dataStock_line.forEach(item => {
							item.date = new Date(item.date);
						})
						this.setState({ dataStock_line });
					}
				} else this.sendRequestGetChartData(nextProps.curStk, nextProps.stkType, nextProps.time);
			}
		})

	}

	sendRequestGetChartData(stkCd, stkType, date) {
		if (stkCd == null || stkType == null || date == null) return;
		const reqInfo = new requestInfo();
		reqInfo.reqFunct = this.getChartData;
		const request_seq_comp = this.get_rq_seq_comp()
		reqInfo.component = this.component;
		reqInfo.receiveFunct = this.handle_sendRequestGetChartData;
		// -- push request to request hashmap
		let svInputPrm = new serviceInputPrm();
		svInputPrm.WorkerName = 'ALTqMktInfo';
		svInputPrm.ServiceName = 'ALTqMktInfo_ChartServiceOnline';
		svInputPrm.ClientSentTime = '0';
		svInputPrm.Operation = 'Q';
		if (stkType === 'INDEX') {
			svInputPrm.InVal = ['CandleStick', 'INDEX', 'DAILY', stkCd, date];
		} else {
			svInputPrm.InVal = ['CandleStick', 'STOCK_CODE', 'DAILY', stkCd, date];
		}
		svInputPrm.TotInVal = svInputPrm.InVal.length;
		reqInfo.inputParam = svInputPrm.InVal;
		this.req_component.set(request_seq_comp, reqInfo)
		this.setState({ dataStock_line: [] });
		this.dataStock_line = [];
		this.ChartDataTmp = [];
		window.ipcRenderer.send(commuChanel.send_req, {
			req_component: {
				component: reqInfo.component,
				request_seq_comp: request_seq_comp,
				channel: socket_sv.key_ClientReq
			},
			svInputPrm: svInputPrm
		})
	}

	handle_sendRequestGetChartData = (reqInfoMap, message) => {
		if (reqInfoMap.procStat !== 2) {
			// -- process after get result --
			if (Number(message['Result']) === 0) {
				reqInfoMap.procStat = 2;
				reqInfoMap.resSucc = false;
			} else {
				reqInfoMap.procStat = 1;
				let jsondata;
				try {
					jsondata = JSON.parse(message['Data']);
					this.ChartDataTmp = getUniqueListBy(this.ChartDataTmp.concat(jsondata), 'c0')
					if (Number(message['Packet']) <= 0) {
						reqInfoMap.procStat = 2;
						this.dataStock_line = this.ChartDataTmp;
                        console.log("handle_sendRequestGetChartData -> this.dataStock_line", this.dataStock_line)
						if (!this.dataStock_line.length) {
							this.setState({ dataStock_line: [] })
						} else {

							if (this.props.stkType === 'INDEX') {
								const sq = this.get_value_from_glb_sv_seq()
								window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'dataHisMrktop', sq: sq })
								window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
									const dataStock_line = this.dataStock_line.map(item => {
										const obj = {};
										const timeStamp = moment(item.c0, 'YYYYMMDD').format('YYYY-MM-DD')
										obj.time = timeStamp;
										obj.high = Number(item.c5);
										obj.close = Number(item.c7);
										obj.low = Number(item.c4);
										obj.open = Number(item.c6);
										obj.volume = Number(item.c8);
										return obj;
									});
									const dataStock_volume = this.dataStock_line.map(item => {
										const obj = {};
										const timeStamp = moment(item.c0, 'YYYYMMDD').format('YYYY-MM-DD')
										obj.time = timeStamp;
										obj.value = Number(item.c8);
										return obj;
									});
									this.setState({ dataStock_line, dataStock_volume });
									agrs[this.props.time][this.props.curStk] = dataStock_line;
									update_value_for_glb_sv({ component: this.component, key: 'dataHisMrktop', value: agrs })
									if (typeof (Storage) !== 'undefined') {
										localStorage.setItem('dataHisMrktop', JSON.stringify(agrs));
									}
								})

							} else {
								const dataStock_line = this.dataStock_line.map(item => {
									const obj = {};
									const timeStamp = moment(item.c0, 'YYYYMMDD').format('YYYY-MM-DD')
									obj.time = timeStamp;
									obj.high = Number(item.c5);
									obj.close = Number(item.c7);
									obj.low = Number(item.c4);
									obj.open = Number(item.c6);
									obj.volume = Number(item.c8);
									return obj;
								});
								const dataStock_volume = this.dataStock_line.map(item => {
									const obj = {};
									const timeStamp = moment(item.c0, 'YYYYMMDD').format('YYYY-MM-DD')
									obj.time = timeStamp;
									obj.value = Number(item.c8);
									return obj;
								});
								if (dataStock_line && (dataStock_line.length === 1 || dataStock_line.length === 0)) {
									this.setState({ dataStock_line: [], dataStock_volume: [] });
								} else this.setState({ dataStock_line, dataStock_volume });
							}
						}
					}
				} catch (err) {
					jsondata = [];
					this.setState({ dataStock_line: [], dataStock_volume: [] });
				}
			}
		}

	}



	convertTime(strTime) {
		const y = Number(strTime.substr(0, 4));
		const m = Number(strTime.substr(4, 2)) - 1;
		const d = Number(strTime.substr(6, 2));
		return new Date(y, m, d);
	}

	render() {
		if (this.state.dataStock_line === 'no_data') {
			return <div>{this.props.t('common_NoDataFound')}</div>
		}
		if (!this.state.dataStock_line || this.state.dataStock_line.length === 0) {
			return <div></div>
		}
		return (
			<CandleChart
				language={this.props.language}
				themePage={this.props.themePage}
				DATA_LINE={this.state.dataStock_line}
				DATA_VOLUME={this.state.dataStock_volume}
				component={this.component}
				width={this.props.width}
				height={this.props.height} />
		)
	}
}

