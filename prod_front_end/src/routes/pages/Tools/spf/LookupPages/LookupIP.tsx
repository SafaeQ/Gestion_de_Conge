import { useState, FC } from 'react'
import { Card, Form, Input, Button, message, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { CSVDownload } from 'react-csv'
import { isIP } from 'is-ip'
import json from 'jsonpipe'
import { Tool } from '../../../../../types'

const LookupIP: FC<{ tool: Tool; token: string }> = ({ tool, token }) => {
  const [form] = Form.useForm()
  const [download, setDownload] = useState(false)
  const [results, setResults] = useState<Array<Record<string, any>>>([])
  const [counter, setCounter] = useState(0)
  const [loading, setLoading] = useState(false)
  const getData = async (
    url: string,
    arr: Array<Record<string, any>>,
    body: string
  ) => {
    return await new Promise((resolve, reject) => {
      json.flow(url, {
        delimiter: '', // String. The delimiter separating valid JSON objects; default is "\n\n"
        success: function (domain) {
          // Do something with this JSON chunk
          arr.push(domain)
        },
        error: function (errorMsg) {
          // Something wrong happened, check the error message
          reject(errorMsg)
        },
        complete: function (statusText) {
          // Called after success/error, with the XHR status text
          resolve(statusText)
        },
        timeout: 600000, // Number. Set a timeout (in milliseconds) for the request
        method: 'POST', // String. The type of request to make (e.g. "POST", "GET", "PUT"); default is "GET"
        headers: {
          // Object. An object of additional header key/value pairs to send along with request
          Authorization: 'Bearer ' + token
        },
        data: body, // String | FormData | File | Blob. What to be sent in the request body.
        withCredentials: false,
        disableContentType: false // By default jsonpipe will set `Content-Type` to "application/x-www-form-urlencoded", you can set `disableContentType` to `true` to skip this behavior. Must set `true` if your `data` is not a string.
      })
    })
  }

  const onFinish = (values: any) => {
    const ips = values.ips.split('\n')
    if (Array.isArray(ips) && ips.every((ip) => isIP(ip))) {
      const arr: Array<Record<string, any>> = []
      setLoading(true)
      setDownload(false)
      setCounter(0)
      getData(`${tool.api_link}/lookup-ip`, arr, JSON.stringify(ips))
        .then(() => setLoading(false))
        .catch(() => {
          setLoading(false)
          setResults(arr)
          setCounter(arr.length)
          setDownload(true)
          setResults([])
        })
        .catch(() => {
          setLoading(false)
          setResults(arr)
          setCounter(arr.length)
          setDownload(true)
          setResults([])
        })
    } else {
      void message.error('Please enter valide ips')
    }
  }

  return (
    <div>
      {download && <CSVDownload data={results} target='_blank' />}
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
            <Button key={1} type='text' size='large'>
              <Tag style={{ fontSize: '20px', padding: '0.5rem' }} key={2}>
                Found {counter}
              </Tag>
            </Button>,
            <Button
              loading={loading}
              icon={<SearchOutlined />}
              key={0}
              type='primary'
              size='large'
              htmlType='submit'
            >
              Lookup IPs
            </Button>
          ]}
          title='Lookup By IPs'
          bordered={false}
          bodyStyle={{ padding: 40 }}
        >
          <Form.Item
            name='ips'
            rules={[
              {
                required: true,
                message: 'This field is required',
                whitespace: true
              }
            ]}
          >
            <Input.TextArea
              allowClear
              rows={15}
              size='large'
              placeholder='Enter IPs each in each line'
            />
          </Form.Item>
        </Card>
      </Form>
    </div>
  )
}

export default LookupIP
