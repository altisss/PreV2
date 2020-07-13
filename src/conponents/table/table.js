import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';

import component from '../../constants/components'



class Table extends React.PureComponent {
  constructor(props) {
    super(props);

    this.component = component.TableRightInfo
    this.req_component = new Map();

    this.request_seq_comp = 0;
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };

    this.state = {
      columns: this.columHead(),

    }
  };

  columHead = () => {
    if (!this.props.columnsH) {
      return this.columnsH
    }
    else return this.props.columnsH
  }
  columnsH = [
    { Header: "common_index", accessor: "c00", show: true, width: 50, headerClassName: 'text-center', className: 'text-center' },
    { Header: "right_code", accessor: "c0", show: true, width: 130, headerClassName: 'text-center', className: 'text-center' },
    {
      Header: "short_symbol", accessor: "c1", show: true, width: 70, headerClassName: 'text-center', className: 'text-center',
      //   Cell: props => <React.Fragment>{props.original.c3 === '01' && <span onClick={() => this.goToRgtBuy(props.original.c1)} className='btn-linkcursor_ponter'>{props.original.c1}</span>}
      //     {props.original.c3 !== '01' && <span>{props.original.c1}</span>}
      //   </React.Fragment>
    },
    { Header: "last_regist_date", accessor: "c2", show: true, width: 125, headerClassName: 'text-center', className: 'text-center' },
    {
      Header: "right_type", accessor: "c3", show: true, width: 250, headerClassName: 'text-center', className: 'text-left',
      Cell: props => <span>{props.original.c3 + '. ' + props.original.c33}</span>
    },
    {
      Header: "symbol_after_change", accessor: "c4", show: true, width: 180, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c4 === '' || cellInfo.original.c4 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c4}</span>}</>
    },
    { Header: "price_for_sell", accessor: "c5", show: true, width: 125, headerClassName: 'text-center', className: 'text-right' },
    { Header: "divide_ratio", accessor: "c6", show: true, width: 160, headerClassName: 'text-center', className: 'text-center' },
    { Header: "action_ratio", accessor: "c8", show: true, width: 115, headerClassName: 'text-center', className: 'text-center' },
    { Header: "liquidation_money_ratio", accessor: "c10", show: true, width: 165, headerClassName: 'text-center', className: 'text-right' },
    { Header: "tax_ratio_of_symbol", accessor: "c12", show: true, width: 135, headerClassName: 'text-center', className: 'text-right' },
    { Header: "tax_ratio_of_money", accessor: "c13", show: true, width: 135, headerClassName: 'text-center', className: 'text-right' },
    {
      Header: "date_start_register", accessor: "c15", show: true, width: 170, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c15 === '' || cellInfo.original.c15 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c15}</span>}</>
    },
    {
      Header: "date_close_register", accessor: "c16", show: true, width: 180, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c16 === '' || cellInfo.original.c16 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c16}</span>}</>
    },
    {
      Header: "date_start_transfer", accessor: "c17", show: true, width: 230, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c17 === '' || cellInfo.original.c17 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c17}</span>}</>
    },
    {
      Header: "date_close_transfer", accessor: "c18", show: true, width: 230, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c18 === '' || cellInfo.original.c18 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c18}</span>}</>
    },
    { Header: "price_of_odd_lot", accessor: "c19", show: true, width: 130, headerClassName: 'text-center', className: 'text-right' },
    {
      Header: "date_account_increase_symbol", accessor: "c21", show: true, width: 195, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c21 === '' || cellInfo.original.c21 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c21}</span>}</>
    },
    {
      Header: "date_account_decrease_symbol", accessor: "c22", show: true, width: 195, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c22 === '' || cellInfo.original.c22 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c22}</span>}</>
    },
    {
      Header: "date_trading", accessor: "c23", show: true, width: 135, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c23 === '' || cellInfo.original.c23 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c23}</span>}</>
    },
    {
      Header: "date_settlement_money", accessor: "c24", show: true, width: 170, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c24 === '' || cellInfo.original.c24 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c24}</span>}</>
    },
    {
      Header: "date_settlement_transfer", accessor: "c25", show: true, width: 245, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c25 === '' || cellInfo.original.c25 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c25}</span>}</>
    },
    {
      Header: "date_trading_not_right", accessor: "c29", show: true, width: 150, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c29 === '' || cellInfo.original.c29 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c29}</span>}</>
    },
    { Header: "statut_solved_right", accessor: "c30", show: true, width: 260, headerClassName: 'text-center', className: 'text' },
    {
      Header: "date_right_expire", accessor: "c32", show: true, width: 165, headerClassName: 'text-center', className: 'text-center',
      Cell: cellInfo => <>{cellInfo.original.c32 === '' || cellInfo.original.c32 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c32}</span>}</>
    },
    { Header: "common_note", accessor: "c31", show: true, width: 400, headerClassName: 'text-left' }
  ]
  transTitle(item) {
    return { Header: this.props.t(item.Header), accessor: item.accessor, show: item.show, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, width: item.width };
  }

  render() {
    const arrayTitle = this.state.columns.map(item => this.transTitle(item));
    return (
      <div className="" style={{ overflowY: 'auto' }}>
        <table className="table-sm table tablenowrap table-bordered table-striped table_sticky">
          <thead className="header">
            <tr>
              {arrayTitle.map((item, inđex) =>
                <th style={{ verticalAlign: 'middle', zIndex: 9 }} className="text-center">
                  {item.Header}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {this.props.data.length ? this.props.data.map((item, index) =>
              <tr>
                <td className="text-center" style={{ verticalAlign: 'middle' }}>
                  {index + 1}
                </td>
                {
                  Object.keys(item).map((key, index) =>
                    <td className="text-center" style={{ verticalAlign: 'middle' }}>
                      {item[key]}
                    </td>
                  )
                }
              </tr>
            ) : <tr></tr>}
          </tbody>
        </table>
      </div>
    )
  }
}

export default translate('translations')(Table);