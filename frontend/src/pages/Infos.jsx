function Infos() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-20">

      <h1 className="text-4xl font-bold mb-16">
        Informações
      </h1>

      {/* CONTATO */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Contato
        </h2>

        <p className="text-gray-700">
          WhatsApp: (27) 99885-3043
        </p>

        <p className="text-gray-700">
          Email: contato@metzker.com
        </p>

        <p className="text-gray-700">
          Atendimento de segunda a sexta.
        </p>
      </section>


      {/* ENVIO */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Envio
        </h2>

        <p className="text-gray-700">
          O prazo de entrega pode variar de acordo com o local e o método de envio.
          O prazo começa a contar após a confirmação do pagamento.
        </p>
      </section>


      {/* TROCAS */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Trocas e Devoluções
        </h2>

        <ul className="list-disc ml-6 text-gray-700 space-y-2">
          <li>Trocas podem ser solicitadas em até 7 dias após o recebimento.</li>
          <li>O produto deve estar sem uso e com etiqueta.</li>
          <li>Para solicitar troca ou devolução entre em contato pelo WhatsApp.</li>
        </ul>
      </section>


      {/* DEFEITO */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Produto com Defeito
        </h2>

        <p className="text-gray-700">
          Caso o produto apresente defeito de fabricação,
          entre em contato com nossa equipe enviando fotos
          do produto para análise.
        </p>
      </section>


      {/* LOCALIZAÇÃO */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Localização
        </h2>

        <p className="text-gray-700">
          Rua Tobias Barreto, 37
        </p>

        <p className="text-gray-700">
          Vila Velha - ES
        </p>

        <p className="text-gray-700">
          Brasil
        </p>
      </section>

    </div>
  );
}

export default Infos;