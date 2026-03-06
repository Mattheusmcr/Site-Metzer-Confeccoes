import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">

      <div className="flex items-center justify-between px-12 py-4">

        {/* ESQUERDA - LOGO + MENU */}
        <div className="flex items-center gap-12">

          {/* LOGO */}
          <img
            src="/LogoEmpresaMetzker.jpg"
            alt="Logo Metzker"
            className="h-16 object-contain"
          />

          {/* MENU */}
          <nav className="flex gap-8 text-sm font-medium tracking-widest">

            <Link to="/" className="hover:text-gray-500 transition">
              INÍCIO
            </Link>

            <Link to="/catalogo" className="hover:text-gray-500 transition">
              CATÁLOGO
            </Link>

            <Link to="/infos" className="hover:text-gray-500 transition">
              INFORMAÇÕES
            </Link>

            <Link to="/pedidos" className="hover:text-gray-500 transition">
              PEDIDOS
            </Link>

          </nav>
        </div>

        {/* DIREITA - ICONES */}
        <div className="flex gap-6 text-xl">

          <button className="hover:opacity-70">
            👤
          </button>

          <Link to="/pedidos" className="hover:opacity-70">
            🛒
          </Link>

        </div>

      </div>

    </header>
  );
}

export default Navbar;