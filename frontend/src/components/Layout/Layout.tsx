import { Outlet } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen w-screen">
      {/* Duas colunas: uma para a barra lateral e outra para o cabeçalho e o conteúdo */}
      <Sidebar />
      <div className="flex w-full flex-col bg-neutral-200">
        {/* Duas linhas: cabeçalho e conteúdo */}
        <Header />

        {/* Esse será o conteúdo */}
        <main className="h-full w-full p-4">
          {/* O componente Outlet permite que o conteúdo de qualquer página seja inserido aqui */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}