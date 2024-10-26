FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_ENVIRONMENT=Development

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend-app/backend-app.csproj", "backend-app/"]
RUN dotnet restore "backend-app/backend-app.csproj"
COPY . .
WORKDIR "/src/backend-app"
RUN dotnet build "backend-app.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "backend-app.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "backend-app.dll"]
