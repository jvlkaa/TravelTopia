using backend_app.Dto;
using backend_app.Models;
using DnsClient.Protocol;
using GeoCoordinatePortable;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
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

        public double GetDistance(Point start, Point end)
        {
            var startPoint = new GeoCoordinate(start.latitude, start.longitude);
            var endPoint = new GeoCoordinate(end.latitude, end.longitude);

            var distance = startPoint.GetDistanceTo(endPoint);

            return distance / 1000.0;
        }

        public async Task<List<Models.Route>> GetRoutesByPointAsync(double latitude, double longitude)
        {
            Point point = new Point
            {
                latitude = latitude,
                longitude = longitude
            };

            var allRoutes = await GetRoutesAsync();

            var result = allRoutes.Where(x =>
            {
                var distance = GetDistance(point, x.routePoints.First());
                return distance < 1.0;
            }).ToList();

            return result;
        }

        public async Task<List<Models.Route>> GetUserRoutesByPointAsync(List<string> userRouteIds, double latitude, double longitude)
        {
            Point point = new Point
            {
                latitude = latitude,
                longitude = longitude
            };

            var filter = Builders<Models.Route>.Filter.In(x => x.id, userRouteIds);
            var userRoutes = await routes.Find(filter).ToListAsync();

            var result = userRoutes.Where(x =>
            {
                var distance = GetDistance(point, x.routePoints.First());
                return distance < 1.0;
            }).ToList();

            return result;
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

        public async Task<List<Models.Route>> GetFilteredUserRoutesAsync(List<string> userRoutesIds, string name, string type, string difficulty)
        {
            var filter = FilterDefinition<Models.Route>.Empty;

            if (userRoutesIds.Count != 0)
            {
                filter &= Builders<Models.Route>.Filter.In(x => x.id, userRoutesIds);
            }
            if (!string.IsNullOrEmpty(name))
            {
                filter &= Builders<Models.Route>.Filter.Regex(x => x.name, new BsonRegularExpression(name, "i"));
            }
            if (!string.IsNullOrEmpty(type))
            {
                filter &= Builders<Models.Route>.Filter.Eq(x => x.type, type);
            }
            if (!string.IsNullOrEmpty(difficulty))
            {
                filter &= Builders<Models.Route>.Filter.Eq(x => x.difficulty, difficulty);
            }

            var result = await routes.Find(filter).ToListAsync();

            if (result == null)
            {
                return new List<Models.Route>(0);
            }
            else
            {
                return result;
            }
        }

        public async Task<List<Models.Route>> GetFilteredRoutesAsync(string name, string type, string difficulty)
        {
            var filter = FilterDefinition<Models.Route>.Empty;
            filter &= Builders<Models.Route>.Filter.Eq(x => x.userCreated, false);

            if (!string.IsNullOrEmpty(name))
            {
                filter &= Builders<Models.Route>.Filter.Regex(x => x.name, new BsonRegularExpression(name, "i"));
            }
            if (!string.IsNullOrEmpty(type))
            {
                filter &= Builders<Models.Route>.Filter.Eq(x => x.type, type);
            }
            if (!string.IsNullOrEmpty(difficulty))
            {
                filter &= Builders<Models.Route>.Filter.Eq(x => x.difficulty, difficulty);
            }

            var result = await routes.Find(filter).ToListAsync();

            if (result == null)
            {
                return new List<Models.Route>(0);
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
                type = route.type,
                equipment = route.equipment,
                difficulty = route.difficulty,
                description = route.description,
                time = route.time
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
