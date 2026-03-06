import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (produto, tamanho) => {
    setCart(prevCart => {
      const existing = prevCart.find(
        item =>
          item.produto.id === produto.id &&
          item.tamanho === tamanho
      );

      if (existing) {
        return prevCart.map(item =>
          item.produto.id === produto.id &&
          item.tamanho === tamanho
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...prevCart, { produto, tamanho, quantidade: 1 }];
    });
  };

  const increase = (produtoId, tamanho) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.produto.id === produtoId &&
        item.tamanho === tamanho
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );
  };

  const decrease = (produtoId, tamanho) => {
    setCart(prevCart =>
      prevCart
        .map(item =>
          item.produto.id === produtoId &&
          item.tamanho === tamanho
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter(item => item.quantidade > 0)
    );
  };

  const removeFromCart = (produtoId, tamanho) => {
    setCart(prevCart =>
      prevCart.filter(
        item =>
          !(
            item.produto.id === produtoId &&
            item.tamanho === tamanho
          )
      )
    );
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, increase, decrease, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
}