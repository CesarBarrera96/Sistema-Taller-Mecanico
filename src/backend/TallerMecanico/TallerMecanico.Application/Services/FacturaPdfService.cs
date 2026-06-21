using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TallerMecanico.Application.DTOs.Facturas;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Application.Services;

public class FacturaPdfService : IFacturaPdfService
{
    public byte[] GeneratePdf(FacturaPdfData data)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.Letter);
                page.Margin(1, Unit.Centimetre);

                page.Header().Element(e => ComposeHeader(e, data));
                page.Content().Element(e => ComposeContent(e, data));
                page.Footer().Element(e => ComposeFooter(e, data));
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, FacturaPdfData data)
    {
        container.PaddingBottom(10).Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(left =>
                {
                    if (!string.IsNullOrEmpty(data.TallerLogoRuta))
                    {
                        var logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", data.TallerLogoRuta.TrimStart('/'));
                        if (File.Exists(logoPath))
                        {
                            var logoBytes = File.ReadAllBytes(logoPath);
                            left.Item().Width(60).Height(60).Image(logoBytes).FitArea();
                            left.Item().PaddingTop(4);
                        }
                    }

                    left.Item().Text(data.TallerNombre).Bold().FontSize(16).FontColor(Colors.Blue.Darken2);
                    if (!string.IsNullOrEmpty(data.TallerRfc))
                        left.Item().Text($"RFC: {data.TallerRfc}").FontSize(9);
                    if (!string.IsNullOrEmpty(data.TallerDireccion))
                        left.Item().Text(data.TallerDireccion).FontSize(9);
                    if (!string.IsNullOrEmpty(data.TallerTelefono))
                        left.Item().Text($"Tel: {data.TallerTelefono}").FontSize(9);
                });

                row.ConstantItem(10);

                row.ConstantItem(160).Border(1.5f).BorderColor(Colors.Blue.Darken2).Padding(8).Column(right =>
                {
                    right.Item().AlignCenter().Text("FACTURA").Bold().FontSize(13).FontColor(Colors.Blue.Darken2);
                    right.Item().LineHorizontal(1f).LineColor(Colors.Blue.Lighten2);
                    right.Item().PaddingTop(4);
                    right.Item().Row(r =>
                    {
                        r.ConstantItem(50).Text("Folio:").Bold().FontSize(9);
                        r.RelativeItem().Text(data.Folio).FontSize(9);
                    });
                    right.Item().Row(r =>
                    {
                        r.ConstantItem(50).Text("Fecha:").Bold().FontSize(9);
                        r.RelativeItem().Text(data.FechaFacturacion.ToString("dd/MM/yyyy")).FontSize(9);
                    });
                    right.Item().Row(r =>
                    {
                        r.ConstantItem(50).Text("Estatus:").Bold().FontSize(9);
                        var color = data.Estatus == EstatusFactura.Pagada ? Colors.Green.Darken2
                            : data.Estatus == EstatusFactura.Cancelada ? Colors.Red.Darken2
                            : Colors.Orange.Darken2;
                        r.RelativeItem().Text(data.Estatus.ToString()).FontSize(9).FontColor(color);
                    });
                });
            });

            col.Item().LineHorizontal(1f).LineColor(Colors.Blue.Darken2);
        });
    }

    private void ComposeContent(IContainer container, FacturaPdfData data)
    {
        container.Column(col =>
        {
            col.Item().PaddingTop(10).Element(e => ComposeClienteVehiculo(e, data));
            col.Item().PaddingTop(14).Element(e => ComposeTablaConceptos(e, data));
            col.Item().PaddingTop(10).Element(e => ComposeTotales(e, data));
        });
    }

    private void ComposeClienteVehiculo(IContainer container, FacturaPdfData data)
    {
        container.Row(row =>
        {
            row.RelativeItem().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(col =>
            {
                col.Item().Text("Datos del Cliente").Bold().FontSize(11).FontColor(Colors.Blue.Darken2);
                col.Item().PaddingTop(4);
                col.Item().Text(data.ClienteNombre).FontSize(10);
                if (!string.IsNullOrEmpty(data.ClienteRfc))
                    col.Item().Text($"RFC: {data.ClienteRfc}").FontSize(9);
                if (!string.IsNullOrEmpty(data.ClienteTelefono))
                    col.Item().Text($"Tel: {data.ClienteTelefono}").FontSize(9);
                if (!string.IsNullOrEmpty(data.ClienteEmail))
                    col.Item().Text($"Email: {data.ClienteEmail}").FontSize(9);
                if (!string.IsNullOrEmpty(data.ClienteDireccion))
                    col.Item().Text(data.ClienteDireccion).FontSize(9);
            });

            row.ConstantItem(14);

            row.RelativeItem().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(col =>
            {
                col.Item().Text("Datos del Vehiculo").Bold().FontSize(11).FontColor(Colors.Blue.Darken2);
                col.Item().PaddingTop(4);
                col.Item().Text(data.VehiculoDescripcion).FontSize(10);
                col.Item().Text($"Placas: {data.VehiculoPlacas}").FontSize(9);
                if (data.VehiculoAnio.HasValue)
                    col.Item().Text($"Anio: {data.VehiculoAnio}").FontSize(9);
                if (!string.IsNullOrEmpty(data.VehiculoColor))
                    col.Item().Text($"Color: {data.VehiculoColor}").FontSize(9);
                if (!string.IsNullOrEmpty(data.VehiculoVin))
                    col.Item().Text($"VIN: {data.VehiculoVin}").FontSize(9);
            });
        });
    }

    private void ComposeTablaConceptos(IContainer container, FacturaPdfData data)
    {
        container.Border(0.5f).BorderColor(Colors.Grey.Lighten1).Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(55);
                columns.RelativeColumn();
                columns.ConstantColumn(90);
                columns.ConstantColumn(90);
            });

            table.Header(header =>
            {
                header.Cell().Element(MakeHeaderCell).AlignCenter().Text("Cant.").SemiBold().FontSize(9).FontColor(Colors.Blue.Darken2);
                header.Cell().Element(MakeHeaderCell).Text("Concepto").SemiBold().FontSize(9).FontColor(Colors.Blue.Darken2);
                header.Cell().Element(MakeHeaderCell).AlignRight().Text("P. Unitario").SemiBold().FontSize(9).FontColor(Colors.Blue.Darken2);
                header.Cell().Element(MakeHeaderCell).AlignRight().Text("Subtotal").SemiBold().FontSize(9).FontColor(Colors.Blue.Darken2);
            });

            for (var i = 0; i < data.Detalles.Count; i++)
            {
                var d = data.Detalles[i];
                var bgColor = i % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;

                table.Cell().Element(e => MakeBodyCell(e, bgColor)).AlignCenter().Text(d.Cantidad.ToString("N0")).FontSize(9);
                table.Cell().Element(e => MakeBodyCell(e, bgColor)).Text(d.Concepto).FontSize(9);
                table.Cell().Element(e => MakeBodyCell(e, bgColor)).AlignRight().Text(d.PrecioUnitario.ToString("C")).FontSize(9);
                table.Cell().Element(e => MakeBodyCell(e, bgColor)).AlignRight().Text(d.Subtotal.ToString("C")).FontSize(9);
            }
        });
    }

    private void ComposeTotales(IContainer container, FacturaPdfData data)
    {
        container.AlignRight().Width(220).Column(col =>
        {
            col.Item().Row(r =>
            {
                r.ConstantItem(110).AlignRight().Text("Subtotal:").SemiBold().FontSize(10);
                r.ConstantItem(10);
                r.RelativeItem().AlignRight().Text(data.Subtotal.ToString("C")).FontSize(10);
            });
            col.Item().Row(r =>
            {
                r.ConstantItem(110).AlignRight().Text($"{data.NombreImpuesto} ({data.PorcentajeImpuesto}%):").SemiBold().FontSize(10);
                r.ConstantItem(10);
                r.RelativeItem().AlignRight().Text(data.IVA.ToString("C")).FontSize(10);
            });
            col.Item().PaddingTop(4).LineHorizontal(1f).LineColor(Colors.Grey.Darken1);
            col.Item().PaddingTop(4).Row(r =>
            {
                r.ConstantItem(110).AlignRight().Text("Total:").Bold().FontSize(14).FontColor(Colors.Blue.Darken2);
                r.ConstantItem(10);
                r.RelativeItem().AlignRight().Text(data.Total.ToString("C")).Bold().FontSize(14).FontColor(Colors.Blue.Darken2);
            });
        });
    }

    private void ComposeFooter(IContainer container, FacturaPdfData data)
    {
        container.PaddingTop(16).Column(col =>
        {
            col.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
            if (!string.IsNullOrEmpty(data.TallerLeyenda))
                col.Item().PaddingTop(6).AlignCenter().Text(data.TallerLeyenda).Italic().FontSize(8).FontColor(Colors.Grey.Darken1);
        });
    }

    private static IContainer MakeHeaderCell(IContainer container) =>
        container.BorderBottom(1).BorderColor(Colors.Blue.Darken2).PaddingVertical(5).PaddingHorizontal(6)
            .Background(Colors.Blue.Lighten4);

    private static IContainer MakeBodyCell(IContainer container, string bgColor) =>
        container.BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(4).PaddingHorizontal(6)
            .Background(bgColor);
}
