import { Button, message, Modal, Upload } from 'antd'
import { PaperClipOutlined } from '@ant-design/icons'
import { useQueryClient } from 'react-query'
import type { UploadProps } from 'antd/lib/upload'
import { useSelector } from 'react-redux'
import { RootState } from '../../../appRedux/store'
import { Topic, User } from '../../../types'
import { baseURL } from '../../../util/Api'
import { FC } from 'react'

const UploadFile: FC<{ selectedTopic: Topic }> = ({ selectedTopic }) => {
  const [modal, contextHolder] = Modal.useModal()
  const queryClient = useQueryClient()
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )
  const props: UploadProps = {
    name: 'file',
    withCredentials: true,
    multiple: false,
    data: {
      from: user?.id,
      to:
        selectedTopic.to.id === user?.id
          ? selectedTopic.from.id
          : selectedTopic.to.id
    },
    accept:
      'image/png,image/jpg,image/jpeg,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    action: `${baseURL}/conversations/upload/${selectedTopic.id}`,
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    },
    beforeUpload: (file: File) => {
      if (
        file.type.toLowerCase() !== 'image/png' &&
        file.type.toLowerCase() !== 'image/jpg' &&
        file.type.toLowerCase() !== 'image/jpeg' &&
        file.type.toLowerCase() !== 'text/plain' &&
        file.type.toLowerCase() !==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        file.type.toLowerCase() !== 'text/csv' &&
        file.type.toLowerCase() !== 'application/vnd.ms-excel'
      ) {
        modal.error({
          title: 'error',
          content: `${file.name} extention is not allowed`
        })
        return Upload.LIST_IGNORE
      }
      return true
    },
    onChange(info) {
      const { status } = info.file
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        void message.success(`${info.file.name} file uploaded successfully.`)
        void queryClient.refetchQueries('chatMessages')
      } else if (status === 'error') {
        void message.error(`${info.file.name} file upload failed.`)
      }
    }
  }

  return (
    <>
      <Upload {...props}>
        <Button type='dashed' shape="circle" icon={<PaperClipOutlined />}/>
      </Upload>
      {contextHolder}
    </>
  )
}

export default UploadFile
