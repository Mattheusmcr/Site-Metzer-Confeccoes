import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Carrinho() {
  const { cart, removeFromCart, increase, decrease } = useContext(CartContext);

  const total = cart.reduce(
    (acc, item) => acc + parseFloat(item.produto.preco) * item.quantidade,
    0
  );

  function enviarWhatsApp() {
    if (cart.length === 0) {
      alert("Carrinho vazio!");
      return;
    }

    const mensagem = cart
      .map(
        (item) =>
          `${item.produto.nome} - Tamanho: ${item.tamanho} - ${item.quantidade}x - R$ ${(
            parseFloat(item.produto.preco) * item.quantidade
          ).toFixed(2)}`
      )
      .join("%0A");

    const textoFinal = `Olá, gostaria de fazer um pedido:%0A${mensagem}%0A%0ATotal: R$ ${total.toFixed(2)}`;
    window.open(`https://wa.me/5527997878391?text=${textoFinal}`);
  }

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Seu Carrinho</h1>

      {cart.length === 0 && (
        <p className="text-gray-500">Carrinho vazio.</p>
      )}

      {cart.map((item, index) => (
        <div
          key={index}
          className="flex justify-between items-center mb-4 border-b pb-4"
        >
          <div>
            <p className="font-semibold">{item.produto.nome}</p>
            <p className="text-sm text-gray-500">Tamanho: {item.tamanho}</p>
            <p className="text-sm">
              R$ {parseFloat(item.produto.preco).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => decrease(item.produto.id, item.tamanho)}
              className="px-3 py-1 bg-gray-200"
            >
              −
            </button>
            <span>{item.quantidade}</span>
            <button
              onClick={() => increase(item.produto.id, item.tamanho)}
              className="px-3 py-1 bg-gray-200"
            >
              +
            </button>
            <button
              onClick={() => removeFromCart(item.produto.id, item.tamanho)}
              className="ml-4 text-red-500 text-sm"
            >
              Remover
            </button>
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">
            Total: R$ {total.toFixed(2)}
          </h2>

          <button
            onClick={enviarWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 font-semibold"
          >
            Finalizar pelo WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}

export default Carrinho;