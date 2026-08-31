import type { Order } from './types';

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const money = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const invoiceNumber = (id: string) => `INV-${id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase()}`;

export function printInvoice(order: Order) {
  const popup = window.open('', '_blank', 'width=900,height=1000');
  if (!popup) {
    window.alert('Please allow pop-ups for AUREN to print the invoice.');
    return;
  }

  const date = new Date(order.created_at);
  const items = Array.isArray(order.items) ? order.items : [];
  const rows = items.map((item: any, index: number) => {
    const qty = Number(item.quantity || 0);
    const unitPrice = Number(item.price || 0);
    return `
      <tr>
        <td class="center">${index + 1}</td>
        <td>
          <div class="product-name">${escapeHtml(item.title)}</div>
          ${item.size ? `<div class="muted">Size: ${escapeHtml(item.size)}</div>` : ''}
        </td>
        <td class="center">${qty}</td>
        <td class="right">${money(unitPrice)}</td>
        <td class="right">${money(unitPrice * qty)}</td>
      </tr>`;
  }).join('');

  popup.document.open();
  popup.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(invoiceNumber(order.id))} — AUREN</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f4f4f2; color: #17191c; font-family: Arial, Helvetica, sans-serif; font-size: 12px; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 16mm; }
  .top { display: flex; justify-content: space-between; gap: 30px; border-bottom: 2px solid #17191c; padding-bottom: 16px; }
  .brand { font-size: 27px; font-weight: 800; letter-spacing: 2px; }
  .tagline { margin-top: 5px; color: #666; font-size: 11px; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { margin: 0; font-size: 25px; letter-spacing: 1px; }
  .invoice-title p { margin: 5px 0 0; color: #555; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 22px; }
  .box { border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
  .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #777; font-weight: 700; margin-bottom: 7px; }
  .strong { font-weight: 700; font-size: 13px; }
  .line { margin-top: 4px; line-height: 1.45; }
  .muted { color: #707070; font-size: 10px; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; margin-top: 22px; }
  th { background: #17191c; color: #fff; text-align: left; padding: 9px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; }
  td { border-bottom: 1px solid #e2e2e2; padding: 10px 8px; vertical-align: top; }
  .center { text-align: center; } .right { text-align: right; }
  .product-name { font-weight: 700; }
  .summary-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
  .summary { width: 290px; }
  .sum-row { display: flex; justify-content: space-between; padding: 6px 0; color: #555; }
  .sum-row.discount { color: #147a48; }
  .sum-row.total { border-top: 2px solid #17191c; margin-top: 4px; padding-top: 10px; font-size: 16px; color: #17191c; font-weight: 800; }
  .payment { margin-top: 20px; padding: 12px; background: #f7f7f5; border: 1px solid #e0e0dd; border-radius: 6px; }
  .footer { margin-top: 28px; border-top: 1px solid #ddd; padding-top: 12px; color: #666; font-size: 10px; line-height: 1.55; }
  .print-actions { position: sticky; top: 0; display: flex; justify-content: flex-end; gap: 8px; padding: 10px 0; background: #fff; }
  button { border: 0; border-radius: 5px; padding: 9px 14px; cursor: pointer; font-weight: 700; }
  .print { background: #17191c; color: #fff; } .close { background: #eee; color: #222; }
  @media print { body { background: #fff; } .page { margin: 0; padding: 0; width: auto; min-height: auto; } .print-actions { display: none; } }
</style></head>
<body>
<div class="page">
  <div class="print-actions"><button class="close" onclick="window.close()">Close</button><button class="print" onclick="window.print()">Print / Save PDF</button></div>
  <div class="top">
    <div><div class="brand">AUREN</div><div class="tagline">Fashion &amp; Apparel</div></div>
    <div class="invoice-title"><h1>TAX / RETAIL INVOICE</h1><p><b>${escapeHtml(invoiceNumber(order.id))}</b></p><p>${escapeHtml(date.toLocaleString('en-IN'))}</p></div>
  </div>

  <div class="grid">
    <div class="box"><div class="label">Seller</div><div class="strong">AUREN — Fashion &amp; Apparel</div><div class="line">Online Fashion Store</div><div class="muted">Thank you for shopping with AUREN.</div></div>
    <div class="box"><div class="label">Order Information</div><div class="line"><b>Order ID:</b> ${escapeHtml(order.id)}</div><div class="line"><b>Order Date:</b> ${escapeHtml(date.toLocaleDateString('en-IN'))}</div><div class="line"><b>Status:</b> ${escapeHtml(order.status)}</div><div class="line"><b>Payment:</b> Cash on Delivery (COD)</div></div>
    <div class="box"><div class="label">Bill To</div><div class="strong">${escapeHtml(order.full_name)}</div><div class="line">${escapeHtml(order.phone)}</div><div class="line">${escapeHtml(order.address)}</div><div class="line">${escapeHtml(order.pincode)}, India</div></div>
    <div class="box"><div class="label">Ship To</div><div class="strong">${escapeHtml(order.full_name)}</div><div class="line">${escapeHtml(order.phone)}</div><div class="line">${escapeHtml(order.address)}</div><div class="line">${escapeHtml(order.pincode)}, India</div></div>
  </div>

  <table><thead><tr><th style="width:45px">#</th><th>Product Description</th><th style="width:60px">Qty</th><th style="width:105px;text-align:right">Unit Price</th><th style="width:115px;text-align:right">Amount</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="center">No item details available</td></tr>'}</tbody></table>

  <div class="summary-wrap"><div class="summary">
    <div class="sum-row"><span>Subtotal</span><b>${money(order.subtotal)}</b></div>
    ${Number(order.discount) > 0 ? `<div class="sum-row discount"><span>Discount${order.coupon_code ? ` (${escapeHtml(order.coupon_code)})` : ''}</span><b>- ${money(order.discount)}</b></div>` : ''}
    <div class="sum-row"><span>Shipping</span><b>₹0.00</b></div>
    <div class="sum-row total"><span>Grand Total</span><span>${money(order.total)}</span></div>
  </div></div>

  <div class="payment"><b>Payment Method: Cash on Delivery (COD)</b><br><span class="muted">Amount payable on delivery: ${money(order.total)}</span></div>

  <div class="footer"><b>Terms &amp; Notes</b><br>
  • Please retain this invoice for your records and for any order-related support.<br>
  • Product availability, returns and cancellations are subject to the store's applicable policies.<br>
  • This invoice reflects the order information recorded at the time of purchase.<br>
  <br><b>Computer-generated invoice — no signature required.</b>
  </div>
</div>
</body></html>`);
  popup.document.close();
  popup.focus();
}
