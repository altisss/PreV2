function getIndexChartSidebar(index) {
    if (index == null) return {};
    const data = {};
    data.indexValue = index.indexValue;
    data.indexPercChang = index.indexPercChang;
    data.indexValueChang = index.indexValueChang;
    return data;

    
};

export {getIndexChartSidebar}