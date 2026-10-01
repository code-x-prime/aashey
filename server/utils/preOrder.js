/**
 * Pre-Order helpers
 *
 * Pre-Order is a product-level toggle (Product.isPreOrderEnabled). When on,
 * that product can be purchased even with zero/insufficient stock — but
 * ONLY with online payment (Razorpay). Cash on Delivery is never allowed
 * for a cart that contains a pre-order item, because COD collects no money
 * upfront and pre-order's entire point is securing payment ahead of stock.
 *
 * An order that contains at least one pre-order item is flagged
 * `isPreOrder` and, once payment is captured, is placed in the PRE_ORDERED
 * status instead of the normal PROCESSING/PAID flow — it sits there (no
 * Shiprocket booking attempted) until the admin explicitly releases it via
 * releasePreOrder() once real stock is available.
 */

/**
 * Inspects cart items (each must include a `product` with `isPreOrderEnabled`,
 * and a `quantity` vs the variant's `quantity` in stock) and determines:
 *  - whether any item needs pre-order handling (out of stock AND the
 *    product allows pre-order)
 *  - which items are legitimately out of stock with pre-order NOT enabled
 *    (those should still block checkout — pre-order does not bypass stock
 *    checks for ordinary products)
 *
 * @param {Array<{ variant: { quantity: number }, product?: { isPreOrderEnabled?: boolean, name?: string }, quantity: number }>} items
 * @returns {{ hasPreOrderItems: boolean, outOfStockBlocking: Array<{ name: string }> }}
 */
export function evaluateCartForPreOrder(items) {
  let hasPreOrderItems = false;
  const outOfStockBlocking = [];

  for (const item of items) {
    const variant = item.variant || item.productVariant;
    const product = item.product || variant?.product;
    const available = variant?.quantity ?? 0;
    const requested = item.quantity;

    if (available >= requested) continue; // enough stock, nothing special

    if (product?.isPreOrderEnabled) {
      hasPreOrderItems = true;
    } else {
      outOfStockBlocking.push({ name: product?.name || "Item" });
    }
  }

  return { hasPreOrderItems, outOfStockBlocking };
}

/**
 * Marks each processed order item as pre-order or not, based on whether its
 * product allows pre-order and stock was insufficient at order time.
 */
export function markPreOrderFlag(variant, product, requestedQty) {
  const available = variant?.quantity ?? 0;
  return !!(product?.isPreOrderEnabled && available < requestedQty);
}
