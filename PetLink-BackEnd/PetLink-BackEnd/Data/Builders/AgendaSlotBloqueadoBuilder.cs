using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class AgendaSlotBloqueadoBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AgendaSlotBloqueado>().HasKey(b => b.Id);
            modelBuilder.Entity<AgendaSlotBloqueado>().Property(b => b.VeterinarioId).IsRequired();
            modelBuilder.Entity<AgendaSlotBloqueado>().Property(b => b.DataHoraInicio).IsRequired();
            modelBuilder.Entity<AgendaSlotBloqueado>().Property(b => b.Motivo).HasMaxLength(300).IsRequired(false);
            modelBuilder.Entity<AgendaSlotBloqueado>().Property(b => b.DataCriacao).IsRequired();

            modelBuilder.Entity<AgendaSlotBloqueado>()
                .HasOne(b => b.Veterinario)
                .WithMany()
                .HasForeignKey(b => b.VeterinarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AgendaSlotBloqueado>()
                .HasIndex(b => new { b.VeterinarioId, b.DataHoraInicio })
                .IsUnique();
        }
    }
}
