using backend_app.Dto;
using backend_app.Models;
using DnsClient.Protocol;
using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using System.Net;

namespace backend_app.Services
{
    public class RouteService
    {
        private readonly IMongoCollection<Models.Route> routes;

        public RouteService(IOptions<TravelTopiaDatabaseConfiguration> options) {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            var travelTopiaDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
            this.routes = travelTopiaDatabase.GetCollection<Models.Route>(options.Value.RouteCollectionName);
        }

        public async Task<List<Models.Route>> GetRoutesAsync()
        {
            var result = await routes.Find(x => x.userCreated == false).ToListAsync();
            if (result.Count == 0)
            {
                return new List<Models.Route>(0);
            }
            else
            {
                return result;
            }
        } 

        public async Task<Models.Route> GetRouteAsync(string name)
        {
            var result = await routes.Find(x => x.name == name).SingleOrDefaultAsync();
            if (result == null)
            {
                return null;
            }
            else
            {
                return result;
            }
        }

        public async Task<List<Models.Route>> GetRoutesByStringAsync(string text)
        {
            var result = await routes.Find(x => x.name.Contains(text)).ToListAsync();
            if (result == null)
            {
                return new List<Models.Route>(0);
            }
            else
            {
                return result;
            }
        }

        public async Task<Models.Route> GetRouteByIdAsync(string id)
        {
            var result = await routes.Find(x => x.id == id).SingleOrDefaultAsync();
            if (result == null)
            {
                return null;
            }
            else
            {
                return result;
            }
        }
 
        public async Task CreateRouteAsync(Models.Route route) => await routes.InsertOneAsync(route);

        public async Task<bool> replaceRouteAsync(string id, Models.Route route)
        {
            var result = await routes.ReplaceOneAsync(x => x.id == id, route);
            return result.ModifiedCount > 0;
        } 

        public async Task<bool> deleteRouteAsync(string id)
        {
            var result = await routes.DeleteOneAsync(x => x.id == id);
            return result.DeletedCount > 0;
        }

        public async Task<bool> addUserRoute(AddUserRoute route)
        {
            Models.Route newRoute = new Models.Route
            {
                name = route.name,
                routePoints = route.routePoints,
                userCreated = route.userCreated,
                type = route.type
            };

            if(GetRouteAsync(newRoute.name) == null)
            {
                return false;
            }
            else
            {
                await CreateRouteAsync(newRoute);
                return true;
            }
        }
    }
}
