using backend_app.Dto;
using backend_app.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Net;
using System.Reflection.Metadata.Ecma335;

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

        public async Task CreateTripAsync(Trip trip)
        {
            await trips.InsertOneAsync(trip);
        }

        public async Task<Trip> GetTripAsync(string name)
        {
            var foundTrip = await trips.Find(trip => trip.name == name).SingleOrDefaultAsync();

            if(foundTrip == null)
            {
                return null;
            }
            else
            {
                return foundTrip;
            }
        }

        public async Task<string> AddUserTripAsync(AddUserTrip trip)
        {
            Trip newTrip = new Trip
            {
                name = trip.name,
                userCreated = trip.userCreated,
                description = trip.description,
                difficulty = trip.difficulty,
                routes = trip.routes
            };

            await CreateTripAsync(newTrip);

            return newTrip.id;
        }

        public async Task<List<TripListElement>> GetTripsAsync()
        {
            var foundTrips = await trips.Find(trip => trip.userCreated == false).ToListAsync();

            if(foundTrips.Count == 0)
            {
                return new List<TripListElement>(0);
            }
            else
            {
                var tripsList = new List<TripListElement>();

                foundTrips.ForEach(trip =>
                {
                    tripsList.Add(new TripListElement
                    {
                        id = trip.id,
                        name = trip.name
                    });
                });

                return tripsList;
            }
        }

        public async Task<Trip> GetTripByIdAsync(string id)
        {
            var foundTrip = await trips.Find(trip => trip.id == id).SingleOrDefaultAsync();

            if (foundTrip == null)
            {
                return null;
            }
            else
            {
                return foundTrip;
            }
        }

        public async Task<TripListElement> GetTripListElementByIdAsync(string id)
        {
            var foundTrip = await trips.Find(trip => trip.id == id).SingleOrDefaultAsync();

            if (foundTrip == null)
            {
                return null;
            }
            else
            {
                var tripListElement = new TripListElement
                {
                    id = foundTrip.id,
                    name = foundTrip.name
                };

                return tripListElement;
            }
        }

        public async Task<List<TripListElement>> GetFilteredUserTripsAsync(List<string> userTripsIds, string name, string difficulty)
        {
            var filter = FilterDefinition<Trip>.Empty;

            if (userTripsIds.Count != 0)
            {
                filter &= Builders<Trip>.Filter.In(trip => trip.id, userTripsIds);
            }
            if (!string.IsNullOrEmpty(name))
            {
                filter &= Builders<Trip>.Filter.Regex(trip => trip.name, new BsonRegularExpression(name, "i"));
            }
            if (!string.IsNullOrEmpty(difficulty))
            {
                filter &= Builders<Trip>.Filter.Eq(trip => trip.difficulty, difficulty);
            }

            var filteredTrips = await trips.Find(filter).ToListAsync();

            if (filteredTrips == null)
            {
                return new List<TripListElement>(0);
            }
            else
            {
                var filteredTripsList = new List<TripListElement>();

                filteredTrips.ForEach(trip =>
                {
                    filteredTripsList.Add(new TripListElement
                    {
                        id = trip.id,
                        name = trip.name
                    });
                });

                return filteredTripsList;
            }
        }

        public async Task<List<TripListElement>> GetFilteredTripsAsync(string name, string difficulty)
        {
            var filter = FilterDefinition<Trip>.Empty;
            filter &= Builders<Trip>.Filter.Eq(trip => trip.userCreated, false);

            if (!string.IsNullOrEmpty(name))
            {
                filter &= Builders<Trip>.Filter.Regex(trip => trip.name, new BsonRegularExpression(name, "i"));
            }
            if (!string.IsNullOrEmpty(difficulty))
            {
                filter &= Builders<Trip>.Filter.Eq(trip => trip.difficulty, difficulty);
            }

            var fiteredTrips = await trips.Find(filter).ToListAsync();

            if (fiteredTrips == null)
            {
                return new List<TripListElement>(0);
            }
            else
            {
                var filteredTripsList = new List<TripListElement>();

                fiteredTrips.ForEach(trip =>
                {
                    filteredTripsList.Add(new TripListElement
                    {
                        id = trip.id,
                        name = trip.name
                    });
                });

                return filteredTripsList;
            }
        }

        public async Task<bool> DeleteTripAsync(string id)
        {
            var deleted = await trips.DeleteOneAsync(trip => trip.id == id);
            return deleted.DeletedCount > 0;
        }
    }
}
