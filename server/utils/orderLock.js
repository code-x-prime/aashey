// Serialises work per order inside this process (the API runs as a single pm2 fork),
// so a payment-verify call and a webhook for the same order can't both book a shipment.
const tails = new Map();

export function withOrderLock(orderId, fn) {
    const prev = tails.get(orderId) || Promise.resolve();
    const run = prev.catch(() => {}).then(fn);
    const tail = run.catch(() => {});
    tails.set(orderId, tail);
    tail.then(() => { if (tails.get(orderId) === tail) tails.delete(orderId); });
    return run;
}
