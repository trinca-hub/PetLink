using System.Security.Cryptography;

namespace PetLink_BackEnd.Security;

public static class PasswordSecurity
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 600_000;

    public static bool IsAcceptable(string? password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return false;

        var categories = 0;
        if (password.Any(char.IsLower)) categories++;
        if (password.Any(char.IsUpper)) categories++;
        if (password.Any(char.IsDigit)) categories++;
        if (password.Any(character => !char.IsLetterOrDigit(character))) categories++;
        return categories >= 3;
    }

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, HashSize);
        return $"PBKDF2${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string password, string storedHash)
    {
        if (!storedHash.StartsWith("PBKDF2$", StringComparison.Ordinal))
        {
            try
            {
                return CryptographicOperations.FixedTimeEquals(
                    SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(password)),
                    Convert.FromHexString(storedHash));
            }
            catch (FormatException)
            {
                return false;
            }
        }

        var parts = storedHash.Split('$');
        if (parts.Length != 4 || !int.TryParse(parts[1], out var iterations))
            return false;

        try
        {
            var salt = Convert.FromBase64String(parts[2]);
            var expectedHash = Convert.FromBase64String(parts[3]);
            var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expectedHash.Length);
            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
