import React from 'react'
import _ from "lodash";
import MenuBarLayout from "./menu_bar_layout/menu_bar_layout.js"
import FlexLayout from '../conponents/flexbox'
import '../assets/style/dark.css'

import { Actions, DockLocation, TabSetNode } from '../conponents/flexbox'
//------------------------------
import layout_config from '../utils/config_layout/basic_config.json'
import ws01 from '../utils/config_layout/ws01.json'
import ws02 from '../utils/config_layout/ws02.json'
import ws03 from '../utils/config_layout/ws03.json'
import ws04 from '../utils/config_layout/ws04.json'
//------------------------------
import Menu from '../assets/data/menu.json'
import MapComponent from './map_component/map_component'
import OVERVIEW_MARKET_TAB from './over_view_market_layout/overview_market_layout'
import HISTORY_MARKET_TAB from './history_market_layout/history_market_layout'
import LIQUID_MARKET_TAB from './mkt_info_liquid_layout/market_liquidity'
import TRADE_FOREIGNER_TAB from './trade_foreigner_layout/trade_foreigner_layout'
import OwnForgeinerTab from './own_foreiger_tab/own_foreiger_tab'
import ADVERTIS_ORDER from './advertis_order_layout/advertis_order_layout'
import RightInfo from './right_info_layout/right_info_layout'
import MarketInfor from './market_infor_layout/market_infor_layout'
import StockInfoLayout from './stock_info_layout/stock_info_layout'
import BankConnection from './bank_connection_layout/bank_connection'
import RepayMargin from './repay_margin_layout/repay-margin'
import ExtendContractMargin from './extencontract_margin_layout/extencontract-margin'
import CashinAdvance from './cashin_advance_layout/cashin_advance'
import InternalCashTransfer from './cash_transfer_layout/cash-transfer'
import DepositInform from './deposit-inform-layout/deposit-inform'
import CashWithdraw from './withdraw-regist-layout/withdraw-regist'
import AddOrder from './add_oder_layout/add_oder_layout'
import ASSET_MANAGE_TAB from './asset-manage-layout/asset-manage'
import ASSET_MARGIN_TAB from './asset-margin-layout/asset-margin'
import TRANSACTION_INFO_TAB from './transaction-info-layout/transaction-info';
import ConfirmOrder from './confirm-order/confirm-order'
import RightForBuy from './right-forBuy/right-forBuy'
import OddLotOrder from './oddlot-order/oddlot-order'
import RegisterEmailSms from './register_email_sms/register-email-sms'
import InternalShareTransferComponent from './internal-share-transfer/internal_share_transfer_component';
import TVChartContainer from '../conponents/TVChartContainer/index_chart_info_layout';
import { translate, Trans } from 'react-i18next';

import glb_sv from '../utils/globalSv/service/global_service'
import socket_sv from '../utils/globalSv/service/socket_service'
import { requestInfo } from '../utils/globalSv/models/requestInfo'
import components from '../constants/components'
import commuChanel from '../constants/commChanel'
import { get_tab_set_id, add_tab_to_tabset, active_tab_or_layout } from '../utils/tab_set_layout'
import { on_add_layout } from '../utils/add_layout'
import { update_state_bf_popout } from '../utils/bf_popout'
import { send_req } from '../utils/send_req';

import {
	BrowserRouter as Router,
	Route,
} from "react-router-dom";
import { send_broadcast, send_stkTradEvent_broadcast, inform_broadcast } from '../utils/broadcast_service.js';
import {
	subcribeIndex, subcribeIndexList, subcribeIndexAll,
	subcribeListCont, subcribeOneStkFVL,
	unSubcribeFVL, unSubStkList, unsubcribeIndex, subcribeMrk, unsubcribeMrk
} from '../utils/subcrible_functions.js';

import MenubarChildDown from '../layouts/menu_bar_layout/menu_bar_child_down/menu_bar_child_down'
import { reply_get_glb_sv, reply_get_socket_sv, reply_get_socket_n_glb_sv } from '../utils/get_glb_or_socket_sv.js';
import { showLogin } from '../utils/show_login.js';
import { ToastContainer, toast } from "react-toastify";
import AdvanceOrder from "./advance-order/advance-order";
import BackgroundMessage from './background-message';
import FormatNumber from '../conponents/formatNumber/FormatNumber'
import { GlobalHotKeys } from "react-hotkeys";
import "react-toastify/dist/ReactToastify.css";

function getModel() {
	console.log("App -> workspace :", JSON.parse(localStorage.getItem('workspace')));
	let MODEL;
	switch (localStorage.getItem('workspace')) {
		case null:
			return MODEL = ws03;
		default:
			return MODEL = JSON.parse(localStorage.getItem('workspace'));
	}
}

let keyMap = {
	OPEN_ORDERBOOK: "Shift+" + glb_sv.shortKeyOrderBook, // open order book
	OPEN_PLCORDER: "Shift+" + glb_sv.shortKeyOrder, // open order place
	REFESH_F5: "F5", // open order place'
	ESC_KEY: "Esc"
};

class App extends React.PureComponent {

	constructor(props) {
		super(props);
		glb_sv.themePage = localStorage.getItem('themePage');
        console.log("App -> constructor -> glb_sv.themePage", glb_sv.themePage)
		const body = document.getElementsByTagName("body");
		body[0].classList.add(glb_sv.themePage);
		//
		this.state = {
			model: FlexLayout.Model.fromJson(layout_config),
			layouts: Menu.map(menu => (
				menu.subMenu.map(submenu => {
					return {
						layout: submenu.routerLink,
					}
				})
			)),

			keyMapState: keyMap,
			handlersShortKey: {
				OPEN_ORDERBOOK: event => {
					// open
					const msg = {
						type: glb_sv.ACTION_SUCCUSS,
						data: "order-list"
					};
					// glb_sv.commonEvent.next(msg);
					inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
				},
				OPEN_PLCORDER: event => {
					if (!glb_sv.authFlag) {
						glb_sv.showLogin();
						return;
					}
					const msg = { type: glb_sv.PLACE_ORDER };
					// glb_sv.commonEvent.next(msg);
					inform_broadcast(commuChanel.PLACE_ORDER, msg)
				},
				REFESH_F5: event => {
					if (glb_sv.authFlag) {
						event.preventDefault();
						const msg = {};
						msg["type"] = glb_sv.LOGOUT;
						msg["data"] = "";
						// glb_sv.commonEvent.next(msg);
						inform_broadcast(commuChanel.LOGOUT, msg)
					}
				},
				ESC_KEY: event => {
					console.log("App -> ESC_KEY", event)
					const idModal = document.getElementById('modalSystem')
					const modalOTP3 = document.getElementById('modalOTP3')
					const modalOTP = document.getElementById('modalOTP')
					if (idModal) {
						const msg = { type: commuChanel.CLOSE_MODAL_MESSAGE }
						inform_broadcast(commuChanel.CLOSE_MODAL_MESSAGE, msg)
						return
					} else if (modalOTP || modalOTP3) {
						const msg = { type: commuChanel.CLOSE_MODAL_OTP }
						glb_sv.commonEvent.next(msg)
						// inform_broadcast(commuChanel.CLOSE_MODAL_OTP, msg)
						return
					}

					const msg = { type: glb_sv.ESC_KEY };
					inform_broadcast(commuChanel.ESC_KEY, msg)
				}
			}
		};
		this.subcr_ClientReqRcv = {}
		this.getSvTime_ReqTimeOut = {}
		this.active_components = []
		this.count_get_value_from_glb_sv_seq = 0;
		this.get_value_from_glb_sv_seq = () => {
			return ++this.count_get_value_from_glb_sv_seq
		};


	}

