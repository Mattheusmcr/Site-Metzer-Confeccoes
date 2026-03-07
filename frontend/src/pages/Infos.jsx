import { useTheme } from "../context/ThemeContext";

function Infos() {
  const { dark } = useTheme();

  return (
    <div className={`min-h-screen max-w-4xl mx-auto px-8 py-20 ${dark ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h1 className="text-4xl font-bold mb-16">Informações</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Contato</h2>
        <p className={dark ? "text-gray-300" : "text-gray-700"}>WhatsApp: (27) 99885-3043</p>
        <p className={dark ? "text-gray-300" : "text-gray-700"}>Email: contato@metzker.com</p>
        <p className={dark ? "text-gray-300" : "text-gray-700"}>Atendimento de segunda a sexta.</p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Envio</h2>
        <p className={dark ? "text-gray-300" : "text-gray-700"}>
          O prazo de entrega pode variar de acordo com o local e o método de envio.
          O prazo começa a contar após a confirmação do pagamento.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Trocas e Devoluções</h2>
        <ul className={`list-disc ml-6 space-y-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
          <li>Trocas podem ser solicitadas em até 7 dias após o recebimento.</li>
          <li>O produto deve estar sem uso e com etiqueta.</li>
          <li>Para solicitar troca ou devolução entre em contato pelo WhatsApp.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Produto com Defeito</h2>
        <p className={dark ? "text-gray-300" : "text-gray-700"}>
          Caso o produto apresente defeito de fabricação, entre em contato com nossa
          equipe enviando fotos do produto para análise.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Localização</h2>
        <p className={dark ? "text-gray-300" : "text-gray-700"}>Rua Tobias Barreto, 37</p>
        <p className={dark ? "text-gray-300" : "text-gray-700"}>Vila Velha - ES</p>
        <p className={dark ? "text-gray-300" : "text-gray-700"}>Brasil</p>
      </section>
    </div>
  );
}

export default Infos;