using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TallerMecanico.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLicenciaFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClaveLicencia",
                table: "ConfiguracionTaller",
                type: "TEXT",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaExpiracionLicencia",
                table: "ConfiguracionTaller",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UltimoAccesoRegistrado",
                table: "ConfiguracionTaller",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClaveLicencia",
                table: "ConfiguracionTaller");

            migrationBuilder.DropColumn(
                name: "FechaExpiracionLicencia",
                table: "ConfiguracionTaller");

            migrationBuilder.DropColumn(
                name: "UltimoAccesoRegistrado",
                table: "ConfiguracionTaller");
        }
    }
}
