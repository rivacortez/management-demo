export function formatPrice(price: number) {
    const priceFormatter = new Intl.NumberFormat("pe-PE", {
         style: "currency",
         currency: "PEN",
     })
 
     const finalPrice = priceFormatter.format(price);
     return finalPrice;
 }
 
 