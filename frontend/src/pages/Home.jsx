import { motion } from "framer-motion";

function Home() {
  return (
    <div className="bg-white">

      {/* HERO SECTION */}
      <section className="h-screen flex flex-col justify-center items-center text-center bg-black text-white px-6">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          Metzker Confecções
        </motion.h1>

        <p className="text-lg md:text-xl max-w-xl mb-8 text-gray-300">
          Moda com identidade, qualidade e estilo para quem veste atitude.
        </p>

        <a
          href="https://wa.me/5527997878391"
          target="_blank"
          rel="noreferrer"
          className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-xl text-lg font-semibold transition"
        >
          Fale Conosco no WhatsApp
        </a>
      </section>

      {/* SOBRE */}
      <section className="py-20 px-10 text-center bg-gray-100">
        <h2 className="text-4xl font-bold mb-6">Sobre Nós</h2>
        <p className="max-w-3xl mx-auto text-gray-600 text-lg">
          Somos uma empresa familiar localizada em Vila Velha,
          especializada em confecções de alta qualidade.
          Trabalhamos com dedicação, atenção aos detalhes
          e compromisso com a satisfação dos nossos clientes.
        </p>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-20 px-10">
        <h2 className="text-4xl font-bold text-center mb-12">
          Nossos Diferenciais
        </h2>

        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div className="p-8 shadow-lg rounded-2xl">
            <h3 className="text-xl font-semibold mb-4">Alta Qualidade</h3>
            <p className="text-gray-600">
              Trabalhamos com tecidos selecionados e acabamento impecável.
            </p>
          </div>

          <div className="p-8 shadow-lg rounded-2xl">
            <h3 className="text-xl font-semibold mb-4">Atendimento Personalizado</h3>
            <p className="text-gray-600">
              Atendimento direto pelo WhatsApp com suporte rápido.
            </p>
          </div>

          <div className="p-8 shadow-lg rounded-2xl">
            <h3 className="text-xl font-semibold mb-4">Produção Local</h3>
            <p className="text-gray-600">
              Empresa localizada em Vila Velha, fortalecendo o comércio local.
            </p>
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO COM MAPS*/}
    {/*}  <section className="py-20 bg-gray-100 text-center px-6">
        <h2 className="text-4xl font-bold mb-8">Nossa Localização</h2>

        <p className="mb-6 text-lg text-gray-700">
          Rua Tobias Barreto, nº 37 – Vila Velha
        </p>

        <div className="flex justify-center">
          <iframe
            title="Localização Metzker"
            src="https://www.google.com/maps?q=Rua+Tobias+Barreto,+37,+Vila+Velha&output=embed"
            width="100%"
            height="400"
            className="rounded-2xl shadow-lg max-w-4xl"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>
    */}

{/* RODAPÉ */}
<footer className="border-t mt-20 py-16 px-10">

  <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-sm">

    {/* SOBRE */}
    <div>
      <h3 className="font-semibold mb-4">METZKER CONFECÇÕES</h3>

      <p className="text-gray-600 leading-relaxed">
        A Metzker Confecções trabalha com peças de alta qualidade,
        focadas em conforto, estilo e durabilidade.
      </p>
    </div>

    {/* CONTATO */}
    <div>
      <h3 className="font-semibold mb-4">CONTATO</h3>

      <p className="text-gray-600">
        WhatsApp
      </p>

      <p className="mb-2">
        (27) 99885-3043
      </p>

      <p className="text-gray-600">
        Email
      </p>

      <p>
        contato@metzker.com
      </p>
    </div>

    {/* LOCALIZAÇÃO */}
    <div>
      <h3 className="font-semibold mb-4">LOCALIZAÇÃO</h3>

      <p>
        Rua Tobias Barreto, 37
      </p>

      <p>
        Vila Velha - ES
      </p>

      <p>
        Brasil
      </p>

    </div>

  </div>

  {/* LINHA FINAL */}
  <div className="text-center text-xs text-gray-500 mt-12">
    © {new Date().getFullYear()} Metzker Confecções
  </div>

</footer>

      {/* BOTÃO FLUTUANTE WHATSAPP */}
      <a
        href="https://wa.me/5527997878391"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition"
      >
        WhatsApp
      </a>
    </div>
  );
}

export default Home;