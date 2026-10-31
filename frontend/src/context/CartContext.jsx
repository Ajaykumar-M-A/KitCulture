import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('kit_culture_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('kit_culture_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to local storage', e);
    }
  }, [cart]);

  const addToCart = (jersey, size = 'M', quantity = 1) => {
    setCart((prevCart) => {
      // Find matching item with same jersey id and size
      const existingIndex = prevCart.findIndex(
        (item) => item.jersey_id === jersey.id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const cartId = `${jersey.id}-${size}`;
      return [
        ...prevCart,
        {
          cartId,
          jersey_id: jersey.id,
          name: jersey.name,
          slug: jersey.slug,
          club: jersey.club_or_country,
          season: jersey.season,
          price: parseFloat(jersey.price),
          original_price: jersey.original_price ? parseFloat(jersey.original_price) : null,
          image_url: jersey.image_url,
          size,
          quantity,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalSavings = cart.reduce((sum, item) => {
    if (item.original_price && item.original_price > item.price) {
      return sum + (item.original_price - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        totalSavings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
