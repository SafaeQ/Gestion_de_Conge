import React from 'react'
import { Spin } from 'antd'
import { css } from '@emotion/css'
const Spinner: React.FC = () => (
  <div
    className={css`
      margin: 20px 0;
      margin-bottom: 20px;
      padding: 30px 50px;
      text-align: center;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
    `}
  >
    <Spin size='large' />
  </div>
)

export default Spinner
