using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Data.Repositories;
using PetLink_BackEnd.Data.Builders;
using PetLink_BackEnd.Services.Interfaces;
using PetLink_BackEnd.Services.Entities;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Data.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using PetLink_BackEnd.WebAPI.Data.Repositories;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddAutoMapper(opt => { }, AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS liberado para React Native (qualquer origem)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IProdutoRepository, ProdutoRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAdministradorRepository, AdministradorRepository>();
builder.Services.AddScoped<IVeterinarioRepository, VeterinarioRepository>();
builder.Services.AddScoped<IItemPedidoRepository, ItemPedidoRepository>();
builder.Services.AddScoped<IPedidoRepository, PedidoRepository>();

builder.Services.AddScoped<IPetRepository, PetRepository>();
builder.Services.AddScoped<IServicoRepository, ServicoRepository>();

builder.Services.AddScoped<IProdutoService, ProdutoService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAdministradorService, AdministradorService>();
builder.Services.AddScoped<IVeterinarioService, VeterinarioService>();
builder.Services.AddScoped<IItemPedidoService, ItemPedidoService>();
builder.Services.AddScoped<IPedidoService, PedidoService>();

builder.Services.AddScoped<IPetService, PetService>();
builder.Services.AddScoped<IServicoService, ServicoService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// <<< AQUI troca sua policy por esta >>>
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
