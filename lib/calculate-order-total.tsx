interface OrderItem {
    total: number;
}

/**
 * Calculates the total amount from an array of order items
 *
 * @param items Array of order items with a total property
 * @returns The sum of all item totals
 */
export function calculateOrderTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.total, 0);
}