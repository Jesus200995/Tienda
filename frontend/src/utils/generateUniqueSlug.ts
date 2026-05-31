// Genera un folio único tipo: EC-A7K9M2X4 o CAT-R2T5B9N1
export function generateUniqueSlug(prefix: string = 'EC'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I/O/0/1 para evitar confusión
  const timestamp = Date.now().toString(36).toUpperCase();
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${timestamp.slice(-4)}${random}`;
}
