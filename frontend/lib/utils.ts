
export function formatPrice(price: number | string | undefined | null): string {
    if (price === undefined || price === null) return '0';
    const num = Number(price);
    if (isNaN(num)) return '0';
    return Math.round(num).toLocaleString('en-IN');
}
