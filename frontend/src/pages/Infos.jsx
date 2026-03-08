const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
};

function Divisor() {
  return <div style={{ borderTop: "2px solid " + t.borderForte, margin: "0 0 40px 0" }} />;
}

function Infos() {
  return (
    <div style={{ backgroundColor: t.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "896px", margin: "0 auto", padding: "80px 32px" }}>

        <h1 className="text-4xl font-bold mb-12" style={{ color: t.text }}>Informações</h1>

        <Divisor />

        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: t.textSecundario }}>Fale Conosco</p>
          <h2 className="text-xl font-semibold mb-4" style={{ color: t.text }}>Contato</h2>
          <p style={{ color: t.textSecundario }}>WhatsApp: (27) 99885-3043</p>
          <p style={{ color: t.textSecundario }}>Email: contato@metzker.com</p>
          <p style={{ color: t.textSecundario }}>Atendimento de segunda a sexta.</p>
        </section>

        <Divisor />

        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: t.textSecundario }}>Entrega</p>
          <h2 className="text-xl font-semibold mb-4" style={{ color: t.text }}>Envio</h2>
          <p style={{ color: t.textSecundario }}>
            O prazo de entrega pode variar de acordo com o local e o método de envio.
            O prazo começa a contar após a confirmação do pagamento.
          </p>
        </section>

        <Divisor />

        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: t.textSecundario }}>Política</p>
          <h2 className="text-xl font-semibold mb-4" style={{ color: t.text }}>Trocas e Devoluções</h2>
          <ul className="list-disc ml-6 space-y-2" style={{ color: t.textSecundario }}>
            <li>Trocas podem ser solicitadas em até 7 dias após o recebimento.</li>
            <li>O produto deve estar sem uso e com etiqueta.</li>
            <li>Para solicitar troca ou devolução entre em contato pelo WhatsApp.</li>
          </ul>
        </section>

        <Divisor />

        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: t.textSecundario }}>Garantia</p>
          <h2 className="text-xl font-semibold mb-4" style={{ color: t.text }}>Produto com Defeito</h2>
          <p style={{ color: t.textSecundario }}>
            Caso o produto apresente defeito de fabricação, entre em contato com nossa
            equipe enviando fotos do produto para análise.
          </p>
        </section>

        <Divisor />

        <section>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: t.textSecundario }}>Onde Estamos</p>
          <h2 className="text-xl font-semibold mb-4" style={{ color: t.text }}>Localização</h2>
          <p style={{ color: t.textSecundario }}>Rua Tobias Barreto, 37</p>
          <p style={{ color: t.textSecundario }}>Vila Velha - ES</p>
          <p style={{ color: t.textSecundario }}>Brasil</p>
        </section>

      </div>
    </div>
  );
}

export default Infos;