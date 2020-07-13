
const arrayMax = (data) => {
    return Math.max.apply(Math, data)
}

const arrayMin = (data) => {
    return Math.min.apply(Math, data);
}

const DataToPoints = ( data, limit, width = 1, height = 1, margin = 0) => {
    const max = arrayMax(data);
    const min = arrayMin(data);
    const len = data.length;

    if (limit && limit < len) {
        data = data.slice(len - limit);
    }

    const vfactor = (height - margin * 2) / ((max - min) || 2);
    const hfactor = (width - margin * 2) / ((limit || len) - (len > 1 ? 1 : 0));

    return data.map((d, i) => ({
        x: i * hfactor + margin,
        y: (max === min ? 1 : (max - d)) * vfactor + margin
    }));
};
export default DataToPoints;