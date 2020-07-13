import React from 'react'
import Input from "../../conponents/basic/input/Input";
import { translate } from 'react-i18next';
import SearchAccount from '../../conponents/search_account/SearchAccount';

class TableRepayMargin extends React.Component {
    constructor(props) {
      super(props);
      this.component = this.props.component
      this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
      this.req_component = this.props.req_component
      this.get_rq_seq_comp = this.props.get_rq_seq_comp
    }

    handleChangePrice = this.props.handleChangePrice

    validateInput = this.props.validateInput

    handleKeyPress = this.props.handleKeyPress

    // previousPage = this.props.previousPage

    openModalConfirmRepayMargin = this.props.openModalConfirmRepayMargin

    render() {
        const {t, rpMargin} = this.props
        return(
        <div className='page2'>
            <div className="form-group row ">
            <label className="col-sm-5 control-label no-padding-right text-left">{t('trans_sub_account')}</label>
              <div className="col-sm-7 no-padding-left">
                <SearchAccount
                  handleChangeAccount={this.props.handleChangeAccount}
                  component={this.props.component}
                  req_component={this.props.req_component}
                  get_rq_seq_comp={this.props.get_rq_seq_comp}
                  get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq}
                  language={this.props.language}
                  themePage={this.props.themePage}
                  style={this.props.style}
                  isShowDetail={true}
                />
              </div>
              <label className="col-sm-5 control-label no-padding-right text-left">{t('loan_contract_number')}</label>

              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {rpMargin.contractNo}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('loan_date')}</label>

              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {rpMargin.loan_date}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('loan_amount')}</label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {rpMargin.lndAmt}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('loan_current')}</label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {rpMargin.lndCurr}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('interest_amount')}</label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {rpMargin.intAmt}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('cash_available')}</label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {rpMargin.avablAmt}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('repay_amount')}
                <span className="mustInput">*</span>
              </label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <Input
                  inputtype={"text"}
                  name={"rpMargin_repayAmtID"}
                  value={rpMargin.repayAmt}
                  onChange={this.handleChangePrice}
                  onBlur={this.validateInput}
                  onKeyDown={this.handleKeyPress}
                  classextend={'form-control-sm text-right'}
                />

              </div>
            </div>

            <div className="form-group row" style={{ marginTop: 25 }}>
              <div className='col-sm fullWidthButton'>

                {/* <button className="btn btn-pill pull-left btn-cancel previous" onClick={this.previousPage} >
                  <i className="fa fa-chevron-left" />
                  &nbsp; {t('previous')}
                </button> */}
                <button className="btn btn-pill pull-right btn-wizard" onClick={this.openModalConfirmRepayMargin}>
                  {t('common_send_info')} &nbsp;
                <i className="fa fa-check" />
                </button>
              </div>
            </div>
        </div>
        
        )
    }
}

export default translate('translations')(TableRepayMargin);