	componentDidMount() {
		glb_sv.flagProcessPopout = true;
		Notification.requestPermission().then(res => {
			if (res !== 'denied') glb_sv.permissNotify = true;
			else glb_sv.permissNotify = false;
		}).catch(err => {
			glb_sv.permissNotify = false;
		});
		this.active_components.push('BackgroundMessage', 'Config_layout');
		// load_tradview_stk_list(glb_sv, socket_sv)
		window.ipcRenderer.on(commuChanel.CHANGE_LANG + '_MenuBarLayout', (event, args) => {
			const layout = this.contents().props.model._idMap
			const { t } = this.props
			// console.log(layout)
			Object.values(layout).map(item => {
				console.log(item)
				if (item._attributes.type === 'tab') {
					const component = item.getComponent()
					const onpopout = (component) => {
						window.ipcRenderer.send(commuChanel.bf_popout, component)
					}

					const name = <span key={item.getName().key}> {t(`${item.getName().key}`)} &nbsp; <i onMouseDown={onpopout.bind(this, component)} className="fa fa-rocket" aria-hidden="true"></i></span>
					item.getModel().doAction(Actions.renameTab(item.getId(), name))
				}
			})

		})


		window.ipcRenderer.on(commuChanel.update_state_bf_popout, (event, args) => {
			update_state_bf_popout(this.state.model, args)
		})

		window.ipcRenderer.on(commuChanel.active_component, (event, args) => {
			this.active_components.push(args)
		})

		window.ipcRenderer.on(commuChanel.active_component_close, (event, args) => {
			this.active_components.splice(this.active_components.indexOf(args), 1)
		})

		window.ipcRenderer.on(commuChanel.get_value_from_glb_sv, (event, args) => {
			const sq = args.sq
			const component = args.component
			if (typeof args.value === 'string') {
				const value = glb_sv[args.value]
				window.ipcRenderer.send(commuChanel.reply_get_value_from_glb_sv, { component: component, value: value, sq: sq })
			}
			else {
				const values = new Map()
				for (let i = 0; i < args.value.length; i++) {
					values.set(args.value[i], glb_sv[args.value[i]])
				}
				// console.log(values, args.value)
				window.ipcRenderer.send(commuChanel.reply_get_value_from_glb_sv, { component: component, value: values, sq: sq })
			}

		})

		window.ipcRenderer.on(commuChanel.update_value_for_glb_sv, (event, args) => {

			if (typeof args.key === 'string') {
				if (args.func) {
					glb_sv[args.key].args['func'](args.value)
				} else glb_sv[args.key] = args.value
			} else if (args.key.length === 2) {
				glb_sv[args.key[0]][args.key[1]] = args.value
			}
			console.log('createTradView', glb_sv.TradingviewDatafeed)
		})

		window.ipcRenderer.on(commuChanel.get_glb_sv, (event, args) => {
			reply_get_glb_sv(glb_sv, args.component, args.sq)
		})

		window.ipcRenderer.on(commuChanel.get_socket_sv, (event, args) => {
			reply_get_socket_sv(socket_sv, args.component, args.sq)
		})

		window.ipcRenderer.on(commuChanel.get_socket_n_glb_sv, (event, args) => {
			reply_get_socket_n_glb_sv(glb_sv, socket_sv, args.component, args.sq)
		})

		window.ipcRenderer.on(commuChanel.popin_window, (event, args) => {
			this.active_components.push(args.component)
			const tab_set_id = get_tab_set_id(this.state.model._idMap, args.state.parent_id)
			const { t } = this.props
			add_tab_to_tabset(this.refs.layout, tab_set_id, args, t)
		})

		window.ipcRenderer.on(commuChanel.active_tab, (event, args) => {
			active_tab_or_layout(this.state.model, args)
		})

		glb_sv.event_ServerPushMRKRcvChangeEpMsg.subscribe(message => {
			inform_broadcast(commuChanel.event_ServerPushMRKRcvChangeEpMsg, message)
		})

		glb_sv.event_FinishSunbcribeFunct.subscribe(message => {
			if (!message) return;
			const agrs = message.split('__')
			window.ipcRenderer.send(commuChanel.reply_send_event_FinishSunbcribeFunct, { component: agrs[1], value: agrs[0] })

		})

		glb_sv.event_ServerPushIndexChart.subscribe(message => {
			// if (message.includes('VN')) {
			// 	console.log(message)
			// }
			inform_broadcast(commuChanel.event_ServerPushIndexChart, message)
		})

		glb_sv.event_FinishGetMrkInfo.subscribe(message => {
			// console.log(message, 'event_FinishGetMrkInfo')
			const reqInfoMap = glb_sv.getReqInfoMapValue(message)
			inform_broadcast(commuChanel.event_FinishGetMrkInfo, { message, reqInfoMap })
		})

		this.commonEvent = glb_sv.commonEvent.subscribe(msg => {
			if (msg.type === glb_sv.CHANGE_CONFIG_INFO) {
				keyMap = {
					OPEN_ORDERBOOK: "Shift+" + glb_sv.shortKeyOrderBook, // open order book
					OPEN_PLCORDER: "Shift+" + glb_sv.shortKeyOrder, // open order place
					REFESH_F5: "F5", // open order place'
					ESC_KEY: "Esc"
				};
				this.setState({
					keyMapState: keyMap,
					handlersShortKey: {
						OPEN_ORDERBOOK: event => {
							// open --------------
							const obj = {
								type: glb_sv.ACTION_SUCCUSS,
								data: "order-list"
							};
							glb_sv.commonEvent.next(obj);
						},
						OPEN_PLCORDER: event => {

							const msg = { type: glb_sv.PLACE_ORDER };
							inform_broadcast(commuChanel.PLACE_ORDER, msg)
						},
						REFESH_F5: event => {
							if (glb_sv.authFlag) {
								event.preventDefault();
								const message = {};
								message["type"] = glb_sv.LOGOUT;
								message["data"] = "";
								glb_sv.commonEvent.next(message);
							}
						},
						ESC_KEY: event => {

							const idModal = document.getElementById('modalSystem')
							const modalOTP3 = document.getElementById('modalOTP3')
							const modalOTP = document.getElementById('modalOTP')
							if (idModal) {
								const msg = { type: commuChanel.CLOSE_MODAL_MESSAGE }
								inform_broadcast(commuChanel.CLOSE_MODAL_MESSAGE, msg)
								return
							} else if (modalOTP || modalOTP3) {
								const msg = { type: commuChanel.CLOSE_MODAL_OTP }
								inform_broadcast(commuChanel.CLOSE_MODAL_OTP, msg)
								return
							}
							const msg = { type: commuChanel.ESC_KEY };
							inform_broadcast(commuChanel.ESC_KEY, msg)
						}
					}
				});
			}
			else {
				inform_broadcast(msg.type, msg)
			}
		})

		glb_sv.mrkInfoEvent.subscribe(msgObject => {
			inform_broadcast(commuChanel.mrkInfoEvent, msgObject)
		})

		glb_sv.event_ToastCommonInfo.subscribe(msgObject => {
			inform_broadcast(commuChanel.event_ToastCommonInfo, msgObject)
		})

		socket_sv.event_ClientReqRcv.subscribe(message => {
			// console.log("App -> event_ClientReqRcv", message)
			const cltSeqResult = Number(message['ClientSeq']);
			if (!cltSeqResult) return;
			const req_component = glb_sv.getReqInfoMapValue(cltSeqResult);
			console.log("App -> event_ClientReqRcv", req_component, this.active_components, message)
			if (!req_component) return;
			if (!this.active_components.includes(req_component.component)) return;
			window.ipcRenderer.send(commuChanel.reply_send_req, { cltSeqResult: cltSeqResult, message: message, req_component: req_component })
		});

		socket_sv.event_ClientReqMRKRcv.subscribe(message => {
			inform_broadcast(commuChanel.event_ClientReqMRKRcv, message)
		})

		socket_sv.event_NotifyRcv.subscribe(message => {
			inform_broadcast(commuChanel.event_NotifyRcv, message);

			const notifyTp = message['MsgTp']
			let jsonArr = []
			try {
				const temp = glb_sv.filterStrBfParse(message['Data'])
				jsonArr = JSON.parse(temp)
			} catch (error) {
				glb_sv.logMessage('Error when parse json the notify info: ' + error)
				return
			}
			this.process_NotifyInfoMsg(notifyTp, jsonArr)
		})

		socket_sv.event_SysMsg.subscribe(message => {
			inform_broadcast(commuChanel.event_SysMsg, message)
		})

		window.ipcRenderer.on(commuChanel.send_req, (event, args) => {
			send_req(args, socket_sv, glb_sv)
		})

		// window.ipcRenderer.on('xem list_indexs_chart', () => {
		// 	console.log(list_indexs_chart, list_indexs_chart_map)
		// })

		window.ipcRenderer.on(commuChanel.open_layout_from_component, (event, args) => {
        console.log("App -> componentDidMount -> args", args)
			this.onAddLayout(args.component, args.name, args.config)
		})

		/* subcribe index  */
		var list_subcribed_indexs = [] // stock code
		var subcribed_indexs_map = new Map() // map components with stock code


		var list_indexs_chart = [] // indexs chart
		var list_indexs_chart_map = new Map() // map components with indexs chart


		window.ipcRenderer.on(commuChanel.on_subcribeIndex, (event, args) => {
			this.handle_subcribe_index_chart(list_indexs_chart, list_indexs_chart_map, args, subcribeIndex)
		})

		window.ipcRenderer.on(commuChanel.on_subcribeIndexList, (event, args) => {
			this.handle_subcribe_index(list_subcribed_indexs, subcribed_indexs_map, args, subcribeIndexList)
		})

		window.ipcRenderer.on(commuChanel.on_subcribeIndexAll, (event, args) => {
			this.handle_subcribe_index(list_subcribed_indexs, subcribed_indexs_map, args, subcribeIndexAll)
		})

		window.ipcRenderer.on(commuChanel.on_subcribeListCont, (event, args) => {
			this.handle_subcribe_index(list_subcribed_indexs, subcribed_indexs_map, args, subcribeListCont)
		})

		window.ipcRenderer.on(commuChanel.on_subcribeOneStkFVLt, (event, args) => {
			this.handle_subcribe_index(list_subcribed_indexs, subcribed_indexs_map, args, subcribeOneStkFVL)
		})

		window.ipcRenderer.on(commuChanel.on_subcribeMrk, (event, args) => {
			subcribeMrk(glb_sv, socket_sv, args.component, args.reqFunct, args.msg)
		})


		/* end subcribe index  */

		/* unsubcribe index */

		window.ipcRenderer.on(commuChanel.on_unSubcribeFVL, (event, args) => {
			this.handle_unsubcribe_index(subcribed_indexs_map, args, list_subcribed_indexs, unSubcribeFVL)
		})

		window.ipcRenderer.on(commuChanel.on_unSubStkList, (event, args) => {
			const list_index_needed_unsubcribe = []
			for (let i = 0; i < list_subcribed_indexs.length; i++) {
				const list_components = subcribed_indexs_map.get(list_subcribed_indexs[i])
				if (list_components && list_components.components.includes(args.component)) {
					subcribed_indexs_map.get(list_subcribed_indexs[i]).components.splice(list_components.components.indexOf(args.component), 1)
				}

				if (list_components && subcribed_indexs_map.get(list_subcribed_indexs[i]).components.length === 0) {
					subcribed_indexs_map.delete(list_subcribed_indexs[i])
					list_index_needed_unsubcribe.push(list_subcribed_indexs[i])
				}
			}
			for (let i = 0; i < list_index_needed_unsubcribe.length; i++) {
				list_subcribed_indexs.splice(list_subcribed_indexs.indexOf(list_index_needed_unsubcribe[i]), 1)
			}

			if (list_index_needed_unsubcribe.length > 0) {
				if (!args.msg) unSubStkList(list_index_needed_unsubcribe, glb_sv, socket_sv, args.component)
				else if (args.msg) unSubStkList(list_index_needed_unsubcribe, glb_sv, socket_sv, args.component, args.msg)

			}
		})

		window.ipcRenderer.on(commuChanel.on_unsubcribeIndex, (event, args) => {
			if (args.arr.length > 0) {
				this.handle_unsubcribe_index_chart(list_indexs_chart_map, args, list_indexs_chart, unsubcribeIndex)
			}
			else {
				const list_index_chart_needed_unsubcribe = []
				for (let i = 0; i < list_indexs_chart.length; i++) {
					const list_components = list_indexs_chart_map.get(list_indexs_chart[i])
					if (list_components && list_components.components.includes(args.component)) {
						list_indexs_chart_map.get(list_indexs_chart[i]).components.splice(list_components.components.indexOf(args.component), 1)
					}

					if (list_components && list_indexs_chart_map.get(list_indexs_chart[i]).components.length === 0) {
						list_indexs_chart_map.delete(list_indexs_chart[i])
						list_index_chart_needed_unsubcribe.push(list_indexs_chart[i])
					}
				}
				for (let i = 0; i < list_index_chart_needed_unsubcribe.length; i++) {
					list_indexs_chart.splice(list_indexs_chart.indexOf(list_index_chart_needed_unsubcribe[i]), 1)
				}

				if (list_index_chart_needed_unsubcribe.length > 0) {
					unsubcribeIndex(list_index_chart_needed_unsubcribe, glb_sv, socket_sv, args.component)
				}
			}

		})

		window.ipcRenderer.on(commuChanel.on_unsubcribeMrk, (event, args) => {
			unsubcribeMrk(glb_sv, socket_sv, args.component, args.reqFunct, args.msg)
		})

		window.ipcRenderer.on(commuChanel.Inform_Broadcast, (event, args) => {
			// console.log(this.active_components)
			args['active_components'] = this.active_components
			send_broadcast(args)
		})

		window.ipcRenderer.on(commuChanel.Inform_stkTradEvent_Broadcast, (event, args) => {
			// console.log('send_broadcast',args)
			args['active_components'] = this.active_components
			send_stkTradEvent_broadcast(args)
		})

		if (!window.location.pathname.includes('___')) {
			this.readConfigInfo().then(resp => {
				glb_sv.logMessage('Start call readConfigInfo');
				// -- set liencient cho KH nếu có đăng ký chứng chỉ số:
				if (glb_sv.objShareGlb['verify'] > 0) {
					const LicenseKey = glb_sv.configInfo['bkvLicenseKey'];
					glb_sv.logMessage('before call BkavCAPlugin.SetLicenseKey whith LicenseKey:');
					glb_sv.logMessage(LicenseKey);
					// BkavCAPlugin.SetLicenseKey(LicenseKey);
				}
				// -- end set liencient
				glb_sv.logMessage('Finish call readConfigInfo');
				// load_tradview_stk_list(this.req_component, this.get_rq_seq_comp, '')

				window.ipcRenderer.send(commuChanel.done_read_config)
			});

			this.getStockListV2();
		}
		glb_sv.flagProcessPopout = false;

		//load workspace
		setTimeout(() => {
			this.onChangeWorkspace(getModel())
		}, 1000);
		//----------------------
	}

