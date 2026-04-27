import { requireRole } from '@/lib/auth/require';

const SAMPLE = {
  app_name: 'eShop',
  home: 'Home',
  cart: 'Cart',
  checkout: 'Checkout',
  account: 'My Account',
  orders: 'Orders',
  search: 'Search',
  add_to_cart: 'Add to Cart',
  buy_now: 'Buy Now',
  out_of_stock: 'Out of Stock',
  login: 'Login',
  logout: 'Logout',
  register: 'Register',
  email: 'Email',
  password: 'Password',
};

export async function GET() {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  return new Response(JSON.stringify(SAMPLE, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="language-sample.json"',
    },
  });
}