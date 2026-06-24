/** Bold/PayMatuByte: referencia alfanumérica, máximo 60 caracteres. */
export function buildPaymentReference(courseId: string, userId: string): string {
  const course = courseId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 16)
  const user = userId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 12)
  const ts = Date.now().toString(36)
  return `mc${course}${user}${ts}`.slice(0, 60)
}
