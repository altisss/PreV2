import React, { useState, useEffect } from 'react';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';
import styled from 'styled-components'

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem auto;
    span {
        padding: 0 0.75rem;
    }
    input {
        width: 16rem !important;
    }
`

const ChangeFontSizeSlider = () => {

    const [value, setValue] = useState(14);
    useEffect(() => {
        document.getElementsByTagName('html')[0].style.fontSize = String(value) + 'px';
    }, [value])

    return (
        <Wrapper>
            <span style={{ fontSize: 12 }}>A </span>
            <RangeSlider
                value={Number(value)}
                onChange={changeEvent => setValue(changeEvent.target.value)}
                min={12}
                max={16}
                step={1}
                size={"sm"}
            // tooltip={"on"}
            />
            <span style={{ fontSize: 16 }}> A</span>
        </Wrapper>
    );

};

export default ChangeFontSizeSlider