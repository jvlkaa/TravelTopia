using backend_app.Models;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Expressions;
using MongoDB.Driver;

namespace backend_app.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> users;

        public UserService(IOptions<TravelTopiaDatabaseConfiguration> options)
        {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            var travelTopiaDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
            this.users = travelTopiaDatabase.GetCollection<User>(options.Value.UserCollectionName);
        }

        public async Task<User> GetUserByGoogleIdAsync(string googleId)
        {
            var foundUser = await users.Find(user => user.googleId == googleId).SingleOrDefaultAsync();

            if (foundUser == null)
            {
                return null;
            }
            else
            {
                return foundUser;
            }
        }

        public async Task CreateUserAsync(User user)
        {
            await users.InsertOneAsync(user);
        }

        public async Task<List<string>> getRoutesFromUserAsync(string googleId)
        {
            var user = await GetUserByGoogleIdAsync(googleId);

            if (user == null)
            {
                return new List<string>(0);
            }
            else
            {
                return user.routesIds.ToList();
            }
        }

        public async Task<List<string>> getTripsFromUserAsync(string googleId)
        {
            var user = await GetUserByGoogleIdAsync(googleId);

            if (user == null)
            {
                return new List<string>(0);
            }
            else
            {
                return user.tripsIds.ToList();
            }
        }

        public async Task AddRouteAsync(string googleId, string routeId)
        {
            var update = Builders<User>.Update.AddToSet(user => user.routesIds, routeId);

            await users.UpdateOneAsync(user => user.googleId == googleId, update);
        }

        public async Task AddTripAsync(string googleId, string tripId)
        {
            var update = Builders<User>.Update.AddToSet(user => user.tripsIds, tripId);

            await users.UpdateOneAsync(user => user.googleId == googleId, update);
        }

        public async Task DeleteRouteAsync(string googleId, string routeId)
        {
            var update = Builders<User>.Update.Pull(user => user.routesIds, routeId);

            await users.UpdateOneAsync(user => user.googleId == googleId, update);
        }

        public async Task DeleteTripAsync(string googleId, string tripId)
        {
            var update = Builders<User>.Update.Pull(user => user.tripsIds, tripId);

            await users.UpdateOneAsync(user => user.googleId == googleId, update);
        }

        public async Task UpdateRoleAsync(string googleId)
        {
            var update = Builders<User>.Update.Set(user => user.role, "developer");

            await users.UpdateOneAsync(user => user.googleId == googleId, update);
        }

        public async Task<string> GetRoleAsync(string googleId)
        {
            var user = await GetUserByGoogleIdAsync(googleId);

            if (user == null)
            {
                return string.Empty;
            }
            else
            {
                return user.role;
            }
        }
    }
}
