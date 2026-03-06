import { useState } from "react";
import api from "../services/api";

function AdminProduto() {
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem: null
  });

  function handleChange(e) {
    if (e.target.name === "imagem") {
      setForm({ ...form, imagem: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nome", form.nome);
    formData.append("descricao", form.descricao);
    formData.append("preco", form.preco);
    formData.append("imagem", form.imagem);

    try {
      await api.post("produtos/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Produto cadastrado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar produto");
    }
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Cadastrar Produto
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input
          type="text"
          name="nome"
          placeholder="Nome"
          onChange={handleChange}
          className="border p-2"
        />

        <textarea
          name="descricao"
          placeholder="Descrição"
          onChange={handleChange}
          className="border p-2"
        />

        <input
          type="number"
          name="preco"
          placeholder="Preço"
          onChange={handleChange}
          className="border p-2"
        />

        <input
          type="file"
          name="imagem"
          accept="image/*"
          onChange={handleChange}
          className="border p-2"
        />

        <button className="bg-black text-white p-2">
          Salvar Produto
        </button>

      </form>
    </div>
  );
}

export default AdminProduto;