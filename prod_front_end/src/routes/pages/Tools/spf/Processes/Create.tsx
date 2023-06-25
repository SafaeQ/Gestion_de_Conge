import { FC } from 'react'
import { Card, message, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useQueryClient } from 'react-query'
import type { DraggerProps } from 'antd/lib/upload'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../appRedux/store'
import { Tool, User } from '../../../../../types'
const { Dragger } = Upload

const CreateProcess: FC<{ tool: Tool; token: string }> = ({ tool, token }) => {
  const queryClient = useQueryClient()
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )
  const props: DraggerProps = {
    name: 'file',
    listType: 'picture',
    headers: {
      Authorization: 'Bearer ' + token
    },
    multiple: false,
    action: `${tool.api_link}/upload/${user?.id ?? 0}`,
    onChange(info) {
      const { status } = info.file
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        void message.success(`${info.file.name} file uploaded successfully.`)
        void queryClient.refetchQueries('processes')
      } else if (status === 'error') {
        void message.error(`${info.file.name} file upload failed.`)
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    }
  }

  return (
    <div>
      <Card title='New Process' bordered={false} bodyStyle={{ padding: 40 }}>
        <Dragger {...props}>
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>
            Click or drag file to this area to upload
          </p>
          <p className='ant-upload-hint'>Support for a single</p>
        </Dragger>
      </Card>
    </div>
  )
}

export default CreateProcess
