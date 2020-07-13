import React, { useState, useEffect } from 'react'
import FormatNumber from '../../conponents/formatNumber/FormatNumber'
import { translate } from 'react-i18next'
import { Bubble } from 'react-chartjs-2'
import glb_sv from '../../utils/globalSv/service/global_service'
import { max } from 'lodash'

function compareBar(a, b) {
    if (Number(a.ChgRatio) < Number(b.ChgRatio)) {
        return -1
    }
    if (Number(a.ChgRatio) > Number(b.ChgRatio)) {
        return 1
    }
    return 0
}

const BubbleComponent = props => {
    const { t, bubbleState = [] } = props
    //const [dataBubble, setDataBubble] = useState({label: [''], datasets: []});

    let renderData = {}
    const createBubbleData = bubbleState => {
        const data = bubbleState.slice()
        data.sort(compareBar)
        const objValuesOverZero = data.map(item => {
            return Number(item.Cap)
        })
        const maxValue = max(objValuesOverZero)

        const range = [5, 20]
        const datasetsBubble = data.map((item, index) => {
            return {
                label: item.StkCd,
                data: [
                    {
                        x: index + 1,
                        y: Number(item.TradVal),
                        r: scaleRadius(Number(item.Cap), maxValue, range),
                    },
                ],
                backgroundColor: getColorChart(item.CurrPri, item),
            }
        })
        return {
            label: [''],
            datasets: datasetsBubble,
        }
    }

    const scaleRadius = (value, maxValue, range) => {
        const tl = (value / maxValue) * range[1]
        if (tl >= range[0]) return tl
        else return range[0]
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
        <Bubble
            data={createBubbleData(bubbleState)}
            height={null}
            options={{
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    display: false,
                },
                plugins: {
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: 'gray',
                        font: {
                            size: 9,
                        },
                        formatter: function(value, context) {
                            return context.dataset.label
                        },
                    },
                },
                maintainAspectRatio: false,
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
                        },
                    ],
                    xAxes: [
                        {
                            display: false,
                            ticks: {
                                min: -5,
                                max: createBubbleData(bubbleState).datasets.length < 55 ? 52 : 102,
                            },
                        },
                    ],
                },
                tooltips: {
                    callbacks: {
                        title: function(tooltipItem, data) {
                            // console.log(data,tooltipItem)
                            const index = tooltipItem[0].datasetIndex
                            return data.datasets[index].label
                        },
                        label: function(tooltipItem, data) {},
                        afterLabel: function(tooltipItem, data) {
                            const index = tooltipItem.datasetIndex
                            return (
                                t('priceboard_total_value_trading') +
                                ': ' +
                                FormatNumber(data.datasets[index].data[0].y, 2, 0) +
                                ' (' +
                                t('billion') +
                                ')'
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

export default BubbleComponent
