import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import api from "../services/api";

function Pedidos() {
  const { cart, increase, decrease, removeFromCart, setCart } = useContext(CartContext);

  const [cliente, setCliente] = useState({
    nome_cliente: "",
    telefone: ""
  });

const total = cart.reduce(
  (acc, item) =>
    acc + (item.produto?.preco || 0) * item.quantidade,
  0
);

  const estoqueInsuficiente = cart.some(item => {
    const estoque = item.produto.estoques?.find(
      e => e.tamanho === item.tamanho
    );
    return !estoque || item.quantidade > estoque.quantidade;
  });

  async function finalizarPedido() {
    if (estoqueInsuficiente) {
      alert("Existe item com estoque insuficiente");
      return;
    }

    try {
      await api.post("pedidos/", {
        nome_cliente: cliente.nome_cliente,
        telefone: cliente.telefone,
        itens: cart.map(item => ({
          produto: item.produto.id,
          tamanho: item.tamanho,
          quantidade: item.quantidade
        }))
      });

      alert("Pedido realizado com sucesso!");
      setCart([]);
    } catch (error) {
      alert("Erro ao finalizar pedido");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Seu Carrinho</h1>

      {cart.length === 0 && (
        <p className="text-gray-500">Carrinho vazio</p>
      )}

      {cart.map((item, index) => {
        const estoque = item.produto?.estoques?.find(
          e => e.tamanho === item.tamanho
        );

        const semEstoque = !estoque || item.quantidade > estoque.quantidade;

        return (
          <div
            key={index}
            className="bg-white shadow-md rounded-2xl p-4 mb-4 flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold text-lg">
                {item.produto.nome}
              </h2>
              <p className="text-sm text-gray-600">
                Tamanho: {item.tamanho}
              </p>
              <p className="text-sm">
                R$ {Number(item.produto?.preco || 0).toFixed(2)}
              </p>

              {semEstoque && (
                <p className="text-red-500 text-sm">
                  Estoque insuficiente
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => decrease(item.produto.id, item.tamanho)}
                className="px-3 py-1 bg-gray-200 rounded-lg"
              >
                −
              </button>

              <span>{item.quantidade}</span>

              <button
                onClick={() => increase(item.produto.id, item.tamanho)}
                className="px-3 py-1 bg-gray-200 rounded-lg"
              >
                +
              </button>

              <button
                onClick={() => removeFromCart(item.produto.id, item.tamanho)}
                className="ml-4 text-red-500"
              >
                Remover
              </button>
            </div>
          </div>
        );
      })}

      {cart.length > 0 && (
        <>
          <div className="mt-6 text-xl font-bold">
            Total: R$ {total.toFixed(2)}
          </div>

          <div className="mt-4 space-y-3">
            <input
              className="w-full border p-2 rounded-lg"
              placeholder="Seu Nome"
              onChange={e =>
                setCliente({ ...cliente, nome_cliente: e.target.value })
              }
            />

            <input
              className="w-full border p-2 rounded-lg"
              placeholder="Telefone"
              onChange={e =>
                setCliente({ ...cliente, telefone: e.target.value })
              }
            />

            <button
              onClick={finalizarPedido}
              disabled={estoqueInsuficiente}
              className={`w-full py-3 rounded-xl text-white font-semibold ${
                estoqueInsuficiente
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Finalizar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Pedidos;