	fixModel = ( model, active_component, t ) => {
		const onpopout = (component) => {
			window.ipcRenderer.send(commuChanel.bf_popout, component)
		}
		const updateNode = (nodes, t) =>
			nodes.map(({ name, type, children, config, ...rest }) => (
				type === "tab" ? active_component.push(`${config.component}`) && {
					...rest,
					type: type,
					config: config,
					name: <span key={`${config.component.replace(/\d/g, "").toLowerCase()}`}> {t(`${config.component.replace(/\d/g, "").toLowerCase()}`)} &nbsp; <i onMouseDown={() => onpopout(config.component)} className={`${!config.component.includes('common_index_chart_info') && 'fa fa-rocket'}` } aria-hidden="true"></i></span>,
					...(children && { children: updateNode(children, t) }),
				} // .replace( /\[\d+\]/g, '');
				: {
					...rest,
					type: type,
					...(children && { children: updateNode(children, t) })
				}
			))
		let newModel = Object.assign({}, model);
		newModel.layout.children = updateNode(newModel.layout.children, t)
		console.log(updateNode(newModel.layout.children, t));	
		return newModel
	}

	componentWillUnmount() {
		if (this.commonEvent) this.commonEvent.unsubscribe();
	}

	handle_subcribe_index = (list_indexs, indexs_map, args, subcribe_func) => {
		const list_index_needed_subcribe = []
		// console.log(args.component)
		for (let i = 0; i < args.arr.length; i++) {
			if (!(list_indexs.includes(args.arr[i]))) {
				list_indexs.push(args.arr[i])
				list_index_needed_subcribe.push(args.arr[i])
				indexs_map.set(args.arr[i], { components: [args.component] })

			}
			else if (list_indexs.includes(args.arr[i])) {
				const list_components = indexs_map.get(args.arr[i])
				if (list_components && !(list_components.components.includes(args.component))) {
					indexs_map.get(args.arr[i]).components.push(args.component)
				}
			}
		}
		if (!args.reqFunct && !args.msg) subcribe_func(list_index_needed_subcribe, glb_sv, socket_sv, args.component)
		else if (args.reqFunct && !args.msg) subcribe_func(list_index_needed_subcribe, glb_sv, socket_sv, args.component, args.reqFunct)
		else if (args.reqFunct && args.msg) subcribe_func(list_index_needed_subcribe, glb_sv, socket_sv, args.component, args.reqFunct, args.msg)
		// subcribe_func(list_index_needed_subcribe, glb_sv, socket_sv, args.component)

	}

