import { Button, message, Modal, Upload } from 'antd'
import { PaperClipOutlined } from '@ant-design/icons'
import { useQueryClient } from 'react-query'
import type { UploadProps } from 'antd/lib/upload'
import { useSelector } from 'react-redux'
import { RootState } from '../../../appRedux/store'
import { User } from '../../../types'
import { baseURL } from '../../../util/Api'
import { FC } from 'react'

const UploadFile: FC<{ ticketId: number }> = ({ ticketId }) => {
  const [modal, contextHolder] = Modal.useModal()
  const queryClient = useQueryClient()
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )

  const props: UploadProps = {
    name: 'file',
    withCredentials: true,
    multiple: false,
    style: {
      marginBottom: '1rem'
    },
    data: { ticketId },
    accept:
      'image/png,image/jpg,image/jpeg,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    action: `${baseURL}/messages/upload/${user?.id ?? 0}`,
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
        void queryClient.refetchQueries('getMessages')
      } else if (status === 'error') {
        void message.error(`${info.file.name} file upload failed.`)
      }
    }
  }

  return (
    <>
      <Upload {...props}>
        <Button type='dashed' icon={<PaperClipOutlined />}/>
      </Upload>
      {contextHolder}
    </>
  )
}

export default UploadFile
