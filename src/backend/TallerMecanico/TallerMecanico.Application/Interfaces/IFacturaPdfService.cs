using TallerMecanico.Application.DTOs.Facturas;

namespace TallerMecanico.Application.Interfaces;

public interface IFacturaPdfService
{
    byte[] GeneratePdf(FacturaPdfData data);
}
