using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

if (args.Length < 1)
{
    Console.WriteLine("Uso: GeneradorLicencia <fecha-expiracion> [frase-secreta]");
    Console.WriteLine();
    Console.WriteLine("  fecha-expiracion   Fecha de vencimiento (formato: yyyy-MM-dd o yyyy-MM-ddTHH:mm)");
    Console.WriteLine("  frase-secreta      Frase secreta AES (default: TallerMecanico2026LicenciaAESKey!)");
    Console.WriteLine();
    Console.WriteLine("Ejemplo:");
    Console.WriteLine("  GeneradorLicencia 2027-06-22");
    Console.WriteLine("  GeneradorLicencia 2027-06-22 \"MiFraseSecreta\"");
    return 1;
}

if (!DateTime.TryParse(args[0], out var expiracion))
{
    Console.WriteLine($"Fecha invalida: {args[0]}");
    return 1;
}

var secretPhrase = args.Length > 1 ? args[1] : "TallerMecanico2026LicenciaAESKey!";

var tokenData = new { Expiracion = expiracion, Producto = "TallerMecanico" };
var json = JsonSerializer.Serialize(tokenData);
var plainBytes = Encoding.UTF8.GetBytes(json);

using var sha256 = SHA256.Create();
var keyBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(secretPhrase));
var iv = new byte[16];
Array.Copy(keyBytes, iv, 16);

using var aes = Aes.Create();
aes.Key = keyBytes;
aes.IV = iv;
aes.Mode = CipherMode.CBC;
aes.Padding = PaddingMode.PKCS7;

using var encryptor = aes.CreateEncryptor();
var cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
var token = Convert.ToBase64String(cipherBytes);

Console.WriteLine($"Expiracion: {expiracion:yyyy-MM-dd HH:mm}");
Console.WriteLine($"Producto:   TallerMecanico");
Console.WriteLine($"JSON:       {json}");
Console.WriteLine();
Console.WriteLine($"TOKEN:");
Console.WriteLine(token);

return 0;
