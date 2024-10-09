using backend_app.Dto;
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

        public async Task<Trip> GetTripAsync(string name)
        {
            var result = await trips.Find(x => x.name == name).SingleOrDefaultAsync();
            if(result == null)
            {
                return null;
            }
            else
            {
                return result;
            }
        }

        public async Task<bool> AddUserTrip(AddUserTrip trip)
        {
            Trip newTrip = new Trip
            {
                name = trip.name,
                userCreated = trip.userCreated,
                description = trip.description,
                difficulty = trip.difficulty,
                routes = trip.routes
            };

            if(GetTripAsync(newTrip.name) == null)
            {
                return false;
            }
            else
            {
                await CreateTripAsync(newTrip);
                return true;
            }
        }

    }
}
