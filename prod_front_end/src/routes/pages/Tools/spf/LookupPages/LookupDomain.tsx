import { FC } from 'react'
import { Card, Form, Input, Button, Row, Col, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useMutation } from 'react-query'
import isValidDomain from 'is-valid-domain'
import axios from 'axios'
import LookupIP from './LookupIP'
import { Tool } from '../../../../../types'
import useLocalStorage from '../../../../../util/useLocalStorage'
import { downloadWithBearer } from '../../../../../util/Api'

const LookupDomain: FC<{ tool: Tool; token: string }> = ({ tool, token }) => {
  const [form] = Form.useForm<{ domains: string }>()
  const [filename, setValue] = useLocalStorage('filename', '')
  const startLookupMutation = useMutation<{ filename: string }, any, string[]>(
    async (domains) =>
      await axios
        .post(`${tool.api_link}/domain-lookup`, domains, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setValue(data?.filename ?? '')
        void message.success('Scanned Finished Download the file!')
      },
      onError: (error) => {
        if (error?.response?.data?.detail === 'Limit exceeded') {
          void message.error('600 domains Limit exceeded')
        } else {
          void message.error('Error While lunching scan Please try again')
        }
      }
    }
  )

  const onFinish = (values: { domains: string }) => {
    const domainsArray = values.domains.split('\n')
    if (
      Array.isArray(domainsArray) &&
      domainsArray.every((domain) => isValidDomain(domain))
    ) {
      if (domainsArray.length > 1000) {
        void message.error('You can scan 1000 domains max!')
      } else {
        startLookupMutation.mutate(domainsArray)
      }
    } else {
      void message.error('Please enter valide domains!')
    }
  }

  return (
    <div>
      <Row>
        <Col sm={24} lg={24}>
          <LookupIP token={token} tool={tool} />
        </Col>
      </Row>
      <Row>
        <Col lg={24} sm={24}>
          <Form
            form={form}
            name='add-group'
            labelAlign='left'
            colon={false}
            size='large'
            onFinish={onFinish}
            scrollToFirstError
          >
            <Card
              extra={[
                <Button
                  loading={startLookupMutation.isLoading}
                  icon={<SearchOutlined />}
                  key={0}
                  type='primary'
                  size='large'
                  htmlType='submit'
                >
                  Lookup Domains
                </Button>
              ]}
              title='Lookup Domains'
              bordered={false}
              bodyStyle={{ padding: 40 }}
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
                    downloadWithBearer(
                      `${tool.api_link}/${filename}`,
                      token
                    )
                  }
                  type='link'
                  danger
                >
                  {filename}
                </Button>
              </Card>
              <Form.Item
                extra={<div className='gx-mt-2'>Paste domain per line</div>}
                name='domains'
                rules={[
                  {
                    required: true,
                    message: 'This field is required',
                    whitespace: true
                  }
                ]}
              >
                <Input.TextArea
                  bordered
                  allowClear
                  rows={15}
                  size='large'
                  placeholder='Enter Domains each in each line'
                />
              </Form.Item>
            </Card>
          </Form>
        </Col>
      </Row>
    </div>
  )
}

export default LookupDomain
