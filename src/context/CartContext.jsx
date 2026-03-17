import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});

  // Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("SelectedServicePrices");
    setCart(stored ? JSON.parse(stored) : {});
  }, []);

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem("SelectedServicePrices", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (serviceId, priceObj) => {
    setCart((prev) => ({ ...prev, [serviceId]: priceObj }));
  };

  const removeFromCart = (serviceId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[serviceId];
      return newCart;
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
