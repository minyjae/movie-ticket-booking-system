FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY movie-ticket-booking-system.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish movie-ticket-booking-system.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "movie-ticket-booking-system.dll"]