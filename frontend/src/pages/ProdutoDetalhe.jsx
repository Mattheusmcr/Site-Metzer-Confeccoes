"use client"

import { useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CartContext } from "../context/CartContext"

export default function ProdutoDetalhe() {

  const { id } = useParams() // 🔥 captura ID da URL
  const navigate = useNavigate()
  const { addToCart } = useContext(CartContext)

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("M")
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [imagemIndex, setImagemIndex] = useState(0)

  // 🔥 PRODUTO SIMULADO (depois vamos buscar do backend)
  const produto = {
    id,
    nome: "Camisa Polo Masculina Fio Tinto",
    preco: 129.90,
    imagens: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800"
    ]
  }

  // Medidas por tamanho
  const medidas = {
    P: {
      comprimento: "72 cm",
      largura: "54 cm",
      manga: "22 cm",
    },
    M: {
      comprimento: "75 cm",
      largura: "58 cm",
      manga: "23,5 cm",
    },
    G: {
      comprimento: "77 cm",
      largura: "60 cm",
      manga: "24 cm",
    },
    GG: {
      comprimento: "79 cm",
      largura: "63 cm",
      manga: "25 cm",
    },
  }

return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-10">

        {/* CARROSSEL */}
        <div className="relative">
          <img
            src={produto.imagens[imagemIndex]}
            className="w-full rounded-lg"
          />

          {produto.imagens.length > 1 && (
            <>
              <button
                onClick={() =>
                  setImagemIndex(
                    imagemIndex > 0
                      ? imagemIndex - 1
                      : produto.imagens.length - 1
                  )
                }
                className="absolute left-2 top-1/2 bg-white px-2"
              >
                ‹
              </button>

              <button
                onClick={() =>
                  setImagemIndex(
                    imagemIndex < produto.imagens.length - 1
                      ? imagemIndex + 1
                      : 0
                  )
                }
                className="absolute right-2 top-1/2 bg-white px-2"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-3xl font-semibold mb-4">
            {produto.nome}
          </h1>

          <p className="text-2xl font-bold mb-6">
            R$ {produto.preco}
          </p>

          {/* TAMANHOS */}
          <div className="flex gap-3 mb-4">
            {["P", "M", "G", "GG"].map((tamanho) => (
              <button
                key={tamanho}
                onClick={() => setTamanhoSelecionado(tamanho)}
                className={`border px-4 py-2 ${
                  tamanhoSelecionado === tamanho
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {tamanho}
              </button>
            ))}
          </div>

        {/* QUANTIDADE */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setQuantidade(q => q > 1 ? q - 1 : 1)}
              className="border px-3"
            >
              -
            </button>

            <span>{quantidade}</span>

            <button
              onClick={() => setQuantidade(q => q + 1)}
              className="border px-3"
            >
              +
            </button>
          </div>        

          {/* BOTÃO MEDIDAS */}
          <button
            onClick={() => setDrawerAberto(true)}
            className="underline text-sm mb-6"
          >
            Medidas e tamanhos
          </button>

          {/* BOTÃO COMPRAR */}
            <button
            onClick={() => {
              addToCart(produto, tamanhoSelecionado, quantidade)
              navigate("/pedidos")
            }}
            className="w-full bg-black text-white py-3"
          >
            Adicionar à sacola
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {drawerAberto && (
        <div
          onClick={() => setDrawerAberto(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* DRAWER LATERAL */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white z-50 shadow-xl transform transition-transform duration-300 ${
          drawerAberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Medidas - Tamanho {tamanhoSelecionado}
            </h2>
            <button
              onClick={() => setDrawerAberto(false)}
              className="text-xl"
            >
              ✕
            </button>
          </div>

          {/* IMAGEM ILUSTRATIVA */}
          <img
            src="https://hering.myvtex.com/api/dataentities/ET/documents/127a694a-63e5-11f0-b37f-f86067021982/image/attachments/3M9P-1ASN-T.jpg"
            alt="Guia de medidas"
            className="mb-6 rounded"
          />

          {/* MEDIDAS DINÂMICAS */}
          <div className="space-y-5 text-sm">
            <div>
              <p className="font-semibold">
                1 - Comprimento total:
              </p>
              <p>{medidas[tamanhoSelecionado].comprimento}</p>
            </div>

            <div>
              <p className="font-semibold">
                2 - Largura da peça:
              </p>
              <p>{medidas[tamanhoSelecionado].largura}</p>
            </div>

            <div>
              <p className="font-semibold">
                3 - Comprimento manga:
              </p>
              <p>{medidas[tamanhoSelecionado].manga}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

