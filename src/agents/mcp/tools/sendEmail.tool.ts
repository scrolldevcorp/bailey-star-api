import { z } from "zod";
import { McpTool } from "../../types/mcp-tool.types";
import { EmailService } from "../../services/email.service";
import { saleEmailTemplate } from "../utils/email-template.util";

export const sendSaleEmailTool: McpTool = {
  name: "sendSaleEmail",
  description: "Sends a sale confirmation email including product details and total price",
  parameters: z.object({
    phone: z.string().describe("Customer phone number"),
    products: z.array(
      z.object({
        id: z.string(),
        code: z.string().nullable(),
        reference: z.string().nullable(),
        description: z.string().nullable(),
        stock: z.number().nullable(),
        wholesale_price_bs: z.number().nullable().optional(),
        retail_price: z.number().nullable().optional(),
        wholesale_price_usd: z.number().nullable().optional(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
      })
    ).describe("List of purchased products with prices")
  }),

  execute: async (args: any, extra?: any) => {
    const { logger } = extra || {};
    
    try {
      const { phone, products } = args;

      // Instanciar servicio de correo
      const emailService = new EmailService();

      // Calcular total (en retail_price)
      const total = products.reduce((acc: number, p: any) => {
        const price = p.retail_price || 0;
        return acc + price;
      }, 0);

      logger?.info(`📦 Preparando correo de venta para ${phone}, total: ${total}`);

      // Generar HTML
      const html = saleEmailTemplate({
        customerEmail: 'keving28km@gmail.com',
        phone,
        products,
        total
      });

      // Enviar correo
      await emailService.sendEmail({
        to: 'keving28km@gmail.com',
        subject: "Confirmación de tu compra",
        html
      });

      return {
        success: true,
        message: "Correo de venta enviado correctamente",
        total
      };

    } catch (error) {
      logger?.error("❌ Error enviando correo de venta:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error enviando correo"
      };
    }
  }
};
