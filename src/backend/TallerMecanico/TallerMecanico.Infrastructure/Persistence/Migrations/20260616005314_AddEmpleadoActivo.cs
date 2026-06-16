using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TallerMecanico.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEmpleadoActivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "Empleados",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activo",
                table: "Empleados");
        }
    }
}
