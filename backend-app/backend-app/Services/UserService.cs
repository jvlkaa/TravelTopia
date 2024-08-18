using backend_app.Models;
using Microsoft.Extensions.Options;
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
            this.users = travelTopiaDatabase.GetCollection<Models.User>(options.Value.TravelTopiaCollectionName);
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
    }
}
