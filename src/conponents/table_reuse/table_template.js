// Tạo các template table ở đây

const TABLE_TEMPLATE_01 = {
    headCells : [
        { id: 'c1', numeric: false, disablePadding: true, label: 'Dessert (100g serving)' },
        { id: 'c2', numeric: true, disablePadding: false, label: 'Calories' },
        { id: 'c3', numeric: true, disablePadding: false, label: 'Fat (g)' },
        { id: 'c4', numeric: true, disablePadding: false, label: 'Carbs (g)' },
        { id: 'c5', numeric: true, disablePadding: false, label: 'Protein (g)' },
    ],
    rowAttr: [
        {
            rowid: 'c1',

        }
    ]
}


export default {
    TABLE_TEMPLATE_01
}