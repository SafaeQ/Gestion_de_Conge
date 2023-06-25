import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import { Button, Space, Input } from 'antd'
import { Dispatch, SetStateAction } from 'react'
import { ColumnType } from 'antd/lib/table/interface'

interface Controls<T> {
  handleSearch: (
    selectedKeys: string[],
    confirm: () => void,
    datakey: keyof T
  ) => void
  handleReset: (clearFilters: (() => void) | undefined) => void
  setSearchText: Dispatch<SetStateAction<string>>
  setSearchColumn: Dispatch<SetStateAction<string>>
  searchText: string
  searchedColumn: string
}

// this prop function used to search in antd table text based

export const getColumnSearchTextProps = <T,>(
  datakey: keyof T,
  controls: Controls<T>
): ColumnType<T> => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters
  }) => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder={`Search ${String(datakey)}`}
        value={selectedKeys[0]}
        onChange={(e) =>
          setSelectedKeys(e.target.value.length > 0 ? [e.target.value] : [])
        }
        onPressEnter={() =>
          controls.handleSearch(selectedKeys as string[], confirm, datakey)
        }
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          type='primary'
          onClick={() =>
            controls.handleSearch(selectedKeys as string[], confirm, datakey)
          }
          icon={<SearchOutlined />}
          size='small'
          style={{ width: 90 }}
        >
          Search
        </Button>
        <Button
          onClick={() => controls.handleReset(clearFilters)}
          size='small'
          style={{ width: 90 }}
        >
          Reset
        </Button>
        <Button
          type='link'
          size='small'
          onClick={() => {
            confirm({ closeDropdown: false })
            controls.setSearchText((selectedKeys as string[])[0])
            controls.setSearchColumn(String(datakey))
          }}
        >
          Filter
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
  ),
  onFilter: (value, record) => {
    return (record[datakey] as unknown as string)
      .toString()
      .toLowerCase()
      .includes((value as string).toLowerCase())
  },
  render: (text: string) =>
    controls.searchedColumn === datakey ? (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[controls.searchText]}
        autoEscape
        textToHighlight={text.length > 0 ? text : ''}
      />
    ) : (
      text
    )
})

// this prop function used to search in antd table of column object one depths
export const getColumnSearchOneDepthObjectProps = <
  T,
  TFristkey extends keyof T,
  TSecondKey extends keyof T[TFristkey]
>(
  baseDataKey: TFristkey,
  datakey: TSecondKey,
  controls: Controls<T>
): ColumnType<T> => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters
  }) => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder={`Search ${String(baseDataKey)}`}
        value={selectedKeys[0]}
        onChange={(e) =>
          setSelectedKeys(e.target.value.length > 0 ? [e.target.value] : [])
        }
        onPressEnter={() =>
          controls.handleSearch(selectedKeys as string[], confirm, baseDataKey)
        }
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          type='primary'
          onClick={() =>
            controls.handleSearch(
              selectedKeys as string[],
              confirm,
              baseDataKey
            )
          }
          icon={<SearchOutlined />}
          size='small'
          style={{ width: 90 }}
        >
          Search
        </Button>
        <Button
          onClick={() => controls.handleReset(clearFilters)}
          size='small'
          style={{ width: 90 }}
        >
          Reset
        </Button>
        <Button
          type='link'
          size='small'
          onClick={() => {
            confirm({ closeDropdown: false })
            controls.setSearchText((selectedKeys as string[])[0])
            controls.setSearchColumn(String(baseDataKey))
          }}
        >
          Filter
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
  ),
  onFilter: (value, record) =>
    record[baseDataKey]?.[datakey] !== undefined
      ? (record[baseDataKey][datakey] as unknown as string)
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase())
      : false,
  render: (text: string) =>
    controls.searchedColumn === baseDataKey ? (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[controls.searchText]}
        autoEscape
        textToHighlight={text.length > 0 ? text.toString() : ''}
      />
    ) : (
      text
    )
})

// this prop function used to search in antd table of column object two depths
export const getColumnSearchTwoDepthObjectProps = <
  T,
  TFristkey extends keyof T,
  TSecondKey extends keyof T[TFristkey],
  TThirdKey extends keyof T[TFristkey][TSecondKey]
>(
  baseDataKey: TFristkey,
  datakey: TSecondKey,
  datakey2: TThirdKey,
  controls: Controls<T>
): ColumnType<T> => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters
  }) => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder={`Search ${String(baseDataKey)}`}
        value={selectedKeys[0]}
        onChange={(e) =>
          setSelectedKeys(e.target.value.length > 0 ? [e.target.value] : [])
        }
        onPressEnter={() =>
          controls.handleSearch(selectedKeys as string[], confirm, baseDataKey)
        }
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          type='primary'
          onClick={() =>
            controls.handleSearch(
              selectedKeys as string[],
              confirm,
              baseDataKey
            )
          }
          icon={<SearchOutlined />}
          size='small'
          style={{ width: 90 }}
        >
          Search
        </Button>
        <Button
          onClick={() => controls.handleReset(clearFilters)}
          size='small'
          style={{ width: 90 }}
        >
          Reset
        </Button>
        <Button
          type='link'
          size='small'
          onClick={() => {
            confirm({ closeDropdown: false })
            controls.setSearchText((selectedKeys as string[])[0])
            controls.setSearchColumn(String(baseDataKey))
          }}
        >
          Filter
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
  ),
  onFilter: (value, record) =>
    record[baseDataKey]?.[datakey]?.[datakey2] !== undefined
      ? (record[baseDataKey][datakey][datakey2] as unknown as string)
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase())
      : false,
  render: (text: string) =>
    controls.searchedColumn === baseDataKey ? (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[controls.searchText]}
        autoEscape
        textToHighlight={text.length > 0 ? text.toString() : ''}
      />
    ) : (
      text
    )
})
