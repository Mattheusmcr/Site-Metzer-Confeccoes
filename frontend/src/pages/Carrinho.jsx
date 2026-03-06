import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Carrinho() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  const total = cart.reduce((acc, item) => acc + parseFloat(item.preco), 0);

  const [carrinho, setCarrinho] = useState([]);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Seu Carrinho</h1>

      {cart.map((item, index) => (
        <div key={index} className="flex justify-between mb-4">
          <span>{item.nome}</span>
          <span>R$ {item.preco}</span>
          <button onClick={() => removeFromCart(index)}>Remover</button>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-6">
        Total: R$ {total.toFixed(2)}
      </h2>

      <button
        onClick={clearCart}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Limpar Carrinho
      </button>
    </div>
  );

function adicionarAoCarrinho(produto, tamanho) {
  const itemExistente = carrinho.find(
    item => item.produto.id === produto.id && item.tamanho === tamanho
  );

  if (itemExistente) {
    itemExistente.quantidade += 1;
    setCarrinho([...carrinho]);
  } else {
    setCarrinho([
      ...carrinho,
      { produto, tamanho, quantidade: 1 }
    ]);
  }
}

function removerItem(index) {
  const novoCarrinho = [...carrinho];
  novoCarrinho.splice(index, 1);
  setCarrinho(novoCarrinho);
}

function alterarQuantidade(index, valor) {
  const novoCarrinho = [...carrinho];
  novoCarrinho[index].quantidade = valor;
  setCarrinho(novoCarrinho);
}

const mensagem = carrinho.map(item =>
  `${item.produto.nome} - ${item.tamanho} - ${item.quantidade}x`
).join("%0A");

const link = `https://wa.me/5527997878391?text=${mensagem}`;
window.open(link);

}

export default Carrinho;