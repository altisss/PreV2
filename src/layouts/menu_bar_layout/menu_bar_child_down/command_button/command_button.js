import React from "react";
import { translate } from 'react-i18next';
import uniqueId from "lodash/uniqueId";

class CommandButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }
    
    //   openWizard(value) {
//     if (value === 'reset-container') {

//       this.setState({ cfm_reset_container: true });
//       const elm = document.querySelector('.wizard-modal');
//       if (elm) elm.style.dislay = 'none';
//     } else 
//     if (value === 'OVERVIEW_MARKET_TAB') {
//       const messObj = {
//         type: glb_sv.OVERVIEW_MARKET_TAB
//       };
//       console.log(messObj)
//       glb_sv.commonEvent.next(messObj);
//     } else 
//     if (value === 'HISTORY_MARKET_TAB') {
//       const messObj = {
//         type: glb_sv.HISTORY_MARKET_TAB
//       };
//       glb_sv.commonEvent.next(messObj);
//     } else 
//     if (value === 'LIQUID_MARKET_TAB') {
//       const messObj = {
//         type: glb_sv.LIQUID_MARKET_TAB
//       };
//       glb_sv.commonEvent.next(messObj);
//     } else 
//     if (value === 'TRADE_FOREIGNER_TAB') {
//       const messObj = {
//         type: glb_sv.TRADE_FOREIGNER_TAB
//       };
//       glb_sv.commonEvent.next(messObj);
//     } else 
//     if (value === 'OWN_FOREIGER_TAB') {
//       const messObj = {
//         type: glb_sv.OWN_FOREIGER_TAB
//       };
//       glb_sv.commonEvent.next(messObj);
//     } else
//     if (value === 'put_through_tab') {
//       const messObj = {
//         type: glb_sv.PUT_THROUGH_TAB,
//         key: 'pt_hsx'
//       };
//       glb_sv.commonEvent.next(messObj);
//     } else 
//     if (value === 'right-info') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.RIGHT_INFO
//       };
//       glb_sv.commonEvent.next(messObj);
//     } else
//     if (value === 'advertis-order') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.ADVERTIS_ORDER
//       };
//       glb_sv.commonEvent.next(messObj);
//     } else
//     if (value === 'dark-theme') {
//       if (glb_sv.themePage !== 'dark-theme') {
//         glb_sv.themePage = 'dark-theme';

//         localStorage.setItem('themePage', glb_sv.themePage);
//         const html = document.getElementsByTagName('html');
//         html[0].style.backgroundColor = 'rgb(28, 23, 47)';
//         const body = document.getElementById('bodyTheme');
//         if (body.classList.contains('light-theme')) body.classList.remove('light-theme');
//         if (body.classList.contains('light-theme-china')) body.classList.remove('light-theme-china');
//         if (body.classList.contains('dark-theme-china')) body.classList.remove('dark-theme-china');
//         if (!body.classList.contains('dark-theme')) body.classList.add('dark-theme');
//         this.setState({ dataMenu: [...glb_sv.configInfo['menuConfig']] });
//         const msg = {type: glb_sv.CHANGE_THEME};
//         glb_sv.commonEvent.next(msg);
//         return;
//       }
//     } else
//     if (value === 'light-theme') {
//       if (glb_sv.themePage !== 'light-theme') {
//         glb_sv.themePage = 'light-theme';
//         localStorage.setItem('themePage', glb_sv.themePage);
//         const html = document.getElementsByTagName('html');
//         html[0].style.backgroundColor = '#F5F5F5';
//         const body = document.getElementById('bodyTheme');
//         if (body.classList.contains('dark-theme')) body.classList.remove('dark-theme');
//         if (body.classList.contains('light-theme-china')) body.classList.remove('light-theme-china');       
//         if (body.classList.contains('dark-theme-china')) body.classList.remove('dark-theme-china');
//         if (!body.classList.contains('light-theme')) body.classList.add('light-theme');
//         this.setState({ dataMenu: [...glb_sv.configInfo['menuConfig']] });
//         const msg = {type: glb_sv.CHANGE_THEME};
//         glb_sv.commonEvent.next(msg);
//         return;
//       }
//     } else 
//     if (value === 'dark-theme-china') {
//       if (glb_sv.themePage !== 'dark-theme-china') {
//         glb_sv.themePage = 'dark-theme-china';

