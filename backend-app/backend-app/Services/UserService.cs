using backend_app.Models;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Expressions;
using MongoDB.Driver;

namespace backend_app.Services
{
    public class UserService
    {
        private readonly IMongoCollection<Models.User> users;

        public UserService(IOptions<TravelTopiaDatabaseConfiguration> options)
        {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            var travelTopiaDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
            this.users = travelTopiaDatabase.GetCollection<Models.User>(options.Value.UserCollectionName);
        }

        public async Task<Models.User> GetUserByGoogleIdAsync(string googleId)
        {
            var result = await users.Find(x => x.googleId == googleId).SingleOrDefaultAsync();
            if (result == null)
            {
                return null;
            }
            else
            {
                return result;
            }
        }

        public async Task CreateUserAsync(User user) => await users.InsertOneAsync(user);

        public async Task<List<string>> getRoutesFromUserAsync(string googleId)
        {
            var result = await GetUserByGoogleIdAsync(googleId);

            if (result == null)
            {
                return new List<string>(0);
            }
            else
            {
                return result.routesIds.ToList();
            }
        }

        public async Task AddRouteAsync(string googleId, string routeId)
        {
            var update = Builders<User>.Update.AddToSet(x => x.routesIds, routeId);
            await users.UpdateOneAsync(x => x.googleId == googleId, update);
        }

        public async Task DeleteRouteAsync(string googleId, string routeId)
        {
            var update = Builders<User>.Update.Pull(x => x.routesIds, routeId);
            await users.UpdateOneAsync(x => x.googleId == googleId, update);
        }
    }
}