	handle_subcribe_index_chart = (list_indexs, indexs_map, args, subcribe_func) => {
		const list_index_needed_subcribe = []
		// console.log(args.component)
		for (let i = 0; i < args.arr.length; i++) {
			if (!(list_indexs.includes(args.arr[i]))) {
				list_indexs.push(args.arr[i])
				list_index_needed_subcribe.push(args.arr[i])
				indexs_map.set(args.arr[i], { components: [args.component] })

			}
			else if (list_indexs.includes(args.arr[i])) {
				const list_components = indexs_map.get(args.arr[i])
				if (list_components && !(list_components.components.includes(args.component))) {
					indexs_map.get(args.arr[i]).components.push(args.component)
				}
			}
		}
		// console.log(!args.reqFunct)
		if (!args.reqFunct) subcribe_func(list_index_needed_subcribe, glb_sv, socket_sv, args.component)
		else subcribe_func(list_index_needed_subcribe, glb_sv, socket_sv, args.component, args.reqFunct)

	}

	handle_unsubcribe_index = (indexs_map, args, list_indexs, unsub_func) => {
		const list_index_needed_unsubcribe = []
		for (let i = 0; i < args.arr.length; i++) {
			const list_components = indexs_map.get(args.arr[i])
			if (list_components && list_components.components.includes(args.component)) {
				indexs_map.get(args.arr[i]).components.splice(list_components.components.indexOf(args.component), 1)
				if (indexs_map.get(args.arr[i]).components.length === 0) {
					indexs_map.delete(args.arr[i])
					list_index_needed_unsubcribe.push(args.arr[i])
				}
			}
		}
		for (let i = 0; i < list_index_needed_unsubcribe.length; i++) {
			list_indexs.splice(list_indexs.indexOf(list_index_needed_unsubcribe[i]), 1)
		}
		if (list_index_needed_unsubcribe.length > 0) {
			unsub_func(list_index_needed_unsubcribe, glb_sv, socket_sv, args.component)
		}
		// console.log(indexs_map, 'subcribe_indexs_map')
	}

	handle_unsubcribe_index_chart = (indexs_map, args, list_indexs, unsub_func) => {
		const list_index_needed_unsubcribe = []
		for (let i = 0; i < args.arr.length; i++) {
			const list_components = indexs_map.get(args.arr[i])
			if (list_components && list_components.components.includes(args.component)) {
				indexs_map.get(args.arr[i]).components.splice(list_components.components.indexOf(args.component), 1)
				if (indexs_map.get(args.arr[i]).components.length === 0) {
					indexs_map.delete(args.arr[i])
					list_index_needed_unsubcribe.push(args.arr[i])
				}
			}
		}
		for (let i = 0; i < list_index_needed_unsubcribe.length; i++) {
			list_indexs.splice(list_indexs.indexOf(list_index_needed_unsubcribe[i]), 1)
		}
		if (list_index_needed_unsubcribe.length > 0) {
			unsub_func(list_index_needed_unsubcribe, glb_sv, socket_sv, args.component)
		}
	}

