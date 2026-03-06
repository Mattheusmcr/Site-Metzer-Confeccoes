import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

function Catalogo() {

  const [produtos, setProdutos] = useState([]);
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState({});
  const [indexImagem, setIndexImagem] = useState({});
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    api.get("produtos/")
      .then(res => setProdutos(res.data))
      .catch(err => console.error(err));
  }, []);

  function handleSelecionarTamanho(produtoId, tamanho) {
    setTamanhosSelecionados(prev => ({
      ...prev,
      [produtoId]: tamanho
    }));
  }

  function handleAdicionar(produto) {
    const tamanho = tamanhosSelecionados[produto.id];

    if (!tamanho) {
      alert("Selecione um tamanho antes de adicionar.");
      return;
    }

    addToCart(produto, tamanho, 1);
  }

  return (
    <div className="bg-white min-h-screen px-6 md:px-16 py-12">

      <h1 className="text-3xl md:text-4xl font-light mb-12 text-center tracking-wide">
        Nosso Catálogo
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

        {produtos.map(produto => {

          const imagens = produto.imagens || [produto.imagem];
          const imagemAtual = imagens[indexImagem[produto.id] || 0];

          return (
            <div key={produto.id} className="group relative">

              {/* 🔥 LINK PARA DETALHE */}
              <Link to={`/produto/${produto.id}`}>

                <div className="relative overflow-hidden bg-gray-100">
                  <img
                    src={imagemAtual}
                    alt={produto.nome}
                    className="w-full h-[520px] object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* BOTÕES DO CARROSSEL */}
                  {imagens.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIndexImagem(prev => ({
                            ...prev,
                            [produto.id]:
                              (prev[produto.id] || 0) > 0
                                ? prev[produto.id] - 1
                                : imagens.length - 1
                          }));
                        }}
                        className="absolute left-2 top-1/2 bg-white px-2"
                      >
                        ‹
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIndexImagem(prev => ({
                            ...prev,
                            [produto.id]:
                              (prev[produto.id] || 0) < imagens.length - 1
                                ? (prev[produto.id] || 0) + 1
                                : 0
                          }));
                        }}
                        className="absolute right-2 top-1/2 bg-white px-2"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

              </Link>

              {/* INFORMAÇÕES */}
              <div className="mt-4 space-y-2">

                <Link to={`/produto/${produto.id}`}>
                  <h2 className="text-base font-medium hover:underline">
                    {produto.nome}
                  </h2>
                </Link>

                <p className="text-lg font-semibold">
                  R$ {Number(produto.preco).toFixed(2)}
                </p>

                {/* TAMANHOS */}
                <div className="flex gap-2 mt-2">
                  {["P", "M", "G", "GG"].map(tamanho => (
                    <button
                      key={tamanho}
                      onClick={() =>
                        handleSelecionarTamanho(produto.id, tamanho)
                      }
                      className={`border px-3 py-1 text-sm ${
                        tamanhosSelecionados[produto.id] === tamanho
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {tamanho}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleAdicionar(produto)}
                  className="w-full mt-4 bg-black text-white py-2"
                >
                  Adicionar ao Carrinho
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Catalogo;