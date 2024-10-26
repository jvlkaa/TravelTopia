using backend_app.Models;
using backend_app.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.Configure<TravelTopiaDatabaseConfiguration>(
        builder.Configuration.GetSection("TravelTopiaDatabase")
    );

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<PointService>();
builder.Services.AddSingleton<RouteService>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<TripService>();

//CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:4200")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials());
});

// Dodanie usług Authentication i Google Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(options =>
{
    options.ClientId = "594811329058-f3i591f9al5a22i3sbghck3mv4j0ia2h.apps.googleusercontent.com";
    options.ClientSecret = "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";
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin");

app.UseRouting();
app.UseHttpsRedirection();
app.UseAuthorization();
app.UseAuthentication();

app.MapControllers();

app.Run();
