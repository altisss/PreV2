import React from 'react';
// import glb_sv from '../../services/global_service';
// import NumberFormat from 'react-number-format';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
// import _ from 'lodash';
class TableRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: props.key,
      c0: props.item.c0,
      c1: props.item.c1,
      c2: props.item.c2
    }
  }

  componentDidMount() {}

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.key !== this.props.key
    );
  }

  componentWillReceiveProps(props) {
    if (this.state.key === props.key) { 
      this.setState({
        c0: props.item.c0,
        c1: props.item.c1,
        c2: props.item.c2
      });
    }
  }

  componentWillUnmount() {}

  changeColorPrice = (value) => {
    let color = '';
    if (value > 0 && value > this.props.StockInfoExten.t333 && value < this.props.StockInfoExten.t260) color = 'price_basic_less';
    if (value > 0 && value < this.props.StockInfoExten.t332 && value > this.props.StockInfoExten.t260) color = 'price_basic_over';
    if (value === 0 || value === this.props.StockInfoExten.t260) color = 'price_basic_color';
    if (value > 0 && value === this.props.StockInfoExten.t332) color = 'price_ceil_color';
    if (value > 0 && value === this.props.StockInfoExten.t333) color = 'price_floor_color';
    return color;
  }

  render() {
    return (
      <tr key={this.state.key}>
        <td className="text-center" style={{ verticalAlign: 'middle' }}>{this.state.c0}</td>
        <td onClick={() => this.props.setnewPrice(this.state.c2)} className="text-right" style={{ verticalAlign: 'middle' }}>
          {FormatNumber(this.state.c1, 0, 0)}</td>
        <td onClick={() => this.props.setnewPrice(this.state.c2)} className={"text-right cursor_ponter " + this.changeColorPrice(this.state.c2)} style={{ verticalAlign: 'middle' }}>
          {FormatNumber(this.state.c2)}</td>
        <td className={"text-right " + this.changeColorPrice(this.state.c2)} style={{ verticalAlign: 'middle' }}>
          {FormatNumber(this.state.c2 - this.props.StockInfoExten.t260)}</td>
      </tr>
    )
  }
}
export default TableRow;