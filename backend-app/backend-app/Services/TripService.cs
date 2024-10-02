using backend_app.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace backend_app.Services
{
    public class TripService
    {
        private readonly IMongoCollection<Trip> trips;

        public TripService(IOptions<TravelTopiaDatabaseConfiguration> options)
        {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            var travelTopiaDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
            this.trips = travelTopiaDatabase.GetCollection<Trip>(options.Value.TripCollectionName);
        }

        public async Task CreateTripAsync(Trip trip) => await trips.InsertOneAsync(trip);

    }
}
