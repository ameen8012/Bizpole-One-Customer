import React, { useEffect, useState, useContext } from "react";
import { FaShoppingCart, FaTimes } from "react-icons/fa";
import { CartContext } from "../../context/CartContext";

const GlobalCart = () => {
  const { cart, removeFromCart } = useContext(CartContext);
  const [open, setOpen] = useState(false);

  // Calculate total
  const total = Object.values(cart).reduce((sum, item) => {
    const price = item?.TotalFee || item?.Price || 0;
    return sum + Number(price);
  }, 0);

  if (Object.keys(cart).length === 0) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-yellow-400 hover:bg-yellow-500 py-2 px-4 text-black rounded-full  flex items-center justify-center shadow-lg text-sm relative"
        title="View Cart"
      >
        <span className="font-normal">Selected Services   </span>
        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[24px] text-center">
          {Object.keys(cart).length}
        </span>
      </button>
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl p-5 mt-3 min-w-[320px] max-w-xs border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
             
            </h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
              <FaTimes size={14} />
            </button>
          </div>
          <ul className="divide-y divide-gray-100 mb-3">
            {Object.entries(cart).map(([id, item]) => (
              <li key={id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{item.ServiceName || item.Name || `Service #${id}`}</div>
                  <div className="text-xs text-gray-500">₹{item.TotalFee || item.Price}</div>
                </div>
                <button onClick={() => removeFromCart(id)} className="text-red-400 hover:text-red-600 ml-2">
                  <FaTimes size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t pt-3 mt-2">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-green-700">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalCart;
