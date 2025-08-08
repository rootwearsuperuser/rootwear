// app/components/ProductCard.js
'use client';

import { useState } from 'react';

export default function ProductCard({ name, price }) {
  const [clicked, setClicked] = useState(false);

  return (
    <div
      className={`bg-zinc-900 border border-green-500 p-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-green-500/50 hover:border-green-300 animate-fade-in-up ${clicked ? 'ring-2 ring-green-400' : ''}`}
      onClick={() => setClicked(true)}
    >
      <h3 className="text-xl font-bold text-green-300 mb-2">{name}</h3>
      <p className="text-green-500">${price.toFixed(2)}</p>
    </div>
  );
}

