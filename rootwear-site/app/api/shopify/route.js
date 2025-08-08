// app/api/shopify/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const products = [
    {
      id: '1',
      title: 'Hack Hoodie',
      image: '/images/hack-hoodie.png',
      price: '$49',
      handle: '/product/hack-hoodie'
    },
    {
      id: '2',
      title: 'Terminal Tee',
      image: '/images/terminal-tee.png',
      price: '$29',
      handle: '/product/terminal-tee'
    },
    {
      id: '3',
      title: 'Shell Cap',
      image: '/images/shell-cap.png',
      price: '$25',
      handle: '/product/shell-cap'
    }
  ];

  return NextResponse.json({ products });
}
