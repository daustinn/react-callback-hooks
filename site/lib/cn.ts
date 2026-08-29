import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export default (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
