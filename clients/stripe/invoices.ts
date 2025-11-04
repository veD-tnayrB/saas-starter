import Stripe from "stripe";

import { stripe } from "./client";

/**
 * Retrieve invoice from Stripe
 */
export async function retrieveInvoice(
  invoiceId: string,
): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return invoice;
  } catch (error) {
    console.error("Error retrieving invoice:", error);
    throw new Error("Failed to retrieve invoice");
  }
}

/**
 * List customer invoices
 */
export async function listInvoices(
  customerId: string,
): Promise<Stripe.Invoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
    });
    return invoices.data;
  } catch (error) {
    console.error("Error listing invoices:", error);
    throw new Error("Failed to list invoices");
  }
}

/**
 * Retrieve upcoming invoice
 */
export async function retrieveUpcomingInvoice(
  customerId: string,
): Promise<Stripe.UpcomingInvoice> {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: customerId,
    });
    return invoice;
  } catch (error) {
    console.error("Error retrieving upcoming invoice:", error);
    throw new Error("Failed to retrieve upcoming invoice");
  }
}
