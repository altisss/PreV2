import React, { useState, useEffect } from 'react'
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

    const createBubbleData = barState => {
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
            height={null}
            data={createBubbleData(barState)}
            options={{
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
                                labelString: t('priceboard_total_qtty_trading'),
                                fontSize: 15,
                                fontColor: '#d0cece',
                                fontStyle: 'italic',
                            },
                        },
                    ],
                },
                tooltips: {
                    callbacks: {
                        title: function(tooltipItem, data) {
                            return data.datasets[tooltipItem[0].datasetIndex].label
                        },
                        label: function(tooltipItem, data) {},
                        afterLabel: function(tooltipItem, data) {
                            const index = tooltipItem.datasetIndex
                            // var dataset = data['datasets'][0];
                            return (
                                t('priceboard_total_qtty_trading') + ': ' + FormatNumber(data.datasets[index].data[0])
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

export default BarComponent
