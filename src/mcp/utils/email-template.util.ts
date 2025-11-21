export const saleEmailTemplate = ({
  customerEmail,
  phone,
  products,
}: {
  customerEmail: string;
  phone: string;
  products: any[];
}) => {
  const cleanPhone = phone.replace(/\D/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

  const whatsappBlock = whatsappUrl
    ? `<a href="${whatsappUrl}" style="display: inline-flex; align-items: center; gap: 4px; color: #10b981; text-decoration: none; font-weight: 500; font-size: 12px; margin-top: 4px;" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block;">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        WhatsApp
      </a>`
    : "";

  const formatAmount = (value: number | null | undefined) => {
    const safe = value ?? 0;
    return safe.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const rows = products
    .map((p) => {
      const quantity =
        typeof p.quantity === "number" && p.quantity > 0 ? p.quantity : 1;
      const unitPrice =
        typeof p.retail_price === "number" ? p.retail_price : 0;

      const code = p.code || "-";
      const description = p.description || "-";
      const reference = p.reference || "";

      return `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
            <div style="font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 2px;">${description}</div>
            <div style="font-size: 12px; color: #9ca3af;">
              ${code}${reference ? " · " + reference : ""}
            </div>
          </td>
          <td style="padding: 12px 16px; text-align: center; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; font-weight: 500;">
            ${quantity}
          </td>
          <td style="padding: 12px 16px; text-align: right; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #111827; font-weight: 600;">
            ${formatAmount(unitPrice)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="margin: 0; padding: 32px 16px;">
      <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px 24px 20px;">
          <div style="color: rgba(255, 255, 255, 0.9); font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;">
            Resumen de venta
          </div>
          <div style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">
            Registro de compra
          </div>
        </div>

        <!-- Customer Info -->
        <div style="padding: 20px 24px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Cliente</div>
              <div style="font-size: 14px; font-weight: 600; color: #111827;">${customerEmail}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Contacto</div>
              <div style="font-size: 14px; font-weight: 600; color: #111827;">${phone}</div>
              ${whatsappBlock}
            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div style="padding: 24px;">
          <div style="margin-bottom: 16px;">
            <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 4px;">
              Productos
            </div>
            <div style="font-size: 13px; color: #6b7280;">
              Detalle de los artículos incluidos en esta venta
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">
                  Producto
                </th>
                <th style="text-align: center; padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; width: 100px;">
                  Cantidad
                </th>
                <th style="text-align: right; padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; width: 140px;">
                  Precio unit.
                </th>
              </tr>
            </thead>
            <tbody style="background-color: #ffffff;">
              ${rows}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
          <div style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
            Este correo es un registro interno de la compra.<br>
            Generado automáticamente por el sistema.
          </div>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;
};