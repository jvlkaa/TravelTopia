using backend_app.Dto;
using backend_app.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Net;

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

        public async Task<List<Trip>> GetTripsAsync()
        {
            var result = await trips.Find(x => x.userCreated == false).ToListAsync();
            if(result.Count == 0)
            {
                return new List<Trip>(0);
            }
            else
            {
                return result;
            }
        }

        public async Task<Trip> GetTripByIdAsync(string id)
        {
            var result = await trips.Find(x => x.id == id).SingleOrDefaultAsync();
            if (result == null)
            {
                return null;
            }
            else
            {
                return result;
            }
        }

        public async Task<List<Trip>> GetFilteredTripsAsync(string name, string difficulty)
        {
            var filter = FilterDefinition<Trip>.Empty;
            filter &= Builders<Trip>.Filter.Eq(x => x.userCreated, false);

            if (!string.IsNullOrEmpty(name))
            {
                filter &= Builders<Trip>.Filter.Regex(x => x.name, new BsonRegularExpression(name, "i"));
            }
            if (!string.IsNullOrEmpty(difficulty))
            {
                filter &= Builders<Trip>.Filter.Eq(x => x.difficulty, difficulty);
            }

            var result = await trips.Find(filter).ToListAsync();

            if (result == null)
            {
                return new List<Trip>(0);
            }
            else
            {
                return result;
            }
        }

        public async Task<bool> deleteTripAsync(string id)
        {
            var result = await trips.DeleteOneAsync(x => x.id == id);
            return result.DeletedCount > 0;
        }
    }
}
