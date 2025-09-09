import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import Layout from "../components/Layout/Layout";
import ListaProduto from "../components/pages/ListaProdutos";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="" element={<Layout />}>
     <Route path="/lista_produtos" element={<ListaProduto />}></Route>
      </Route>
    </>
  ),
);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}