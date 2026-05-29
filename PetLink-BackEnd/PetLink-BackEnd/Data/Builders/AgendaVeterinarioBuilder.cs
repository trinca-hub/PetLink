using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class AgendaVeterinarioBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AgendaVeterinario>().HasKey(a => a.Id);
            modelBuilder.Entity<AgendaVeterinario>().Property(a => a.VeterinarioId).IsRequired();
            modelBuilder.Entity<AgendaVeterinario>().Property(a => a.DiasSemanaAtivos).IsRequired();
            modelBuilder.Entity<AgendaVeterinario>().Property(a => a.HoraInicioManha).IsRequired();
            modelBuilder.Entity<AgendaVeterinario>().Property(a => a.HoraFimManha).IsRequired();
            modelBuilder.Entity<AgendaVeterinario>().Property(a => a.HoraInicioTarde).IsRequired();
            modelBuilder.Entity<AgendaVeterinario>().Property(a => a.HoraFimTarde).IsRequired();
            modelBuilder.Entity<AgendaVeterinario>().Property(a => a.DuracaoMinutos).IsRequired();
            modelBuilder.Entity<AgendaVeterinario>().Property(a => a.DataCriacao).IsRequired();

            modelBuilder.Entity<AgendaVeterinario>()
                .HasOne(a => a.Veterinario)
                .WithMany()
                .HasForeignKey(a => a.VeterinarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AgendaVeterinario>()
                .HasIndex(a => a.VeterinarioId)
                .IsUnique();

            modelBuilder.Entity<AgendaVeterinario>()
                .HasCheckConstraint("CK_agendaveterinario_horarios", "horainiciomanha < horafimmanha AND horainiciotarde < horafimtarde");

            modelBuilder.Entity<AgendaVeterinario>()
                .HasCheckConstraint("CK_agendaveterinario_dias", "diassemanaativos > 0");

            modelBuilder.Entity<AgendaVeterinario>()
                .HasCheckConstraint("CK_agendaveterinario_duracao", "duracaominutos = 60");
        }
    }
}
