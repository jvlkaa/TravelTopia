using backend_app.Dto;
using backend_app.Models;
using DnsClient.Protocol;
using GeoCoordinatePortable;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using System.Net;
using Route = backend_app.Models.Route;

namespace backend_app.Services
{
    public class RouteService
    {
        private readonly IMongoCollection<Route> routes;

        public RouteService(IOptions<TravelTopiaDatabaseConfiguration> options) {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            var travelTopiaDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
            this.routes = travelTopiaDatabase.GetCollection<Route>(options.Value.RouteCollectionName);
        }

        public async Task<List<Route>> GetRoutesAsync()
        {
            var foundRoutes = await routes.Find(route => route.userCreated == false).ToListAsync();

            if (foundRoutes.Count == 0)
            {
                return new List<Route>(0);
            }
            else
            {
                return foundRoutes;
            }
        }

        public async Task<List<RouteListElement>> GetListElementRoutesAsync()
        {
            var foundRoutes = await routes.Find(route => route.userCreated == false).ToListAsync();

            if (foundRoutes.Count == 0)
            {
                return new List<RouteListElement>(0);
            }
            else
            {
                var routesList = new List<RouteListElement>();

                foundRoutes.ForEach(route =>
                {
                    routesList.Add(new RouteListElement
                    {
                        id = route.id,
                        name = route.name
                    });
                });

                return routesList;
            }
        } 

        public async Task<Route> GetRouteAsync(string name)
        {
            var foundRoute = await routes.Find(route => route.name == name).SingleOrDefaultAsync();

            if (foundRoute == null)
            {
                return null;
            }
            else
            {
                return foundRoute;
            }
        }

        public async Task<List<Route>> GetRoutesByStringAsync(string text)
        {
            var foundRoutes = await routes.Find(route => route.name.Contains(text)).ToListAsync();

            if (foundRoutes.Count == 0)
            {
                return new List<Route>(0);
            }
            else
            {
                return foundRoutes;
            }
        }

        public double GetDistance(Point start, Point end)
        {
            var startPoint = new GeoCoordinate(start.latitude, start.longitude);
            var endPoint = new GeoCoordinate(end.latitude, end.longitude);

            var distance = startPoint.GetDistanceTo(endPoint);

            return distance / 1000.0;
        }

        public async Task<List<Route>> GetRoutesByPointAsync(double latitude, double longitude)
        {
            Point point = new Point
            {
                latitude = latitude,
                longitude = longitude
            };

            var allRoutes = await routes.Find(route => route.userCreated == false).ToListAsync();

            var nearRoutes = allRoutes.Where(x =>
            {
                var distance = GetDistance(point, x.routePoints.First());
                return distance < 1.0;
            }).ToList();

            return nearRoutes;
        }

        public async Task<List<Route>> GetUserRoutesByPointAsync(List<string> userRouteIds, double latitude, double longitude)
        {
            Point point = new Point
            {
                latitude = latitude,
                longitude = longitude
            };

            var filter = Builders<Route>.Filter.In(route => route.id, userRouteIds);
            var userRoutes = await routes.Find(filter).ToListAsync();

            var nearRoutes = userRoutes.Where(x =>
            {
                var distance = GetDistance(point, x.routePoints.First());
                return distance < 1.0;
            }).ToList();

            return nearRoutes;
        }

        public async Task<Route> GetRouteByIdAsync(string id)
        {
            var foundRoute = await routes.Find(route => route.id == id).SingleOrDefaultAsync();

            if (foundRoute == null)
            {
                return null;
            }
            else
            {
                return foundRoute;
            }
        }

        public async Task<RouteListElement> GetRouteListElementByIdAsync(string id)
        {
            var foundRoute = await routes.Find(route => route.id == id).SingleOrDefaultAsync();

            if (foundRoute == null)
            {
                return null;
            }
            else
            {
                var routeListElement = new RouteListElement
                {
                    id = foundRoute.id,
                    name = foundRoute.name
                };

                return routeListElement;
            }
        }

        public async Task<List<RouteListElement>> GetFilteredUserRoutesAsync(List<string> userRoutesIds, string name, string type, string difficulty)
        {
            var filter = FilterDefinition<Route>.Empty;

            if (userRoutesIds.Count != 0)
            {
                filter &= Builders<Route>.Filter.In(route => route.id, userRoutesIds);
            }
            if (!string.IsNullOrEmpty(name))
            {
                filter &= Builders<Route>.Filter.Regex(route => route.name, new BsonRegularExpression(name, "i"));
            }
            if (!string.IsNullOrEmpty(type))
            {
                filter &= Builders<Route>.Filter.Eq(route => route.type, type);
            }
            if (!string.IsNullOrEmpty(difficulty))
            {
                filter &= Builders<Route>.Filter.Eq(route => route.difficulty, difficulty);
            }

            var filteredRoutes = await routes.Find(filter).ToListAsync();

            if (filteredRoutes.Count == 0)
            {
                return new List<RouteListElement>(0);
            }
            else
            {
                var filteredRoutesList = new List<RouteListElement>();

                filteredRoutes.ForEach(route =>
                {
                    filteredRoutesList.Add(new RouteListElement
                    {
                        id = route.id,
                        name = route.name
                    });
                });

                return filteredRoutesList;
            }
        }

        public async Task<List<RouteListElement>> GetFilteredRoutesAsync(string name, string type, string difficulty)
        {
            var filter = FilterDefinition<Route>.Empty;
            filter &= Builders<Route>.Filter.Eq(route => route.userCreated, false);

            if (!string.IsNullOrEmpty(name))
            {
                filter &= Builders<Route>.Filter.Regex(route => route.name, new BsonRegularExpression(name, "i"));
            }
            if (!string.IsNullOrEmpty(type))
            {
                filter &= Builders<Route>.Filter.Eq(route => route.type, type);
            }
            if (!string.IsNullOrEmpty(difficulty))
            {
                filter &= Builders<Route>.Filter.Eq(route => route.difficulty, difficulty);
            }

            var filteredRoutes = await routes.Find(filter).ToListAsync();

            if (filteredRoutes.Count == 0)
            {
                return new List<RouteListElement>(0);
            }
            else
            {
                var filteredRoutesList = new List<RouteListElement>();

                filteredRoutes.ForEach(trip =>
                {
                    filteredRoutesList.Add(new RouteListElement
                    {
                        id = trip.id,
                        name = trip.name
                    });
                });

                return filteredRoutesList;
            }
        }
 
        public async Task CreateRouteAsync(Route route)
        {
            await routes.InsertOneAsync(route);
        }

        public async Task<bool> replaceRouteAsync(string id, Route route)
        {
            var replaced = await routes.ReplaceOneAsync(oldRoute => oldRoute.id == id, route);

            return replaced.ModifiedCount > 0;
        } 

        public async Task<bool> deleteRouteAsync(string id)
        {
            var deleted = await routes.DeleteOneAsync(route => route.id == id);

            return deleted.DeletedCount > 0;
        }

        public async Task<bool> addUserRoute(AddUserRoute route)
        {
            Route newRoute = new Route
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

            if (await GetRouteAsync(newRoute.name) == null)
            {
                await CreateRouteAsync(newRoute);
                return true;
            }

            return false;
        }
    }
}
