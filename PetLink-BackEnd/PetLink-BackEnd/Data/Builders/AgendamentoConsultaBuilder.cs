using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class AgendamentoConsultaBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AgendamentoConsulta>().HasKey(a => a.Id);
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.VeterinarioId).IsRequired();
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.PetId).IsRequired();
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.UsuarioId).IsRequired();
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.DataHoraInicio).IsRequired(false);
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.DataHoraFim).IsRequired(false);
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.Status).IsRequired();
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.TipoServico).IsRequired();
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.Observacao).HasMaxLength(500).IsRequired(false);
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.MotivoCancelamento).HasMaxLength(500).IsRequired(false);
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.DataCriacao).IsRequired();
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.DataConfirmacao).IsRequired(false);
            modelBuilder.Entity<AgendamentoConsulta>().Property(a => a.DataCancelamento).IsRequired(false);
            modelBuilder.Entity<AgendamentoConsulta>()
                .Property(a => a.RowVersion)
                .IsRequired()
                .IsConcurrencyToken()
                .ValueGeneratedNever();

            modelBuilder.Entity<AgendamentoConsulta>()
                .HasOne(a => a.Veterinario)
                .WithMany()
                .HasForeignKey(a => a.VeterinarioId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AgendamentoConsulta>()
                .HasOne(a => a.Pet)
                .WithMany()
                .HasForeignKey(a => a.PetId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AgendamentoConsulta>()
                .HasOne(a => a.Usuario)
                .WithMany()
                .HasForeignKey(a => a.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AgendamentoConsulta>()
                .HasIndex(a => new { a.VeterinarioId, a.DataHoraInicio, a.DataHoraFim })
                .HasDatabaseName("IX_agendamentoconsulta_vet_horario");

            modelBuilder.Entity<AgendamentoConsulta>()
                .HasIndex(a => new { a.VeterinarioId, a.PetId, a.UsuarioId, a.Status })
                .HasDatabaseName("IX_agendamentoconsulta_pendente");

            modelBuilder.Entity<AgendamentoConsulta>()
                .HasIndex(a => new { a.VeterinarioId, a.DataHoraInicio })
                .HasDatabaseName("IX_agendamentoconsulta_vet_inicio");

            modelBuilder.Entity<AgendamentoConsulta>()
                .HasCheckConstraint("CK_agendamentoconsulta_horario", "(datahorainicio IS NULL AND datahorafim IS NULL) OR (datahorainicio < datahorafim)");

            modelBuilder.Entity<AgendamentoConsulta>()
                .HasCheckConstraint("CK_agendamentoconsulta_status_datas", "(status <> 2 OR dataconfirmacao IS NOT NULL) AND (status <> 3 OR datacancelamento IS NOT NULL)");

            modelBuilder.Entity<AgendamentoConsulta>()
                .HasCheckConstraint("CK_agendamentoconsulta_status_pendente", "(status <> 1 OR (datahorainicio IS NULL AND datahorafim IS NULL))");
        }
    }
}
