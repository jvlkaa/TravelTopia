using backend_app.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace backend_app.Services
{
    public class RouteService
    {
        private readonly IMongoCollection<Models.Route> routes;

        public RouteService(IOptions<TravelTopiaDatabaseConfiguration> options) {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            var travelTopiaDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
            this.routes = travelTopiaDatabase.GetCollection<Models.Route>(options.Value.TravelTopiaCollectionName);
        }

        public async Task<List<Models.Route>> GetRoutesAsync() => await routes.Find(_ => true).ToListAsync();

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
    }
}
