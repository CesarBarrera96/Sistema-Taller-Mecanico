using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TallerMecanico.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddImpuestoConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NombreImpuesto",
                table: "ConfiguracionTaller",
                type: "TEXT",
                nullable: false,
                defaultValue: "IVA");

            migrationBuilder.AddColumn<decimal>(
                name: "PorcentajeImpuesto",
                table: "ConfiguracionTaller",
                type: "TEXT",
                nullable: false,
                defaultValue: 16m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NombreImpuesto",
                table: "ConfiguracionTaller");

            migrationBuilder.DropColumn(
                name: "PorcentajeImpuesto",
                table: "ConfiguracionTaller");
        }
    }
}
