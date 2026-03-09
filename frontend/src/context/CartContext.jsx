import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Adiciona ao carrinho com quantidade EXATA (não soma se já existir)
  // Se o item já existir com mesmo produto+tamanho, SUBSTITUI a quantidade
  function addToCart(produto, tamanho, quantidade) {
    setCart(prev => {
      const existe = prev.find(
        item => item.produto.id === produto.id && item.tamanho === tamanho
      );
      if (existe) {
        // Substitui a quantidade (não soma) — comportamento correto para "Comprar agora"
        return prev.map(item =>
          item.produto.id === produto.id && item.tamanho === tamanho
            ? { ...item, quantidade: quantidade }
            : item
        );
      }
      return [...prev, { produto, tamanho, quantidade }];
    });
  }

  function increase(produtoId, tamanho) {
    setCart(prev =>
      prev.map(item =>
        item.produto.id === produtoId && item.tamanho === tamanho
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );
  }

  function decrease(produtoId, tamanho) {
    setCart(prev =>
      prev
        .map(item =>
          item.produto.id === produtoId && item.tamanho === tamanho
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter(item => item.quantidade > 0)
    );
  }

  function removeFromCart(produtoId, tamanho) {
    setCart(prev =>
      prev.filter(
        item => !(item.produto.id === produtoId && item.tamanho === tamanho)
      )
    );
  }

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, increase, decrease, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}