import PropTypes from 'prop-types';
import React, { PureComponent} from 'react';
import SparklinesLine from './SparklinesLine';
import SparklinesReferenceLine from './SparklinesReferenceLine';
import DataToPoints from './dataProcessing/dataToPoints';

class Sparklines extends PureComponent {

    static propTypes = {
        data: PropTypes.array,
        limit: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        svgWidth: PropTypes.number,
        svgHeight: PropTypes.number,
        preserveAspectRatio: PropTypes.string,
        margin: PropTypes.number,
        style: PropTypes.object,
        min: PropTypes.number,
        max: PropTypes.number,
        onMouseMove: PropTypes.func
    };

    static defaultProps = {
        data: [],
        width: 240,
        height: 60,
        //Scale the graphic content of the given element non-uniformly if necessary such that the element's bounding box exactly matches the viewport rectangle.
        preserveAspectRatio: 'none', //https://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
        margin: 2
    };

    constructor (props) {
        super(props);
    }

    render() {
        let {  data, limit, width, height, svgWidth, svgHeight, preserveAspectRatio, margin, style, max, min} = this.props;
        if (data.length === 0) data = [0,0,0,0,0,0,0];

        const points = DataToPoints( data, limit, width, height, margin, max, min );
        const ypoints = points.map(p => p.y)[0];
        const svgOpts = { style: style, viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: preserveAspectRatio };
        if (svgWidth > 0) svgOpts.width = svgWidth;
        if (svgHeight > 0) svgOpts.height = svgHeight;

        return (
            <svg {...svgOpts}>
                {
                    React.Children.map(this.props.children, function(child) {
                        return React.cloneElement(child, { data, points, width, height, margin, ypoints });
                    })
                }
            </svg>
        );
    }
}

export { Sparklines, SparklinesLine, SparklinesReferenceLine }
