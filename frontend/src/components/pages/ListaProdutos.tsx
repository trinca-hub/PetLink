export default function ListaProduto() {
    const [produtos, setAlunos] = useState<Produto[]>([]);
    useEffect(() => {
  const getAlunos = async () => {
    try {
      // Realizamos uma requisição GET para a api e armazenamos o resultado
      const res = await axios.get("http://localhost:5033/api/v1/Produto");

      // Aqui o primeiro data corresponde ao objeto response que criamos na API
      // Ja o segundo corresponde ao campo desse objeto onde retornamos os valores
      const produtos: Produto[] = res.data.data;
      setProdutos(produtos);
    } catch (error) {
      console.log(error);
    }
  };

  getAlunos();
}, []);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Gerenciamento de Produtos</h2>
        <button
          onClick={cadastrarProduto}
          className="cursor-pointer rounded-sm bg-green-600 px-2 py-1 text-white shadow-md"
        >
          Cadastrar Produto
        </button>
      </div>

      {/* Tabela com todos os registros cadastrados */}
      <table className="w-full rounded-lg bg-neutral-300">
        <thead>
          <tr className="h-12 text-left">
            <th className="px-4">ID</th>
            <th className="px-4">Nome</th>
            <th className="px-4">Preco</th>
            <th className="px-4">Descricao</th>
            <th className="px-4 text-center">Quantidade</th>
          </tr>
        </thead>
        <tbody>

        </tbody>
      </table>
    </div>
  );
}