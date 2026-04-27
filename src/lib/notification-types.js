export const CUSTOM_NOTIFICATION_TYPES = [
  { value: 'otp', label: 'Otp' },
  { value: 'place_order', label: 'Place Order' },
  { value: 'seller_place_order', label: 'Seller Place Order' },
  { value: 'ticket_status', label: 'Ticket Status' },
  { value: 'settle_cashback_discount', label: 'Settle Cashback Discount' },
  { value: 'settle_seller_commission', label: 'Settle Seller Commission' },
  { value: 'customer_order_received', label: 'Customer Order Received' },
  { value: 'customer_order_processed', label: 'Customer Order Processed' },
  { value: 'delivery_boy_order_processed', label: 'Delivery Boy Order Processed' },
  { value: 'customer_order_shipped', label: 'Customer Order Shipped' },
  { value: 'customer_order_delivered', label: 'Customer Order Delivered' },
  { value: 'customer_order_cancelled', label: 'Customer Order Cancelled' },
  { value: 'customer_order_returned', label: 'Customer Order Returned' },
  { value: 'delivery_boy_return_order_assign', label: 'Delivery Boy Return Order Assign' },
  { value: 'customer_order_returned_request_decline', label: 'Customer Order Returned Request Decline' },
  { value: 'customer_order_returned_request_approved', label: 'Customer Order Returned Request Approved' },
  { value: 'delivery_boy_order_deliver', label: 'Delivery Boy Order Deliver' },
  { value: 'wallet_transaction', label: 'Wallet Transaction' },
  { value: 'bank_transfer_receipt_status', label: 'Bank Transfer Receipt Status' },
  { value: 'bank_transfer_proof', label: 'Bank Transfer Proof' },
];

export const CUSTOM_NOTIFICATION_TYPE_LABEL = Object.fromEntries(
  CUSTOM_NOTIFICATION_TYPES.map((t) => [t.value, t.label])
);

// Recipients available per module (mirror of the PHP `notification_modules` config in eshop.php).
// Listing a recipient here means a checkbox cell is rendered for that column on the SMS Matrix.
export const NOTIFICATION_MODULES = [
  { key: 'otp', recipients: ['customer', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'place_order', recipients: ['customer', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'seller_place_order', recipients: ['seller', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'ticket_status', recipients: ['customer', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'settle_cashback_discount', recipients: ['customer', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'settle_seller_commission', recipients: ['seller', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'customer_order_received', recipients: ['customer', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'customer_order_processed', recipients: ['customer', 'delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'delivery_boy_order_processed', recipients: ['delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'customer_order_shipped', recipients: ['customer', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'customer_order_delivered', recipients: ['customer', 'delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'customer_order_cancelled', recipients: ['customer', 'delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'customer_order_returned', recipients: ['customer', 'seller', 'delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'delivery_boy_return_order_assign', recipients: ['delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'customer_order_returned_request_decline', recipients: ['customer', 'delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'customer_order_returned_request_approved', recipients: ['customer', 'delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'delivery_boy_order_deliver', recipients: ['customer', 'delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'wallet_transaction', recipients: ['customer', 'admin', 'seller', 'delivery_boy', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'bank_transfer_receipt_status', recipients: ['customer', 'notification_via_sms', 'notification_via_mail'] },
  { key: 'bank_transfer_proof', recipients: ['customer', 'admin', 'seller', 'notification_via_sms', 'notification_via_mail'] },
];

export const NOTIFICATION_MATRIX_COLUMNS = [
  { key: 'customer', label: 'Customer' },
  { key: 'admin', label: 'Admin' },
  { key: 'seller', label: 'Seller' },
  { key: 'delivery_boy', label: 'Delivery_boy' },
  { key: 'notification_via_sms', label: 'Notification_via_sms' },
  { key: 'notification_via_mail', label: 'Notification_via_mail' },
];

export const SMS_PLACEHOLDERS = [
  '{only_mobile_number}', '{mobile_number_with_country_code}', '{country_code}', '{message}', '{otp}',
];