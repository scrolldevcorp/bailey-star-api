import { Product } from "../../../domain/entities/product.entity";

interface FormattedProductPriceInfo {
  wholesaleBs?: number | null;
  retail?: number | null;
  wholesaleUsd?: number | null;
}

interface SearchProductItem {
  id: string;
  code: string | null;
  reference: string | null;
  description: string | null;
  stock: number | string | null;
  wholesale_price_bs?: number | null;
  retail_price?: number | null;
  wholesale_price_usd?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export function formatProductSearchResults(products: Product[] | SearchProductItem[], maxItems: number = 5): string {
  if (!products || products.length === 0) {
    return "No se encontraron productos para mostrar.";
  }
  const limited = products.slice(0, maxItems);
  console.log(JSON.stringify(products, null, 2))
  const lines = limited.map((p, index) => {
    const anyProduct = p as any;

    const description = (anyProduct.description ?? "").trim() || "Sin descripción";
    const stock = anyProduct.stock

    // ⚠️ CAMBIO AQUÍ: Convertir a número con parseFloat para asegurar que sea number
    const prices: FormattedProductPriceInfo = {
      wholesaleBs: parseNumber(anyProduct.wholesale_price_bs ?? anyProduct.prices?.wholesaleBs),
      retail: parseNumber(anyProduct.retail_price ?? anyProduct.prices?.retail),
      wholesaleUsd: parseNumber(anyProduct.wholesale_price_usd ?? anyProduct.prices?.wholesaleUsd),
    };

    const priceParts: string[] = [];

    if (prices.retail != null) {
      priceParts.push(`detalle: $${prices.retail.toFixed(2)}`);
    }
    if (prices.wholesaleBs != null) {
      priceParts.push(`mayor: ${prices.wholesaleBs.toFixed(2)} Bs`);
    }
    if (prices.wholesaleUsd != null) {
      priceParts.push(`mayor: $${prices.wholesaleUsd.toFixed(2)}`);
    }

    const priceText = priceParts.length > 0 ? priceParts.join(" | ") : "precio no disponible";
    const stockText = stock !== undefined ? `📦 ${stock}` : "stock no disponible";

    return `#️⃣ ${index + 1}. ${description}
   ${priceText} | ${stockText}`;
  });

  const remaining = products.length - limited.length;
  const header = products.length === 1
    ? "✅ Encontré 1 producto que puede servirte:\n\n"
    : `✅ Encontré ${products.length} productos, te muestro los más relevantes:\n\n`;

  const footer = remaining > 0
    ? `\n...y ${remaining} más. Si quieres, aclara mejor lo que buscas para afinar la lista.`
    : "";

  return header + lines.join("\n\n") + footer;
}

// ✨ Función helper para convertir string/number a number o null
function parseNumber(value: any): number | null {
  if (value == null) return null;
  
  // Si ya es número, retornarlo
  if (typeof value === 'number') return value;
  
  // Si es string, intentar parsearlo
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}