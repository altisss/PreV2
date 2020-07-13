import PropTypes from 'prop-types';
import React from 'react';
// import dataToPoints from './dataProcessing/dataToPoints';
export default class SparklinesReferenceLine extends React.Component {

    static propTypes = {
        type: PropTypes.oneOf(['max', 'min', 'mean', 'avg', 'median', 'custom']),
        value: PropTypes.number,
        style: PropTypes.object
    };

    static defaultProps = {
        type: 'mean',
        style: { stroke: 'red', strokeOpacity: .75, strokeDasharray: '2, 2' }
    };

    render() {

        const { data, points, margin, type, style, value, ypoints } = this.props;

        return (
            <line
                x1={2} y1={ypoints + margin}
                x2={points[points.length - 1].x} y2={ypoints + margin}
                style={style} />
        )
    }
}
