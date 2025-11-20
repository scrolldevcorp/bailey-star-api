export const saleEmailTemplate = ({
  customerEmail,
  phone,
  products,
  total
}: {
  customerEmail: string;
  phone: string;
  products: any[];
  total: number;
}) => {
  const rows = products
    .map(
      (p) => `
      <tr>
        <td>${p.code || "-"}</td>
        <td>${p.description || "-"}</td>
        <td style="text-align:right;">${p.retail_price ?? 0}</td>
      </tr>
    `
    )
    .join("");

  return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>🛒 Confirmación de compra</h2>
    <p><strong>Cliente:</strong> ${customerEmail}</p>
    <p><strong>Teléfono:</strong> ${phone}</p>

    <h3>Productos adquiridos:</h3>
    <table style="width:100%; border-collapse: collapse;" border="1">
      <thead>
        <tr>
          <th>Código</th>
          <th>Descripción</th>
          <th>Precio</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <h2>Total: <span style="color: green;">${total}</span></h2>

    <p>Gracias por tu compra 💚</p>
  </div>
  `;
};
