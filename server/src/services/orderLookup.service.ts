import { getOrderItemByReference } from '../integrations/graph/orders.repository';
import { toPublicOrderDTO, type PublicOrderDTO } from '../integrations/graph/publicOrder.dto';

const MIN_LOOKUP_DURATION_MS = 300;

export class OrderLookupNotFoundError extends Error {
  constructor() {
    super('No matching order found');
    this.name = 'OrderLookupNotFoundError';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * §8: reference and email must both match. Every outcome — wrong reference, wrong email,
 * or a genuine not-found — takes the same code path to the same error, and every call is
 * padded to a minimum duration so response timing can't leak which field was wrong.
 */
export async function lookupOrder(reference: string, email: string): Promise<PublicOrderDTO> {
  const startedAt = Date.now();

  try {
    const item = await getOrderItemByReference(reference);

    if (!item || item.fields.CustomerEmail.toLowerCase() !== email.toLowerCase()) {
      throw new OrderLookupNotFoundError();
    }

    return toPublicOrderDTO(item);
  } finally {
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_LOOKUP_DURATION_MS) {
      await sleep(MIN_LOOKUP_DURATION_MS - elapsed);
    }
  }
}
