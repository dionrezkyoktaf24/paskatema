/**
 * QRIS (EMVCo Merchant-Presented QR): membuat QRIS dinamis (nominal terisi)
 * dari QRIS statis Paskatema. Logika parsing & CRC sama dengan backend
 * (web-paskatema/src/settings/qris.ts).
 *
 * Catatan: pembayaran tetap masuk ke rekening/merchant QRIS yang sama;
 * konfirmasi pembayaran tidak otomatis (dicek bendahara di aplikasi merchant).
 */

interface TlvField {
  tag: string;
  value: string;
}

/** CRC16-CCITT (poly 0x1021, init 0xFFFF), 4 digit hex huruf besar. */
export function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function parseTlv(payload: string): TlvField[] | null {
  const fields: TlvField[] = [];
  let i = 0;
  while (i < payload.length) {
    const tag = payload.slice(i, i + 2);
    const length = Number(payload.slice(i + 2, i + 4));
    if (!/^\d{2}$/.test(tag) || !Number.isInteger(length)) return null;
    const value = payload.slice(i + 4, i + 4 + length);
    if (value.length !== length) return null;
    fields.push({ tag, value });
    i += 4 + length;
  }
  return fields;
}

function tlv(tag: string, value: string): string {
  return `${tag}${String(value.length).padStart(2, "0")}${value}`;
}

/** Cek cepat di browser sebelum dikirim ke server (server memvalidasi ulang). */
export function isValidQris(payload: string): boolean {
  const text = payload.trim();
  const crcIndex = text.length - 8;
  return (
    text.startsWith("000201") &&
    text.slice(crcIndex, crcIndex + 4) === "6304" &&
    crc16(text.slice(0, crcIndex + 4)) === text.slice(crcIndex + 4) &&
    parseTlv(text) !== null
  );
}

/**
 * QRIS dinamis: tag 01 (point of initiation) jadi "12", nominal (tag 54)
 * disisipkan, lalu CRC dihitung ulang. `amount` dalam Rupiah (bilangan bulat).
 */
export function toDynamicQris(staticPayload: string, amount: number): string {
  const fields = parseTlv(staticPayload.trim());
  if (!fields) throw new Error("Kode QRIS tidak valid");
  if (!Number.isInteger(amount) || amount < 1 || String(amount).length > 13) {
    throw new Error("Nominal tidak valid");
  }

  const body = fields
    .filter((f) => f.tag !== "63" && f.tag !== "54")
    .map((f) => (f.tag === "01" ? { tag: "01", value: "12" } : f));

  // Tag disusun berurutan: nominal diletakkan setelah mata uang (53).
  const out: string[] = [];
  let inserted = false;
  for (const f of body) {
    if (!inserted && f.tag > "54") {
      out.push(tlv("54", String(amount)));
      inserted = true;
    }
    out.push(tlv(f.tag, f.value));
  }
  if (!inserted) out.push(tlv("54", String(amount)));

  const withoutCrc = out.join("") + "6304";
  return withoutCrc + crc16(withoutCrc);
}

/** Baca isi QR dari file gambar (QRIS statis yang diunggah bendahara). */
export async function decodeQrFromImage(file: File): Promise<string | null> {
  const { default: jsQR } = await import("jsqr");
  const bitmap = await createImageBitmap(file);
  // Perkecil gambar besar supaya cepat; QR tetap terbaca.
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  return jsQR(data, width, height)?.data ?? null;
}
