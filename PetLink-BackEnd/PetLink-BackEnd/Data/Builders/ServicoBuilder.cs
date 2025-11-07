using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class ServicoBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Servico>().HasKey(p => p.Id);
            modelBuilder.Entity<Servico>().Property(p => p.DataServico).IsRequired();
            modelBuilder.Entity<Servico>().Property(p => p.Descricao).IsRequired().HasMaxLength(250);
            modelBuilder.Entity<Servico>().Property(p => p.Tipo).IsRequired();
            modelBuilder.Entity<Servico>().Property(p => p.Valor).IsRequired();

            modelBuilder.Entity<Servico>()
                .HasData(new List<Servico>
                {
                    new Servico(1, new DateTime(2025, 10, 15, 00, 28, 32, DateTimeKind.Utc), "Consulta do Joquinha", 1, 100.00f),
                    new Servico(2, new DateTime(2025, 9, 18, 15, 20, 22, DateTimeKind.Utc), "Banho da Macoca", 2, 60.00f),
                    new Servico(3, new DateTime(2025, 6, 27, 10, 47, 02, DateTimeKind.Utc), "Tosa da Penelope", 3, 80.00f)
                });

        }
    }
}
