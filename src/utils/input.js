export const normalizePhoneInput = (value) => {
  if (value == null) return '';
  return String(value).replace(/\D/g, '').slice(0, 10);
};
