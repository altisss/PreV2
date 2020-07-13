import React from 'react';
import { FaPlus, FaMinus, FaChartLine } from 'react-icons/fa';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import glb_sv from '../../utils/globalSv/service/global_service';
// import vote star --
import VoteStarComp from './vote-start-comp';
import { showLogin } from '../../utils/show_login';
import commuChanel from '../../constants/commChanel'
import { inform_broadcast } from '../../utils/broadcast_service';
import {update_value_for_glb_sv} from '../../utils/update_value_for_glb_sv'

let authFlag = false

const getPaddingLeft = (type) => {
	let paddingLeft = 0;
	if (type === 'file') paddingLeft = 20;
	return paddingLeft;
};

const StyledTreeNode = styled.li`
	display: flex;
	flex-direction: row;
	align-items: center;
	padding-left: ${(props) => getPaddingLeft(props.type)}px;
`;

const classIndexNm = (value) => {
	if (value === undefined) return '';
	if (value > 0) {
		return 'price_basic_over';
	} else if (value < 0) {
		return 'price_basic_less';
	} else return 'price_basic_color';
};

const openAddNewFavarites = (component, get_value_from_glb_sv_seq) => {
	const sq= get_value_from_glb_sv_seq()
	window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: component, value: 'authFlag', sq:sq})
	window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
		if (!agrs) {
			// glb_sv.showLogin();
			showLogin(component)
		}
	})
	
};

const handleShowStk = (component) => {
	console.log('selectMenu', component)
	const messObj = {
		type: commuChanel.REFOCUS_SELECT_STK,
		value: null,
		component: component
	}
	inform_broadcast(commuChanel.REFOCUS_SELECT_STK, messObj)
	// glb_sv.commonEvent.next(messObj);
};

const openModalIndex = (index,props, component, get_value_from_glb_sv_seq) => {
	// glb_sv.indexMarket = index;
	update_value_for_glb_sv( {component: component, key: 'indexMarket', value: index})
	const msg = {type: commuChanel.MARKET_INDEX_TAB, value: index, component: component};
	inform_broadcast(commuChanel.MARKET_INDEX_TAB, msg)
	// glb_sv.commonEvent.next(msg);
};



const NodeIndexWL = (props) => {
	const { node, onNodeSelect, isOpen, openVoteModal, t , component , get_value_from_glb_sv_seq} = props;
	const { value } = node;

	return (
		<React.Fragment>
			{((node.type === 'file' && isOpen)) && (
				<StyledTreeNode
					id={node.key + node.typeIndex}
					type={node.type}
					className={'index-sidebar menu-item-element'}
					style={{ height: node.typeIndex === 'WL' ? '' : 30 }}
				>
					<span role="button" onClick={() => onNodeSelect(node)} className='cursor_ponter'>
						<span
							className='text-index '
							style={{
								width: node.type === 'file' ? 175 : 155,
								overflow: 'hidden',
								float: 'left',
								marginTop: node.type === 'file' ? 5 : '',
								fontSize: node.type === 'file' ? 12 : ''
							}}
						>
							{t(value)}
							{node.type === 'file' && (
								<span
									onClick={() => openVoteModal(node)}
									style={{ fontSize: '10px', float: 'right', marginRight: '5px' }}
								>
									<VoteStarComp title={t('number_user_vote') + Number(node.userNum)} rating={Number(node.rateNum ? node.rateNum : 0)} />
								</span>
							)}
						</span>
					</span>

				</StyledTreeNode>
			)}
		</React.Fragment>
	);
};

const open_model_addModFav = (node_key, path, component) => {
	// console.log(node_key, path)
	inform_broadcast(commuChanel.OPEN_MODAL_AddModFav, {node_key, path, component})
}

const NodeIndexFVL = (props) => {
	const { node, onNodeSelect, isOpen, t , component, get_value_from_glb_sv_seq} = props;
	const { value, key, typeIndex } = node;

	const sq = get_value_from_glb_sv_seq()
	window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: component, value: 'authFlag', sq:sq})
	window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
		authFlag = agrs
	})

	return (
		<React.Fragment>
			{((node.type === 'file' && isOpen)) && (
				<StyledTreeNode
					id={node.key + node.typeIndex}
					type={node.type}
					className={'index-sidebar'}
					style={{ height: node.typeIndex === 'FVL' ? '' : 30 }}
				>
					<span
						role="button"
						onClick={() => {
							onNodeSelect(node);
						}}
						className='cursor_ponter'
					>
						<span
							className={'text-index '}
							style={{
								width: node.type === 'file' ? 125 : 155,
								overflow: 'hidden',
								float: 'left',
								fontSize: node.type === 'file' ? 12 : ''
							}}
						>
							{t(value)}
						</span>
					</span>
					
					{typeIndex === 'FVL' &&
						{authFlag} && (
							<div
								className='sidebar_indexnm'
								style={{ fontSize: 12, float: 'left' }}
							>
								{' '}
								<span
									onClick={() => {
										onNodeSelect(node, key);
										handleShowStk(component, get_value_from_glb_sv_seq);
									}}
									className="color-icon cursor_ponter"
								>
									<FaPlus title={t('add_symbol_to_favorites')} />
								</span>{' '}
								<span onClick={() => open_model_addModFav(node.key, 'edit-fav', component)} className="color-icon">
									<i title={t('common_Modify')} className="fa fa-edit" />
								</span>{' '}
								<span onClick={() => open_model_addModFav(node.key, 'delete-fav', component)} className="color-icon">
									<i title={t('common_Delete')} className="fa fa-trash" />
								</span>
							</div>
						)}
				</StyledTreeNode>
			)}
		
		</React.Fragment>
	);
};

const NodeIndexOther = (props) => {
	const { node, onNodeSelect, isOpen, t , component, get_value_from_glb_sv_seq} = props;
	let { data, value, key } = node;
	data = data ? data : {};

	return (
		<React.Fragment>
			{((isOpen)) && (
				<>
					<StyledTreeNode
						id={node.key + node.typeIndex}
						type={'file'}
						className={'index-sidebar'}
						style={{ height: 30 }}
					>

						<span role="button" style={{marginTop: -2}}>
							<span
								id={key === 'CW' ? 'buttonCW' : 
									(key === 'pt_hsx' ? 'buttonPTHSX' : 
										(key === 'pt_hnx' ? 'buttonPTHNX' :
											(key === 'pt_upc' ? 'buttonPTUPC' : '')))}
								className={'cursor_ponter text-index ' + classIndexNm(data.indexPercChang)}
								style={{
									width: node.type === 'file' ? (((node.typeIndex == 'HSX' && glb_sv.configInfo['hsx_smindex']) || (node.typeIndex == 'HNX' && glb_sv.configInfo['hnx_smindex'])) &&
									node.type === 'file' && key !== 'CW' && value !== 'put_through_tab' ? 150 : 150) : 150,
									overflow: (key !== 'CW' || value !== 'put_through_tab') ? 'hidden' : '',
									float: 'left',
									marginTop: 4,
									fontSize: node.type === 'file' ? 13 : 14
								}}
								onClick={() => onNodeSelect(node)}
							>
								{t(value)}
							</span>
						</span>

					</StyledTreeNode>
				</>
			)}
		</React.Fragment>
	);
};


export { NodeIndexWL, NodeIndexFVL, NodeIndexOther };
