using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Security;

public static class LoginAttemptSecurity
{
    public static async Task<TentativaLogin?> GetBlocked(AppDbContext context, string perfil, string email, string ip)
    {
        var attempt = await context.TentativasLogin.FirstOrDefaultAsync(x => x.Email == $"{perfil}:{email}" && x.Ip == ip);
        return attempt?.BloqueadoAte > DateTime.UtcNow ? attempt : null;
    }

    public static async Task<int> RegisterFailure(AppDbContext context, string perfil, string email, string ip)
    {
        var key = $"{perfil}:{email}";
        var attempt = await context.TentativasLogin.FirstOrDefaultAsync(x => x.Email == key && x.Ip == ip) ?? new TentativaLogin { Email = key, Ip = ip };
        if (attempt.Id == 0) context.TentativasLogin.Add(attempt);
        attempt.Falhas = attempt.BloqueadoAte > DateTime.UtcNow ? attempt.Falhas : attempt.Falhas + 1;
        attempt.AtualizadoEm = DateTime.UtcNow;
        if (attempt.Falhas >= 5) attempt.BloqueadoAte = DateTime.UtcNow.AddMinutes(1);
        await context.SaveChangesAsync();
        return Math.Max(0, 5 - attempt.Falhas);
    }

    public static async Task Clear(AppDbContext context, string perfil, string email, string ip)
    {
        var attempt = await context.TentativasLogin.FirstOrDefaultAsync(x => x.Email == $"{perfil}:{email}" && x.Ip == ip);
        if (attempt is null) return;
        context.TentativasLogin.Remove(attempt);
        await context.SaveChangesAsync();
    }
}