//         localStorage.setItem('themePage', glb_sv.themePage);
//         const html = document.getElementsByTagName('html');
//         html[0].style.backgroundColor = 'rgb(28, 23, 47)';
//         const body = document.getElementById('bodyTheme');
//         if (body.classList.contains('light-theme')) body.classList.remove('light-theme');
//         if (body.classList.contains('dark-theme')) body.classList.remove('dark-theme');
//         if (body.classList.contains('light-theme-china')) body.classList.remove('light-theme-china');
//         if (!body.classList.contains('dark-theme-china')) body.classList.add('dark-theme-china');
//         this.setState({ dataMenu: [...glb_sv.configInfo['menuConfig']] });
//         const msg = {type: glb_sv.CHANGE_THEME};
//         glb_sv.commonEvent.next(msg);
//         return;
//       }
//     } else
//     if (value === 'light-theme-china') {
//       if (glb_sv.themePage !== 'light-theme-china') {
//         glb_sv.themePage = 'light-theme-china';
//         localStorage.setItem('themePage', glb_sv.themePage);
//         const html = document.getElementsByTagName('html');
//         html[0].style.backgroundColor = '#F5F5F5';
//         const body = document.getElementById('bodyTheme');
//         if (body.classList.contains('dark-theme')) body.classList.remove('dark-theme');
//         if (body.classList.contains('light-theme')) body.classList.remove('light-theme');
//         if (body.classList.contains('dark-theme-china')) body.classList.remove('dark-theme-china');
//         if (!body.classList.contains('light-theme-china')) body.classList.add('light-theme-china');
//         this.setState({ dataMenu: [...glb_sv.configInfo['menuConfig']] });
//         const msg = {type: glb_sv.CHANGE_THEME};
//         glb_sv.commonEvent.next(msg);
//         return;
//       }
//     } else
//     if (!glb_sv.authFlag) {
//       glb_sv.showLogin();
//       return;
//     }
//     if (value === 'cashin-advance') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.CASHIN_ADVANCE
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'cash-withdraw') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.CASH_WITHDRAW
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'deposit-inform') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.DEPOSIT_INFORM
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'cash-transfer') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.CASH_TRANSFER
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'register-email-sms') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.REGISTER_EMAIL_SMS
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'stock-transfer') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.STOCK_TRANSFER
//       };
//       glb_sv.commonEvent.next(messObj);
//     }

//     if (value === 'repay-margin') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.REPAY_MARGIN
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'advance-order') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.ADVANCE_ORDER
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'oddlot-order') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.ODDLOT_ORDER
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'confirm-order') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.CONFIRM_ORDER
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'right-forbuy') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.RIGHT_FORBUY
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'change-login') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.CHANGE_PASSWORD,
//         key: 'change-login'
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'change-order') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.CHANGE_PASSWORD,
//         key: 'change-order'
//       };
//       glb_sv.commonEvent.next(messObj);
//     }

//     if (value === 'rigister-notify') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.REGISTER_NOTIFY,
//         key: 'rigister-notify'
//       };
//       glb_sv.commonEvent.next(messObj);
//     }

//     if (value === 'margin-list-info') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.MARGIN_LIST_INFO
//       };
//       glb_sv.commonEvent.next(messObj);
//     }

//     if (value === 'config-info') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.CONFIG_INFO,
//         key: 'config-info'
//       };
//       glb_sv.commonEvent.next(messObj);
//     }

//     if (value === 'register-email-sms') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.REGISTER_EMAIL_SMS,
//         key: 'register-email-sms'
//       };
//       glb_sv.commonEvent.next(messObj);
//     }

//     if (value === 'place-order') {
//       const msg = { type: glb_sv.PLACE_ORDER };
//       glb_sv.commonEvent.next(msg);
//     }
//     if (value === 'extend-contract') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.EXTEND_CONTRACT
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'bank-connection') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.BANK_CONNECTION
//       };
//       glb_sv.commonEvent.next(messObj);
//     }

//     if (value === 'asset-manage') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.ASSET_MANAGE
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'asset-margin') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.ASSET_MARGIN
//       };
//       glb_sv.commonEvent.next(messObj);
//     }
//     if (value === 'transaction-info') {
//       this.props.redirectLink('/main-app/' + value);
//       const messObj = {
//         type: glb_sv.TRANSACTION_INFO
//       };
//       glb_sv.commonEvent.next(messObj);
//     }

//   }

    render() {
        return (
            <li key={uniqueId('subMenu')} className="dropdown" onClick={() => this.openWizard('place-order')} data-tut="reactour__menu_placeorder">
                    <a className='menu-place-order'>
                        <i className='fa fa-shopping-cart' />{' '}
                        {this.props.t('place_order')}
                    </a>
            </li>
        );
    }
}

export default translate('translations')(CommandButton);