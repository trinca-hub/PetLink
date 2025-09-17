using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Data.Repositories;
using PetLink_BackEnd.Data.Builders;
using PetLink_BackEnd.Services.Interfaces;
using PetLink_BackEnd.Services.Entities;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Interfaces;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddAutoMapper(opt => { }, AppDomain.CurrentDomain.GetAssemblies());
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Criamos uma nova política para o CORS para permitir que ele aceite as requisições do nosso frontend
builder.Services.AddCors(o => o.AddPolicy("DefaultPolicy", builder =>
{
    builder.WithOrigins("http://localhost:3000", "http://localhost:5173")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
}));

builder.Services.AddScoped<IProdutoRepository, ProdutoRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAdministradorRepository, AdministradorRepository>();
builder.Services.AddScoped<IVeterinarioRepository, VeterinarioRepository>();

builder.Services.AddScoped<IProdutoService, ProdutoService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAdministradorService, AdministradorService>();
builder.Services.AddScoped<IVeterinarioService, VeterinarioService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//Aplica politica criada acima
app.UseCors("DefaultPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
