import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrder } from '@/lib/repos/order';
import { getSettings } from '@/lib/settings';
import { formatCurrency, formatDate, statusBadgeClass } from '@/lib/format';
import OrderStatusControl from '@/components/admin/order-status-control';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const order = await getOrder(Number(id));
  if (!order) notFound();

  const sys = await getSettings('system_settings').catch(() => null);
  const currency = sys?.currency || 'INR';

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">← All orders</Link>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Order #{order.id}</h1>
          <OrderStatusControl orderId={order.id} currentStatus={order.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">Placed {formatDate(order.date_added)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Items ({order.items.length})</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {order.items.length === 0 && <div className="p-5 text-sm text-slate-500">No items.</div>}
            {order.items.map((it) => (
              <div key={it.id} className="p-5 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white">{it.product_name}</div>
                  {it.variant_name && it.variant_name !== '0' && <div className="text-xs text-slate-500 mt-0.5">{it.variant_name}</div>}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <span>Qty: <span className="font-medium text-slate-900 dark:text-white">{it.quantity}</span></span>
                    <span>Price: {formatCurrency(it.discounted_price || it.price, currency)}</span>
                    <span>Subtotal: {formatCurrency(it.sub_total, currency)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(it.current_status)}`}>
                      {it.current_status || '—'}
                    </span>
                    {it.status_history.length > 1 && (
                      <span className="text-xs text-slate-500">({it.status_history.length} updates)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1 text-sm">
            <Row label="Subtotal" value={formatCurrency(order.total, currency)} />
            {Number(order.discount) > 0 && <Row label="Discount" value={`- ${formatCurrency(order.discount, currency)}`} />}
            {Number(order.promo_discount) > 0 && <Row label={`Promo (${order.promo_code})`} value={`- ${formatCurrency(order.promo_discount, currency)}`} />}
            {Number(order.delivery_charge) > 0 && <Row label="Delivery" value={formatCurrency(order.delivery_charge, currency)} />}
            {Number(order.wallet_balance) > 0 && <Row label="Wallet" value={`- ${formatCurrency(order.wallet_balance, currency)}`} />}
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
              <Row label={<span className="font-semibold text-slate-900 dark:text-white">Total payable</span>} value={<span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(order.final_total, currency)}</span>} />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <Card title="Customer">
            <div className="text-sm space-y-1">
              <div className="font-medium text-slate-900 dark:text-white">{order.customer || '—'}</div>
              {order.customer_email && <div className="text-slate-600 dark:text-slate-400">{order.customer_email}</div>}
              {order.mobile && <div className="text-slate-600 dark:text-slate-400">{order.mobile}</div>}
            </div>
          </Card>

          <Card title="Payment">
            <div className="text-sm space-y-1">
              <div className="text-slate-700 dark:text-slate-300 uppercase text-xs">{order.payment_method || '—'}</div>
              {order.payment_method?.toLowerCase() === 'cod' && (
                <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${order.is_cod_collected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                  {order.is_cod_collected ? 'collected' : 'pending'}
                </div>
              )}
            </div>
          </Card>

          {order.address && (
            <Card title="Shipping address">
              <div className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                <div className="font-medium text-slate-900 dark:text-white">{order.address.name}</div>
                <div>{order.address.mobile}</div>
                <div>{order.address.address}</div>
                <div>{[order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(', ')}</div>
                {order.address.landmark && <div className="text-xs text-slate-500">Near: {order.address.landmark}</div>}
              </div>
            </Card>
          )}

          {order.delivery_date && (
            <Card title="Delivery">
              <div className="text-sm text-slate-700 dark:text-slate-300">
                {formatDate(order.delivery_date, { dateStyle: 'medium' })}
                {order.delivery_time && <span className="text-slate-500"> · {order.delivery_time}</span>}
              </div>
            </Card>
          )}

          {order.notes && (
            <Card title="Notes">
              <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{order.notes}</div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}