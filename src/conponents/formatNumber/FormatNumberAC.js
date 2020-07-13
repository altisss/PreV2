// @flow weak

import React      from 'react';
import PropTypes  from 'prop-types';
export default class FormatNumberAC extends React.Component {

    caculateFormatNumber = (value, fractionSize, empty) => {

        const DECIMAL_SEPARATOR = '.';
        const THOUSANDS_SEPARATOR = ',';
        let [integer, fraction = ''] = (value || '').toString()
            .split('.');
        fraction = fractionSize > 0
            ? DECIMAL_SEPARATOR + (fraction + '000000').substring(0, fractionSize)
            : '';
        integer = (Number(integer) * 10).toString();
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
        if (value === undefined || value === null || value === 0 || value === 0.0 || value === 0.00) { 
            if (empty === 1) {return ''; }
            else return 0;
        } else return integer.substr(0, integer.length - 1) + fraction;
    }
    render() {
        return(this.caculateFormatNumber(this.props.value, this.props.fractionSize, this.props.empty))
    }
}
FormatNumberAC.propTypes = {
  value:  PropTypes.any,
  fractionSize:  PropTypes.number,
  empty: PropTypes.number
};

FormatNumberAC.defaultProps = {
  fractionSize:  0,
  empty: 1
};