	readConfigInfo = async () => {
		await fetch('./assets/config.json', {
			mode: 'cors'
		})
			.then((r) => r.json())
			.then((resp) => {
				const activeCd = resp['active_code'];
				if (activeCd && resp[activeCd]) {
					glb_sv.activeCode = activeCd;
					glb_sv.publicFlag = resp[activeCd].public;

					const expTimeout = localStorage.getItem('expTimeoutLocal');
					if (!isNaN(expTimeout)) {
						this.expTimeout = Number(expTimeout);
						this.setState({ timeout: 1000 * 60 * glb_sv.expTimeout });
					} else if (!isNaN(resp[activeCd].expiretime)) {
						glb_sv.expTimeout = Number(resp[activeCd].expiretime);
						this.setState({ timeout: 1000 * 60 * glb_sv.expTimeout });
					}

					socket_sv.url_mkt_public = resp[activeCd].url_mkt_public;
					socket_sv.url_mkt = resp[activeCd].url_mkt;
					socket_sv.url_trading = resp[activeCd].url_trading;

					glb_sv.configInfo['favicon'] = '/assets/img/logo/' + resp[activeCd].favicon;
					if (activeCd === '888') glb_sv.configInfo['loginLogo'] = '/assets/img/logo/alt_login_logo.png';
					else glb_sv.configInfo['loginLogo'] = '/assets/img/logo/' + activeCd + '_login_logo.png';

					glb_sv.configInfo['title'] = resp[activeCd].webtitle;
					glb_sv.configInfo['navbarLogoLink'] = resp[activeCd].navbarLogoLink;
					glb_sv.configInfo['comp_nm'] = resp[activeCd].comp_nm;
					glb_sv.configInfo['comp_full'] = resp[activeCd].comp_full;
					glb_sv.configInfo['comp_full_e'] = resp[activeCd].comp_full_e;
					glb_sv.configInfo['comp_full_cn'] = resp[activeCd].comp_full_cn;
					glb_sv.configInfo['copyright'] = resp[activeCd].copyright;
					glb_sv.configInfo['copyright_e'] = resp[activeCd].copyright_e;
					glb_sv.configInfo['copyright_cn'] = resp[activeCd].copyright_cn;
					glb_sv.configInfo['isDebug'] = resp[activeCd].debug;
					glb_sv.configInfo['hotLine'] = resp[activeCd].hotLine;
					glb_sv.configInfo['hotLine_e'] = resp[activeCd].hotLine_e;
					glb_sv.configInfo['hotLine_cn'] = resp[activeCd].hotLine_cn;
					glb_sv.configInfo['hotLinePhone'] = resp[activeCd].hotLinePhone;
					glb_sv.configInfo['menu'] = resp['menu'][activeCd];
					glb_sv.configInfo['openLinkAndroid'] = resp[activeCd].openLinkAndroid;
					glb_sv.configInfo['storeLinkAndroid'] = resp[activeCd].storeLinkAndroid;
					glb_sv.configInfo['openLinkIos'] = resp[activeCd].openLinkIos;
					glb_sv.configInfo['storeLinkIos'] = resp[activeCd].storeLinkIos;
					glb_sv.configInfo['buy_stockplus'] = resp[activeCd].buy_stockplus;
					glb_sv.configInfo['stockplus_link'] = resp[activeCd].stockplus_link;
					glb_sv.configInfo['third_sign'] = resp[activeCd].third_sign;
					glb_sv.configInfo['riskdisclosure_link'] = resp[activeCd].riskdisclosure_link;
					glb_sv.configInfo['hnx_smindex'] =
						resp[activeCd].hnx_smindex === undefined ? true : resp[activeCd].hnx_smindex
					glb_sv.configInfo['hsx_smindex'] =
						resp[activeCd].hsx_smindex === undefined ? true : resp[activeCd].hsx_smindex
					//-- time expire sau khi hệ thống bị rớt mạng (nếu trong time này thì hệ thống tự relogin)
					glb_sv.discexpire = resp[activeCd].discexpire || 30;
					glb_sv.latencyTime = resp[activeCd].latencyTime || 100;
					glb_sv.userGuild = resp[activeCd].userGuild || false;
					let userGuild, userGuildLocal = localStorage.getItem('userGuild');
					if (userGuildLocal === null || userGuildLocal === undefined) userGuild = true;
					else userGuild = JSON.parse(userGuildLocal);
					if (glb_sv.userGuild) this.setState({ userGuild: userGuild });
					document.title = resp[activeCd].webtitle;
					socket_sv.domain = resp[activeCd].domain;
					socket_sv.domain_public = resp[activeCd].domain_public;
					socket_sv.url_Index = 0;
					glb_sv.logMessage('read config success');
					socket_sv.setNewConnectionPublic(socket_sv.url_Index);
				}
				if (activeCd && resp['menu'] && resp['menu'][activeCd]) {
					glb_sv.configInfo['menuConfig'] = resp['menu'][activeCd];
				}
				if (activeCd && resp['styleContainer'] && resp['styleContainer'][activeCd]) {
					glb_sv.configInfo['style'] = resp['styleContainer'][activeCd];
					if (glb_sv.configInfo['style'].sideBar_title.textShadow === '') {
						glb_sv.configInfo['style'].sideBar_title.textShadow = "#c55912";
						glb_sv.configInfo['style'].sideBar_title.boxShadow = "#e8851f";
					}
				} else {
					glb_sv.configInfo['style'] = {
						"topElmUp": {
							"backgroundColor": "",
							"color": " ",
							"colorHover": ""
						},
						"topElmDown": {
							"backgroundColor": "",
							"color": " ",
							"color_hover": ""
						},
						"sideBar": {
							"backgroundColor": "",
							"color": "",
							"colorHover": "",
							"backgroundColor_focus": ""
						},
						"sideBar_title": {
							"background": "",
							"color": "",
							"textShadow": "#c55912",
							"boxShadow": "#e8851f"
						},
						"modalHeader": {
							"backgroundColor": "",
							"color": " "
						},
						"modalSearch": {
							"backgroundColor": "",
							"color": " "
						},
						"modalData": {
							"backgroundColor": "",
							"color": " "
						},
						"modal": {
							"backgroundColor": ""
						}
					}
				}

			});
	}

