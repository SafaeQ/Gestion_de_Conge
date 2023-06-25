import { useState, FC } from 'react'
import { Card, Input, Row, Col, Space, Button, message } from 'antd'
import { useMutation } from 'react-query'
import axios from 'axios'
import { Tool } from '../../../../../types'
import { downloadWithBearer } from '../../../../../util/Api'

const LookupTXT: FC<{ tool: Tool; token: string }> = ({ tool, token }) => {
  const [loading, setLoading] = useState(false)
  const [lastId, setLastId] = useState('')
  const [file, setFile] = useState('')
  const [count, setCount] = useState(0)
  const startLookupMutation = useMutation<any, unknown, string>(
    async (value) =>
      await axios
        .get(`${tool.api_link}/txt-lookup?q=${value}&id=${lastId}`, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setLoading(false)
        setFile(data?.filename ?? '')
        setCount(data.count)
      },
      onError: () => {
        setLoading(false)
        void message.error('Error While lunching scan Please try again')
      }
    }
  )

  return (
    <div>
      <Row>
        <Col lg={24} sm={24}>
          <Card
            title='Search In Database By Syntax'
            bordered={false}
            bodyStyle={{ padding: 40 }}
            extra={[
              <Space key={1}>
                <Input
                  onChange={(e) => setLastId(e.target.value.trim())}
                  type='text'
                  placeholder='LastId'
                />
              </Space>
            ]}
          >
            <Card
              title='Results'
              type='inner'
              bordered={false}
              bodyStyle={{ padding: 40 }}
            >
              <Button
                target='_blank'
                onClick={() =>
                  downloadWithBearer(`${tool.api_link}/download/${file}`, token)
                }
                type='link'
                danger
              >
                {file}
              </Button>
            </Card>
            <Input.Search
              suffix={
                <div style={{ fontSize: '1rem', padding: '0.3rem' }} key={0}>
                  {count} results
                </div>
              }
              onSearch={(value) => {
                void startLookupMutation.mutate(value)
                setLoading(true)
              }}
              loading={loading}
              bordered
              allowClear
              size='large'
              placeholder='Enter Regex Synthax'
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default LookupTXT
