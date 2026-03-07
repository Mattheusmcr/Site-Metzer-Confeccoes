import { useState } from "react";
import api from "../services/api";

function Toast({ mensagem, tipo }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg text-white text-sm font-medium transition-all
      ${tipo === "sucesso" ? "bg-green-600" : "bg-red-500"}`}>
      {tipo === "sucesso" ? "✅ " : "❌ "}{mensagem}
    </div>
  );
}

function AdminProduto() {
  const [form, setForm] = useState({ nome: "", descricao: "", preco: "" });
  const [imagens, setImagens] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImagens(e) {
    const files = Array.from(e.target.files);
    setImagens(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  }

  function mostrarToast(mensagem, tipo) {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.preco) {
      mostrarToast("Preencha nome e preço.", "erro");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("nome", form.nome);
    formData.append("descricao", form.descricao);
    formData.append("preco", form.preco);
    imagens.forEach(img => formData.append("imagens", img));

    try {
      await api.post("produtos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      mostrarToast(`Produto "${form.nome}" cadastrado com sucesso! 🎉`, "sucesso");
      setForm({ nome: "", descricao: "", preco: "" });
      setImagens([]);
      setPreviews([]);
    } catch (error) {
      mostrarToast("Erro ao cadastrar produto. Tente novamente.", "erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} />}

      <h1 className="text-2xl font-bold mb-6">Cadastrar Produto</h1>

      <div className="flex flex-col gap-4">
        <input
          type="text" name="nome" placeholder="Nome do produto"
          value={form.nome} onChange={handleChange}
          className="border p-2 rounded"
        />
        <textarea
          name="descricao" placeholder="Descrição"
          value={form.descricao} onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number" name="preco" placeholder="Preço (ex: 129.90)"
          value={form.preco} onChange={handleChange}
          className="border p-2 rounded"
        />

        {/* UPLOAD MÚLTIPLAS IMAGENS */}
        <label className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer hover:border-black transition">
          <p className="text-sm text-gray-500 mb-1">
            Clique para selecionar imagens
          </p>
          <p className="text-xs text-gray-400">
            Você pode selecionar várias de uma vez
          </p>
          <input
            type="file" multiple accept="image/*"
            onChange={handleImagens} className="hidden"
          />
        </label>

        {/* PREVIEWS */}
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <img
                key={i} src={src}
                className="w-20 h-20 object-cover rounded border"
              />
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`py-3 rounded text-white font-semibold ${
            loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "Salvando..." : "Salvar Produto"}
        </button>
      </div>
    </div>
  );
}

export default AdminProduto;