import React from "react";
import styled from 'styled-components'

const LayoutHeaderWrapper = styled.div`
    h5 {

    }
`

const LayoutHeader = (props) => {
    const { title } = props
    return (
        <LayoutHeaderWrapper className='row no-margin' style={{ marginBottom: 22, marginRight: 0 }} {...props}>
            <div className='col text-center'>
                <h5>{title}</h5>
            </div>
        </LayoutHeaderWrapper>
    )
}

export default LayoutHeader