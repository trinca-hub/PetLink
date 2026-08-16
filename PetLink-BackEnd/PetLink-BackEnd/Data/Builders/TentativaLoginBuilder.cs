using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders;

public static class TentativaLoginBuilder
{
    public static void Build(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TentativaLogin>().HasKey(item => item.Id);
        modelBuilder.Entity<TentativaLogin>().Property(item => item.Email).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<TentativaLogin>().Property(item => item.Ip).IsRequired().HasMaxLength(64);
        modelBuilder.Entity<TentativaLogin>().HasIndex(item => new { item.Email, item.Ip }).IsUnique();
    }
}
