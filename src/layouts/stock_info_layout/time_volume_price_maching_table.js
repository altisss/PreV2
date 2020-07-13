import React from 'react';
import { translate } from 'react-i18next';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import uniqueId from "lodash/uniqueId";

class TimeVolumePriceMachingTable extends React.Component {
    constructor(props) {
      super(props);
      this.component = this.props.component;
      this.state = {
        StockInfoExten: this.props.StockInfoExten,
        stkInfoMatching: this.props.stkInfoMatching
      };
  
      
      //-------- get Deep News -------
    }

    changeColorPrice = (value) => {
      let color = '';
      if (value > 0 && value > this.state.StockInfoExten.t333 && value < this.state.StockInfoExten.t260) color = 'price_basic_less';
      if (value > 0 && value < this.state.StockInfoExten.t332 && value > this.state.StockInfoExten.t260) color = 'price_basic_over';
      if (value === 0 || value === this.state.StockInfoExten.t260) color = 'price_basic_color';
      if (value > 0 && value === this.state.StockInfoExten.t332) color = 'price_ceil_color';
      if (value > 0 && value === this.state.StockInfoExten.t333) color = 'price_floor_color';
      return color;
    }


    render() {
        const { t } = this.props;

        const { StockInfoExten, stkInfoMatching } = this.props;

        return (
            //<div className="card stockInfoExtent" style={{ marginBottom: '5px' }}>
              //<div className="card-body widget-body" style={{ padding: 0 }}>
                <div className="table-responsive" id={this.component + "div_order_stkInfoMatching"} style={{ overflowY: 'auto', height: 288 }}>
                  <table className="tableStockInfo table_sticky table_priceboard_small table-bordered table-striped table_stk_info table-fix-width">
                    <thead>
                      <tr>
                        <th className="text-center">
                          {t('priceboard_time')}
                        </th>
                        <th className="text-center">
                          {t('priceboard_matching_quantity')}
                        </th>
                        <th className="text-center">
                          {t('priceboard_matching_price')}
                        </th>
                        <th className="text-center">
                          +/-
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stkInfoMatching.map(item =>
                        <tr key={uniqueId('stkInfoMatching')}>
                          <td className="text-center" style={{ verticalAlign: 'middle' }}>{item.c0}</td>
                          <td onClick={() => this.props.setnewPrice && this.props.setnewPrice(item.c1)} className="text-right cursor_ponter" style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(item.c1, 0, 1)}</td>
                          <td onClick={() => this.props.setnewPrice && this.props.setnewPrice(item.c2)} className={"text-right cursor_ponter " + this.changeColorPrice(item.c2)} style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(item.c2,0, 1)}</td>
                          <td className={"text-right " + this.changeColorPrice(item.c2)} style={{ verticalAlign: 'middle' }}>
                            {FormatNumber(item.c2 - StockInfoExten.t260, 0, 1)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              //</div>
            //</div>
        )
    }

}
export default translate('translations')(TimeVolumePriceMachingTable);
