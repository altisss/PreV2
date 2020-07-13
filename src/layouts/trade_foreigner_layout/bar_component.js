import React from 'react'
import FormatNumber from '../../conponents/formatNumber/FormatNumber'
import { translate } from 'react-i18next'
import { Bar } from 'react-chartjs-2'
import glb_sv from '../../utils/globalSv/service/global_service'

function compareBar(a, b) {
    if (Number(a.ChgRatio) < Number(b.ChgRatio)) {
        return -1
    }
    if (Number(a.ChgRatio) > Number(b.ChgRatio)) {
        return 1
    }
    return 0
}

const BarComponent = props => {
    const { t, barState = [] } = props

    const createBarData = barState => {
        const data = barState.slice()

        const datasets = []
        const data_temp_bar = data.slice()
        data_temp_bar.sort(compareBar)
        data_temp_bar.forEach((item, index) => {
            const obj = {
                label: item.StkCd,
                backgroundColor: getColorChart(item.CurrPri, item),
                data: [item.TradVol],
            }
            datasets.push(obj)
        })
        // datasets.sort(compareBar)
        return {
            labels: [''],
            datasets: datasets,
        }
    }

    const getColorChart = (value, item) => {
        if (item.REF) {
            if (item.FL && item.REF && value > 0 && value > item.FL && value < item.REF)
                return glb_sv.style[glb_sv.themePage].price_basic_less
            else if (value > 0 && value < item.CE && value > item.REF)
                return glb_sv.style[glb_sv.themePage].price_basic_over
            else if (value === 0 || value === item.REF) return glb_sv.style[glb_sv.themePage].price_basic_color
            else if (value > 0 && value === item.CE) return glb_sv.style[glb_sv.themePage].price_ceil_color
            else if (value > 0 && value === item.FL) return glb_sv.style[glb_sv.themePage].price_floor_color
        } else {
            return Number(item.ChgRatio) > 0
                ? glb_sv.style[glb_sv.themePage].price_basic_over
                : Number(item.ChgRatio) < 0
                ? glb_sv.style[glb_sv.themePage].price_basic_less
                : glb_sv.style[glb_sv.themePage].price_basic_color
        }
    }

    return (
        <Bar
            data={createBarData(barState)}
            height={null}
            options={{
                type: 'bar',
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    display: false,
                },
                plugins: {
                    datalabels: {
                        align: function(context) {
                            return context.dataset.data[0] > 0 ? 'end' : 'start'
                        },
                        anchor: function(context) {
                            return context.dataset.data[0] > 0 ? 'end' : 'start'
                        },
                        color: function(context) {
                            return context.dataset.backgroundColor
                        },
                        formatter: function(value, context) {
                            return context.dataset.data[0] > 0 ? context.dataset.label : ''
                        },
                        font: {
                            size: 9,
                        },
                    },
                },
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, values) {
                                    return FormatNumber(value)
                                },
                                mirror: true,
                            },
                            scaleLabel: {
                                display: true,
                                labelString: t('priceboard_total_value_trading') + ' (' + t('billion') + ')',
                                fontSize: 15,
                                fontColor: '#d0cece',
                                fontStyle: 'italic',
                            },
                            // stacked: true
                        },
                    ],
                    // xAxes: [{
                    //   stacked: true
                    // }],
                },
                tooltips: {
                    callbacks: {
                        title: function(tooltipItem, data) {
                            // console.log(data,tooltipItem)
                            return data.datasets[tooltipItem[0].datasetIndex].label
                        },
                        label: function(tooltipItem, data) {},
                        afterLabel: function(tooltipItem, data) {
                            const index = tooltipItem.datasetIndex
                            // var dataset = data['datasets'][0];
                            if (data.datasets[index].data[0] < 0)
                                return (
                                    t('priceboard_total_value_trading') +
                                    ' ' +
                                    t('priceboard_sell') +
                                    ': ' +
                                    FormatNumber(data.datasets[index].data[0] * -1, 2, 0)
                                )
                            return (
                                t('priceboard_total_value_trading') +
                                ' ' +
                                t('priceboard_buy') +
                                ': ' +
                                FormatNumber(data.datasets[index].data[0], 2, 0)
                            )
                        },
                    },
                    backgroundColor: '#FFF',
                    titleFontSize: 16,
                    titleFontColor: '#0066ff',
                    bodyFontColor: '#000',
                    bodyFontSize: 14,
                    displayColors: false,
                },
                aspectRatio: false,
            }}
        />
    )
}

export default translate('translations')(BarComponent)
