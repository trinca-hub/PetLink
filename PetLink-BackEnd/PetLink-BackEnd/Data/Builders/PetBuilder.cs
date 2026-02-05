using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Data.Builders
{
    public class PetBuilder
    {

        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Pet>().HasKey(p => p.Id);
            modelBuilder.Entity<Pet>().Property(p => p.Nome).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Pet>().Property(p => p.Raca).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Pet>().Property(p => p.Sexo).IsRequired().HasMaxLength(20);
            modelBuilder.Entity<Pet>().Property(p => p.Rga).IsRequired().HasMaxLength(7);
            modelBuilder.Entity<Pet>().Property(p => p.Idade).IsRequired().HasMaxLength(10);
            modelBuilder.Entity<Pet>().Property(p => p.Peso).IsRequired();
            modelBuilder.Entity<Pet>().Property(p => p.Castrado).IsRequired();
            modelBuilder.Entity<Pet>().Property(p => p.TipoPet).IsRequired();
            modelBuilder.Entity<Pet>().Property(p => p.UsuarioId).IsRequired();

            modelBuilder.Entity<Pet>().Property(p => p.Foto).HasColumnName("foto").HasMaxLength(1000).IsRequired(false);




            modelBuilder.Entity<Pet>()
                    .HasData(new List<Pet>
                    {
                    new Pet(1, "Peroba", "Pit Bull", "Macho", "22992", "7 anos", 35.3f, false, TipoPet.CACHORRO, 1, "https://www.prodograw.com/wp-content/uploads/2025/09/American-Pitbull-1-800x800.jpg"),
                    new Pet(2, "Felipina", "Yorkshire", "Fêmea", "22392", "3 anos", 5.5f, true, TipoPet.CACHORRO, 2, "https://images.tcdn.com.br/img/img_prod/1087789/noticia_619419434679a87734bc0e.png"),
                    new Pet(3, "Neguin", "Pastor Alemão", "Macho", "22192", "8 meses", 14.9f, false, TipoPet.CACHORRO, 3, "https://imgs.search.brave.com/Zf7U4EzVoIouXr_8pci0FiteQUnpCBmJF6NO38G0qdo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDcy/NDY3OTUyL3B0L2Zv/dG8vYyVDMyVBM28t/cGFzdG9yLWFsZW0l/QzMlQTNvLWNhY2hv/cnJpbmhvLXRyaXN0/ZS1jJUMzJUEzby1k/ZWl0YWRvLW9saGFu/ZG8uanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPS0xV1NNYmtr/RzV1RTg5SnBPQ2NF/eU1PUllZalAxMUZP/ZzNQNWE4WXBMOXM9"),
                    new Pet(4, "Garfield", "Siamês", "Macho", "22992", "8 anos", 5.3f, true, TipoPet.GATO, 1, "https://imgs.search.brave.com/OiTS8j_7NOegyditO95P5Iw58RfR0yv__Gohg9GgVe4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/Zm90b3MtZ3JhdGlz/L3JldHJhdG8tZWxl/Z2FudGUtZGUtdW0t/Z2F0by1zaWFtZXNf/MjMtMjE1MTk4MzU0/NC5qcGc_c2VtdD1h/aXNfaHlicmlkJnc9/NzQwJnE9ODA"),
                    new Pet(5, "Tom", "Ragdoll", "Macho", "43432", "6 meses", 2.5f, true, TipoPet.GATO, 2, "https://imgs.search.brave.com/1uVQa0yKTFnW7bqkIzG0jlsP8yOKb1kqLWWaIUFm5NM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4w/LmV4cGVydG9hbmlt/YWwuY29tL2VzL3Jh/emFzLzQvOC8xL2dh/dG8tcmFnZG9sbF8x/ODRfNl9vcmlnLmpw/Zw"),
                    new Pet(6, "Marie", "Coon", "Fêmea", "22192", "3 anos", 3.2f, true, TipoPet.GATO, 3, "https://imgs.search.brave.com/V0Na41tb7sTCIIeoRfAtv2KeDyLqOm3kiFDn7jKBwHo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTE4/OTk3NDk1MC9waG90/by9tYWluZS1jb29u/LWNhdC1jbG9zZS11/cC1mdW5ueS1jdXRl/LWNhdC13aXRoLW1h/cmJsZS1mdXItY29s/b3ItbGFyZ2VzdC1k/b21lc3RpY2F0ZWQt/YnJlZWRzLW9mLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz16/djAzeG1iLVdFR2hE/YkNhZFRid3Z3SUxQ/N3ZwS01KTDF5eEY4/MjFhWXJJPQ"),

                    });
        }
    }
}

