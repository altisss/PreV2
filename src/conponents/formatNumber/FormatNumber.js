// @flow weak

// import React from 'react';
import PropTypes from 'prop-types';

const FormatNumber = ( value, fractionSize, empty, key ) => {
    if (value === undefined || value === null || value === 0 || value === 0.0 || value === 0.00 || value === '') {
        if (empty === 1) {return ''}
        else if (fractionSize  === 0) return '0'
        else if (fractionSize  === 1) return '0.0'
        else if (fractionSize  === 2) return '0.00'
        else if (fractionSize  === 3) return '0.000'
        return '0';
    }
    const DECIMAL_SEPARATOR = '.';
    const THOUSANDS_SEPARATOR = ',';
    let [integer, fraction = ''] = (value || '').toString()
        .split('.');
    fraction = fractionSize > 0
        ? DECIMAL_SEPARATOR + (fraction + '000000').substring(0, fractionSize)
        : '';
    // integer = (Number(integer) * 10).toString();
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);

    return integer.substr(0, integer.length) + fraction;
}

FormatNumber.propTypes = {
    value: PropTypes.any,
    fractionSize: PropTypes.number,
    empty: PropTypes.number
};

FormatNumber.defaultProps = {
    fractionSize: 0,
    empty: 1
};
export default FormatNumber;