	//-- Lấy danh sách mã CK hiện tại
	getStockList = () => {
		if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
			const ermsg = "Can_not_connected_to_server_plz_check_your_network";
			// glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '‘’', 'warning');
			glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '‘’', 'warning', '', '', '', this.component)
			glb_sv.logMessage(ermsg)
			return;
		}

		const clientSeq = socket_sv.getRqSeq();
		// -- push request to request hashmap
		let reqInfo = new requestInfo();
		// -- service info
		reqInfo = new requestInfo();
		reqInfo.reqFunct = glb_sv.getStk_list;
		reqInfo.procStat = 0;
		reqInfo.reqTime = new Date();
		glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
		const msgObj3 = { 'ClientSeq': clientSeq, 'Command': 'STKLIST' };
		socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj3));
		glb_sv.logMessage('send request to server: ' + JSON.stringify(msgObj3));
	}

	getStockListV2 = async () => {

	}

	contents = () => <FlexLayout.Layout ref="layout" model={this.state.model} factory={this.factory} />

	factory = (node) => {
		var component = node.getComponent();//
		// console.log("Node from factory: ", FlexLayout.Model.toJson());
		
		if (component.includes(components.OVERVIEW_MARKET_TAB)) {
			return <OVERVIEW_MARKET_TAB active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
				table={true}
			/>
		}
		else if (component.includes(components.HISTORY_MARKET_TAB)) {
			return <HISTORY_MARKET_TAB active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.LIQUID_MARKET_TAB)) {
			return <LIQUID_MARKET_TAB active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.TRADE_FOREIGNER_TAB)) {
			return <TRADE_FOREIGNER_TAB active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.OWN_FOREIGER_TAB)) {
			return <OwnForgeinerTab active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.ADVERTIS_ORDER)) {
			return <ADVERTIS_ORDER active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.RightInfo)) {
			return <RightInfo active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.bank_connection)) {
			return <BankConnection active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.extend_contract)) {
			return <ExtendContractMargin active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.repay_margin)) {
			return <RepayMargin active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.cashin_advance)) {
			return <CashinAdvance active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
				style={glb_sv.style}
			/>
		}
		else if (component.includes(components.cash_transfer)) {
			return <InternalCashTransfer active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.deposit_inform)) {
			return <DepositInform active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.cash_withdraw)) {
			return <CashWithdraw active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}


		else if (component.includes(components.MarketInfor)) {
			return <MarketInfor language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				name={node.getName().key}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.stock_info_layout)) {
			return <StockInfoLayout language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.AddOrder)) {
			return <AddOrder language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.asset_manage)) {
			return <ASSET_MANAGE_TAB language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.asset_margin)) {
			return <ASSET_MARGIN_TAB language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.transaction_info)) {
			return <TRANSACTION_INFO_TAB language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.AddOrder)) {
			return <AddOrder language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.advance_order)) {
			return <AdvanceOrder language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.oddlot_order)) {
			return <OddLotOrder language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}

		else if (component.includes(components.register_email_sms)) {
			return <RegisterEmailSms language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}

		else if (component.includes(components.stock_transfer)) {
			return <InternalShareTransferComponent active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				language={glb_sv.language}
				themePage={glb_sv.themePage}
				component={component}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.confirm_order)) {
			return <ConfirmOrder language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.right_forbuy)) {
			return <RightForBuy language={glb_sv.language}
				themePage={glb_sv.themePage}
				style={glb_sv.style}
				component={component}
				active_components={this.active_components}
				node={node}
				model={this.contents()}
				name={node.getName().key}
				get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
			/>
		}
		else if (component.includes(components.common_index_chart_info)) {
			return <TVChartContainer component={this.component} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} />
		}
	}

	onAddLayout = (component, name, content) => {
		const config = content.config || content;
		const { t } = this.props
		if ((config.index1 === 1 || config.index1 === 2 || config.index1 === 3 || config.index1 === 6 || component.includes(components.change_login) || component.includes(components.change_order)) && !glb_sv.activeAcnt) {
			window.ipcRenderer.send(commuChanel.enable, config)
			showLogin(component);
			return;
		}
		else if (component.includes(components.config_info)) {
			window.ipcRenderer.send(commuChanel.open_config_info)
		}
		else if (component.includes(components.change_order)) {
			inform_broadcast(commuChanel.OPEN_MODAL_LOGIN, { type: 'change-order' })
		}

		else if (component.includes(components.change_login)) {
			inform_broadcast(commuChanel.OPEN_MODAL_LOGIN, { type: 'change-login' })
		}
		else {
			if (this.active_components.includes(component)) window.ipcRenderer.send(commuChanel.active_tab, component)
			else {
				on_add_layout(this.refs.layout, component, name, config, this.state.model, this.active_components, t)
			}
		}
	}


	checkToastYN = ntfTp => {
		if (!glb_sv.toastYN || glb_sv.toastYN.length == 0) return true
		switch (ntfTp) {
			case 'FAV_NEW':
			case 'FAVGRP_NEW':
			case 'FAVGRP_DEL':
			case 'FAVGRP_NM':
			case 'FAV_DEL': {
				const obj = glb_sv.toastYN.find(x => x.c1 === 'FAV')
				if (obj) {
					if (obj.c3 === 'N') return false
				}
				break
			}
			case 'ORD_NEW':
			case 'ORD_REJ':
			case 'ORD_MTH':
			case 'ORD_CNL':
			case 'ORD_MOD':
			case 'ORD_ADV':
			case 'ORD_REJ8': {
				const obj = glb_sv.toastYN.find(x => x.c1 === 'ORD')
				if (obj) {
					if (obj.c3 === 'N') return false
				}
				break
			}
			case 'MSS_ORD_OK':
			case 'MSS_ORD_ERR': {
				const obj = glb_sv.toastYN.find(x => x.c1 === 'MSS')
				if (obj) {
					if (obj.c3 === 'N') return false
				}
				break
			}
			case 'CASH_INC':
			case 'CASH_DEC':
			case 'CASH_HLD':
			case 'CASH_RLE': {
				const obj = glb_sv.toastYN.find(x => x.c1 === 'CAS')
				if (obj) {
					if (obj.c3 === 'N') return false
				}
				break
			}
			case 'STK_INC':
			case 'STK_DEC':
			case 'STK_HLD':
			case 'STK_RLE': {
				const obj = glb_sv.toastYN.find(x => x.c1 === 'STK')
				if (obj) {
					if (obj.c3 === 'N') return false
				}
				break
			}
			case 'PIA_AINC':
			case 'PIA_ADEC':
			case 'TEXT':
			case 'NEWS':
			case 'CHAT': {
				const obj = glb_sv.toastYN.find(x => x.c1 === 'OTH')
				if (obj) {
					if (obj.c3 === 'N') return false
				}
				break
			}
			default: {
				break
			}
		}
		return true
	}


	process_NotifyInfoMsg = (ntfTp, msgInfo) => {
		if (msgInfo === null || msgInfo === undefined) {
			return
		}
		//-- kiểm tra USER có từ chối nhận Notify không
		console.log(!this.checkToastYN(ntfTp))
		if (!this.checkToastYN(ntfTp)) {
			return
		}


		let ntf_msg = ''
		switch (ntfTp) {
			case 'FAVGRP_NEW': {
				const grpId = Number(msgInfo['FavID'])
				const grpNm = msgInfo['FavNM']
				if (grpId != null && !isNaN(grpId) && grpNm != null && grpNm.trim().length > 0) {
					glb_sv.updateFvlGroup(0, grpId, grpNm)
				}
				const msg = this.props.t('add_new_favorite')
				// ntf_msg = 'Thêm mới danh mục quan tâm: ' + grpNm;
				ntf_msg = msg + ': ' + grpNm
				console.log('UPDATE_GRP_FVL')

				break
			}
			case 'FAVGRP_DEL': {
				const grpId = Number(msgInfo['FavID'])
				const grpNm = msgInfo['FavNm']
				if (grpId != null && !isNaN(grpId) && grpNm != null && grpNm.trim().length > 0) {
					glb_sv.updateFvlGroup(1, grpId, grpNm)
				}
				const msg = this.props.t('remove_favorite')
				// ntf_msg = 'Xóa danh mục quan tâm: ' + grpNm;
				ntf_msg = msg + ': ' + grpNm
				// -- day du lieu vao mang notify
				break
			}
			case 'FAVGRP_NM': {
				const grpId = Number(msgInfo['FavID'])
				const grpNm = msgInfo['FavNM']
				if (grpId != null && !isNaN(grpId) && grpNm != null && grpNm.trim().length > 0) {
					glb_sv.updateFvlGroup(2, grpId, grpNm)
				}
				const msg = this.props.t('change_name_of_favorite')
				// ntf_msg = 'Đổi tên danh mục quan tâm: ' + grpNm;
				ntf_msg = msg + ': ' + grpNm
				// -- day du lieu vao mang notify

				break
			}
			case 'FAV_NEW': {
				const grpId = Number(msgInfo['FavID'])
				const StkCd = msgInfo['StkCd']
				if (grpId != null && !isNaN(grpId) && StkCd != null && StkCd.trim().length > 0) {
					glb_sv.updateStock2Fvl(0, grpId, StkCd)
					// const msg = { type: commuChanel.GET_NEW_FVL, data: StkCd};
					// inform_broadcast(commuChanel.GET_NEW_FVL, msg)
				}
				const msg1 = this.props.t('add_symbol')
				const msg2 = this.props.t('to_favorite')
				// ntf_msg = 'Thêm mã CK: ' + StkCd + ' vào danh mục quan tâm';
				ntf_msg = msg1 + ': ' + StkCd + ' ' + msg2
				// -- day du lieu vao mang notify


				break
			}
			case 'FAV_DEL': {
				const grpId = Number(msgInfo['FavID'])
				const StkCd = msgInfo['StkCd']
				if (grpId != null && !isNaN(grpId) && StkCd != null && StkCd.trim().length > 0) {
					glb_sv.updateStock2Fvl(1, grpId, StkCd)
				}
				const msg1 = this.props.t('remove_symbol')
				const msg2 = this.props.t('from_favorite')
				// ntf_msg = 'Xóa mã CK: ' + StkCd + ' khỏi danh mục quan tâm';
				ntf_msg = msg1 + ': ' + StkCd + ' ' + msg2
				// -- day du lieu vao mang notify

				break
			}
			case 'ORD_NEW': {
				const StkCd = msgInfo['StkCd']
				const orderNo = msgInfo['OrdNo']
				const msg1 = this.props.t('inform_confirm_order_with_order_no')
				const msg2 = this.props.t('symbol')
				// ntf_msg = "Thông báo xác nhận lệnh, SHL: " + newNotify["OrdNo"] + ", CK: " + newNotify["StkCd"];
				ntf_msg = msg1 + orderNo + ', ' + msg2 + ': ' + StkCd
				// -- day du lieu vao mang notify

				break
			}
			case 'ORD_REJ': {
				const StkCd = msgInfo['StkCd']
				const orderNo = msgInfo['OrdNo']
				const reason = msgInfo['RejReason']
				const msg1 = this.props.t('inform_confirm_cancel_order_with_order_no')
				const msg2 = this.props.t('symbol')
				const msg3 = this.props.t('reject_reason')
				// ntf_msg = "Thông báo từ chối lệnh, SHL: " + newNotify["OrdNo"] + ", CK: " + newNotify["StkCd"] +
				//                ", lý do từ chối: " + newNotify["RejReason"];
				ntf_msg = msg1 + orderNo + ', ' + msg2 + ': ' + StkCd + ', ' + msg3 + reason

				break
			}
			case 'ORD_MTH': {
				const acntNo = glb_sv.objShareGlb['acntNoList'][0]
				const acntArr = acntNo['id'].split('.')
				const msg1 = this.props.t('inform_order_match_with_order_no')
				const msg2 = this.props.t('symbol')
				const msg3 = this.props.t('match_volume')
				const msg4 = this.props.t('match_price')
				// ntf_msg = "Thông báo từ chối lệnh, SHL: " + newNotify["OrdNo"] + ", CK: " + newNotify["StkCd"] +
				//                ", lý do từ chối: " + newNotify["RejReason"];
				if (acntArr[0] === msgInfo['AcntNoB']) {
					ntf_msg =
						msg1 +
						msgInfo['OrdNoB'] +
						', ' +
						msg2 +
						': ' +
						msgInfo['StkCd'] +
						', ' +
						msg3 +
						FormatNumber(msgInfo['MthQty'], 0, 0) +
						', ' +
						msg4 +
						FormatNumber(msgInfo['MthPri'], 0, 0) +
						' VNĐ'
				} else {
					ntf_msg =
						msg1 +
						msgInfo['OrdNoS'] +
						', ' +
						msg2 +
						': ' +
						msgInfo['StkCd'] +
						', ' +
						msg3 +
						FormatNumber(msgInfo['MthQty'], 0, 0) +
						', ' +
						msg4 +
						FormatNumber(msgInfo['MthPri'], 0, 0) +
						' VNĐ'
				}

				break
			}
			case 'ORD_CNL': {
				const StkCd = msgInfo['StkCd']
				const orderNo = msgInfo['OrdNo']
				// const reason = msgInfo['RejReason'];
				const msg1 = this.props.t('inform_confirm_cancel_order')
				const msg2 = this.props.t('order_number')
				const msg3 = this.props.t('symbol')
				// ntf_msg = "Thông báo xác nhận hủy lệnh " + newNotify["Note"] + ", SHL: " +  newNotify["OrdNo"] + ", CK: " + newNotify["StkCd"];
				ntf_msg = msg1 + msgInfo['Note'] + ', ' + msg2 + ': ' + orderNo + ', ' + msg3 + ': ' + StkCd

				break
			}
			case 'ORD_MOD': {
				const StkCd = msgInfo['StkCd']
				const orderNo = msgInfo['OrdNo']
				// const reason = msgInfo['RejReason'];
				const msg1 = this.props.t('inform_confirm_modify_order')
				const msg2 = this.props.t('order_number')
				const msg3 = this.props.t('symbol')
				// ntf_msg = "Thông báo xác nhận sửa lệnh " + newNotify["Note"] + ", SHL: " +  newNotify["OrdNo"] + ", CK: " + newNotify["StkCd"];
				ntf_msg = msg1 + msgInfo['Note'] + ', ' + msg2 + ': ' + orderNo + ', ' + msg3 + ': ' + StkCd

				break
			}
			case 'ORD_ADV': {
				const StkCd = msgInfo['StkCd']
				const orderNo = msgInfo['OrdNo']
				const reason = msgInfo['Note']
				const msg1 = this.props.t('inform_confirm_advance_order_success_with_create_order_no')
				const msg2 = this.props.t('symbol')
				const msg3 = this.props.t('inform_confirm_advance_order_unsuccess_with_create_order_no')
				const msg4 = this.props.t('fail_reason')
				if (msgInfo['ProcTp'] === '2') {
					ntf_msg = msg1 + orderNo + ', ' + msg2 + ': ' + StkCd
					// title = msg1;
				} else {
					ntf_msg = msg3 + orderNo + ', ' + msg2 + ': ' + StkCd + ', ' + msg4 + reason
					// title = msg3;
				}

				break
			}
			case 'ORD_REJ8': {
				let Time = msgInfo['Time'] // yyyymmddhh24miss
				Time =
					Time.substr(6, 2) +
					'/' +
					Time.substr(4, 2) +
					'/' +
					Time.substr(0, 4) +
					' ' +
					Time.substr(8, 2) +
					':' +
					Time.substr(10, 2) +
					':' +
					Time.substr(12, 2)
				const StkCd = msgInfo['StkCd']
				const orderNo = msgInfo['OrdNo']
				const reason = msgInfo['Note']
				const RejectType = msgInfo['RejectType']
				let msg1 = this.props.t('order_not_match_intime')
				const msg2 = this.props.t('symbol')
				const msg3 = this.props.t('order_number')
				if (RejectType === '2') {
					msg1 = this.props.t('order_not_match_intime_of_mokmakmtl_order')
				}
				// ntf_msg = "Thông báo hủy lệnh không khớp cuối phiên " + newNotify["Note"] + ", SHL: " +
				//                newNotify["OrdNo"] + ", CK " + newNotify["StkCd"];
				ntf_msg = Time + ' ' + msg1 + reason + ', ' + msg3 + ': ' + orderNo + ', ' + msg2 + ': ' + StkCd

				break
			}
			case 'MSS_ORD_OK': {
				const StkCd = msgInfo['StkCd']
				const orderNo = msgInfo['OrdNo']
				const reason = msgInfo['Note']
				const msg1 = this.props.t('inform_send_MSS_order_success')
				const msg2 = this.props.t('symbol')
				const msg3 = this.props.t('order_number')
				const sell = this.props.t('common_sell')
				const buy = this.props.t('common_buy')
				let msg4
				// ntf_msg = "Thông báo thành công kích hoạt lệnh điều kiện lệnh " + SellBuy +
				//                    + ", CK: " + newNotify["StkCd"] + ", SHL: " + newNotify["OrdNo"];
				if (orderNo === null || orderNo === '') {
					ntf_msg = reason
				} else {
					if (msgInfo['SellBuy'] === 1) {
						msg4 = buy
					} else {
						msg4 = sell
					}
					ntf_msg = msg1 + msg4 + ', ' + msg2 + ': ' + StkCd + ', ' + msg3 + ': ' + orderNo
				}

				break
			}
			case 'MSS_ORD_ERR': {
				const StkCd = msgInfo['StkCd']
				const reason = msgInfo['Note']
				const msg1 = this.props.t('inform_send_MSS_order_unsuccess')
				const msg2 = this.props.t('symbol')
				const msg3 = this.props.t('fail_reason')
				const sell = this.props.t('common_sell')
				const buy = this.props.t('common_buy')
				let msg4
				// ntf_msg = "Thông báo từ chối kích hoạt lệnh điều kiện lệnh " + SellBuy +
				//                     ", CK: " + newNotify["StkCd"] + ", Lý do: " + newNotify["Note"];
				if (msgInfo['SellBuy'] === 1) {
					msg4 = buy
				} else {
					msg4 = sell
				}
				ntf_msg = msg1 + msg4 + ', ' + msg2 + ': ' + StkCd + ', ' + msg3 + ': ' + reason

				break
			}
			case 'CASH_INC': {
				const amount = msgInfo['Amt']
				const TransDesc = msgInfo['TransDesc']
				const msg1 = this.props.t('inform_increase_cash')
				const msg2 = this.props.t('cash_amount_increase')
				// ntf_msg = "Thông báo tăng tiền: " + newNotify["TransDesc"] + ", số tiền: " + $filter('number')(newNotify["Amt"], 0);
				ntf_msg = msg1 + TransDesc + ', ' + msg2 + ': ' + FormatNumber(amount, 0, 0) + ' VNĐ'

				break
			}
			case 'CASH_DEC': {
				const amount = msgInfo['Amt']
				const TransDesc = msgInfo['TransDesc']
				const msg1 = this.props.t('inform_decrease_cash')
				const msg2 = this.props.t('cash_amount_increase')
				// ntf_msg = "Thông báo giảm tiền: " + newNotify["TransDesc"] + ", số tiền: " + $filter('number')(newNotify["Amt"], 0);
				ntf_msg = msg1 + TransDesc + ', ' + msg2 + ': ' + FormatNumber(amount, 0, 0) + ' VNĐ'

				break
			}
			case 'CASH_HLD': {
				const amount = msgInfo['Amt']
				const TransDesc = msgInfo['TransDesc']
				const msg1 = this.props.t('inform_hold_cash')
				const msg2 = this.props.t('cash_amount_increase')
				// ntf_msg = "Thông báo tạm phong tỏa tiền: " + newNotify["TransDesc"] + ", số tiền: " + $filter('number')(newNotify["Amt"], 0);
				ntf_msg = msg1 + TransDesc + ', ' + msg2 + ': ' + FormatNumber(amount, 0, 0) + ' VNĐ'

				break
			}
			case 'CASH_RLE': {
				const amount = msgInfo['Amt']
				const TransDesc = msgInfo['TransDesc']
				const msg1 = this.props.t('inform_release_cash')
				const msg2 = this.props.t('cash_amount_increase')
				// ntf_msg = "Thông báo giải tỏa tiền: " + newNotify["TransDesc"] + ", số tiền: " + $filter('number')(newNotify["Amt"], 0);
				ntf_msg = msg1 + TransDesc + ', ' + msg2 + ': ' + FormatNumber(amount, 0, 0) + ' VNĐ'

				break
			}
			case 'STK_INC': {
				const Qty = msgInfo['Qty']
				const TransDesc = msgInfo['TransDesc']
				const msg1 = this.props.t('inform_increase_stock')
				const msg2 = this.props.t('stock_quantity_increase')
				// ntf_msg = "Thông báo tăng CK: " + newNotify["TransDesc"] + ", số lượng: " + $filter('number')(newNotify["Qty"], 0);
				ntf_msg = msg1 + TransDesc + ', ' + msg2 + ': ' + FormatNumber(Qty, 0, 0)

				break
			}
			case 'STK_DEC': {
				const Qty = msgInfo['Qty']
				const TransDesc = msgInfo['TransDesc']
				const msg1 = this.props.t('inform_decrease_stock')
				const msg2 = this.props.t('stock_quantity_increase')
				// ntf_msg = "Thông báo tăng CK: " + newNotify["TransDesc"] + ", số lượng: " + $filter('number')(newNotify["Qty"], 0);
				ntf_msg = msg1 + TransDesc + ', ' + msg2 + ': ' + FormatNumber(Qty, 0, 0)

				break
			}
			case 'STK_HLD': {
				const Qty = msgInfo['Qty']
				const TransDesc = msgInfo['TransDesc']
				const msg1 = this.props.t('inform_hold_stock')
				const msg2 = this.props.t('stock_quantity_increase')
				// ntf_msg = "Thông báo tạm phong tỏa CK: " + newNotify["TransDesc"] + ", số lượng: " + $filter('number')(newNotify["Qty"], 0);
				ntf_msg = msg1 + TransDesc + ', ' + msg2 + ': ' + FormatNumber(Qty, 0, 0)

				break
			}
			case 'STK_RLE': {
				const Qty = msgInfo['Qty']
				const TransDesc = msgInfo['TransDesc']
				const msg1 = this.props.t('inform_release_stock')
				const msg2 = this.props.t('stock_quantity_increase')
				// ntf_msg = "Thông báo giải tỏa CK: " + newNotify["TransDesc"] + ", số lượng: " + $filter('number')(newNotify["Qty"], 0);
				ntf_msg = msg1 + TransDesc + ', ' + msg2 + ': ' + FormatNumber(Qty, 0, 0)

				break
			}
			case 'PIA_AINC': {
				const msg1 = this.props.t('inform_increase_PIA_auto')
				// ntf_msg = Thông báo khả năng sử dụng PIA tự động của KH tăng
				ntf_msg = msg1

				break
			}
			case 'PIA_ADEC': {
				const msg1 = this.props.t('inform_decrease_PIA_auto')
				// ntf_msg = Thông báo khả năng sử dụng PIA tự động của KH tăng
				ntf_msg = msg1

				break
			}
			case 'TEXT': {
				// -- day du lieu vao mang notify
				ntf_msg = msgInfo['Title'] + ': ' + msgInfo['Content']

				break
			}
			case 'NEWS': {
				// -- day du lieu vao mang notify

				ntf_msg = msgInfo['Title']

				break
			}
			case 'CHAT': {
				if (msgInfo['Sender'] !== glb_sv.objShareGlb['sessionInfo']['userID'].toLowerCase().trim()) {
					ntf_msg = msgInfo['Sender'] + ': ' + msgInfo['Content']
				}
				// jQuery('#div_chats_content').stop().animate({
				// 	scrollTop: jQuery('#div_chats_content')[0].scrollHeight
				// }, 800);
				break
			}
			default: {
				// glb_sv.logMessage("Invalid choice");
				break
			}
		}
		if (ntf_msg != null && ntf_msg.trim().length > 0) {
			if (glb_sv.permissNotify) {
				const title = this.props.t('notify_info')
				const content = ntf_msg.trim()
				this.pushWebNotify(title, content)
				// window.ipcRenderer.send('notification')


			} else {
				toast.info(ntf_msg.trim())
			}
			const msg = { type: commuChanel.NOTIFY }
			inform_broadcast(commuChanel.NOTIFY, msg)
		}
	}

	pushWebNotify = (title, content) => {
		const icon = glb_sv.configInfo['loginLogo']
		const options = {
			body: content,
			icon: icon,
			lang: 'en',
			dir: 'ltr',
			sound: '',
		}
		new Notification(title, {
			body: content,
			lang: 'en',
			dir: 'ltr',
			sound: '',
		})
	}

	onChangeWorkspace = (ws_config) => {
		console.log("WS", ws_config);
		this.setState({ model: FlexLayout.Model.fromJson(this.fixModel(ws_config, this.active_components, this.props.t)) })
		this.active_components.push('OVERVIEW_MARKET_TAB0')
		this.active_components.push('common_index_chart_info0')
		this.active_components.push('HISTORY_MARKET_TAB0')
	}


	render() {
		const { t } = this.props;
		window.onbeforeunload = () => {
			// localStorage.removeItem("workspace");
			localStorage.setItem("workspace", this.contents().props.model.toString())
		}
		// console.log("Fix lại layout model", this.fixModel(ws03, this.active_components, t));
		
		return (<>
			<div className="app">
				<GlobalHotKeys
					keyMap={this.state.keyMapState}
					handlers={this.state.handlersShortKey}
					allowChanges={true}
				>
					<Router >
						<Trans>
							<Route exact path="/">
								<MenubarChildDown active_components={this.active_components} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} onAddLayout={this.onAddLayout} onChangeWorkspace={this.onChangeWorkspace}></MenubarChildDown>
								<MenuBarLayout active_components={this.active_components}
									get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} onAddLayout={this.onAddLayout} />
								<div className="contents">
									{this.contents()}
								</div>
							</Route>
						</Trans>
						<Route path="/:id" render={() => <MapComponent t={t} language={glb_sv.language} style={glb_sv.style}
							themePage={glb_sv.themePage} get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} active_components={this.active_components} />}>
						</Route>
					</Router>
					<BackgroundMessage get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq} active_component={this.active_components} />
				</GlobalHotKeys>
			</div>
			<ToastContainer autoClose={3000} position="top-right" />
		</>)
	}
}

export default translate('translations')(App);
