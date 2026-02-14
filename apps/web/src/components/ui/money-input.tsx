import {
  forwardRef,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { cn } from '~/lib/utils'

export type MoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'onBlur'
> & {
  loadedValue?: string | number
  onChange?: (value: number) => void
  onBlur?: (value: number) => void
}

const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, onChange, onBlur, loadedValue, ...props }, ref) => {
    const [inputValue, setInputValue] = useState('0,00')

    const formatCurrency = useCallback((rawValue: string) => {
      // Remove non-numeric characters
      const cleanedValue = rawValue.replace(/\D/g, '')

      // Ensure there is always a numeric value
      if (!cleanedValue) return '0,00'

      // Convert to decimal format (divide by 100)
      const numericValue = parseFloat(cleanedValue) / 100

      // Format the number with thousand separators and two decimals (BRL format)
      const formattedValue = numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

      return formattedValue
    }, [])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawInput = e.target.value

        const formattedValue = formatCurrency(rawInput)

        setInputValue(formattedValue)

        // Extrai o valor numérico e chama onChange
        const cleanedValue = rawInput.replace(/\D/g, '')

        if (cleanedValue) {
          const numericValue = parseFloat(cleanedValue) / 100

          onChange?.(numericValue)
        } else {
          onChange?.(0)
        }
      },
      [formatCurrency, onChange],
    )

    const handleBlur = useCallback(() => {
      const numericValue = parseFloat(
        inputValue.replace(/\./g, '').replace(',', '.'),
      )

      onBlur?.(numericValue)
    }, [inputValue, onBlur])

    useEffect(() => {
      if (loadedValue !== undefined && loadedValue !== null) {
        let value: string

        if (typeof loadedValue === 'string') {
          value = loadedValue
        } else {
          // Converte o valor numérico para string (em centavos)
          value = Math.round(loadedValue * 100).toString()
        }

        const formattedValue = formatCurrency(value)

        setInputValue(formattedValue)
      }
    }, [loadedValue, formatCurrency])

    return (
      <input
        type="text"
        inputMode="decimal"
        className={cn(
          'bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border border-gray-500 px-3 py-5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0,00"
        {...props}
      />
    )
  },
)

MoneyInput.displayName = 'MoneyInput'

export { MoneyInput }
