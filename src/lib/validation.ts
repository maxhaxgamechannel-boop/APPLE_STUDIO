export const LAST_ORDER_KEY = 'apple-studio-last-order'

export interface CheckoutForm {
  firstName: string
  lastName: string
  phone: string
  email: string
  city: string
  address: string
  delivery: 'courier' | 'express' | 'pickup'
  payment: 'card' | 'applepay' | 'invoice'
  comment: string
  agree: boolean
}

export type Errors = Partial<Record<keyof CheckoutForm, string>>

const NAME_RE = /^[\p{L}][\p{L}\s'’-]{1,49}$/u
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_CHARS_RE = /^\+?[\d\s()-]+$/

export function validate(f: CheckoutForm): Errors {
  const e: Errors = {}
  if (!f.firstName.trim()) e.firstName = 'Укажите имя'
  else if (!NAME_RE.test(f.firstName.trim())) e.firstName = 'Имя должно содержать только буквы'
  if (!f.lastName.trim()) e.lastName = 'Укажите фамилию'
  else if (!NAME_RE.test(f.lastName.trim())) e.lastName = 'Фамилия должна содержать только буквы'
  const digits = f.phone.replace(/\D/g, '')
  if (!f.phone.trim()) e.phone = 'Укажите номер телефона'
  else if (!PHONE_CHARS_RE.test(f.phone.trim()) || digits.length < 7 || digits.length > 15) e.phone = 'Введите номер в международном формате, например +49 151 2345 6789'
  if (!f.email.trim()) e.email = 'Укажите электронную почту'
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Проверьте адрес почты'
  if (!f.city.trim() || f.city.trim().length < 2) e.city = 'Укажите город'
  if (f.delivery !== 'pickup' && f.address.trim().length < 6) e.address = 'Укажите улицу, дом и индекс'
  if (!f.agree) e.agree = 'Подтвердите, что понимаете демонстрационный характер заказа'
  return e
}
