import { useState } from 'react'

export const useLocalStorage = (
  key: string,
  initialValue: string
): [string, React.Dispatch<any>] => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item != null ? item : initialValue
    } catch (err) {
      console.error(err)
      return initialValue
    }
  })

  const setValue = (value: string) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, value)
    } catch (err) {
      console.error(err)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
