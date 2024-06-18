using backend_app.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace backend_app.Services
{
    public class PointService
    {
        private readonly IMongoCollection<Point> mongoCollection;

        public PointService (IOptions<TravelTopiaDatabaseConfiguration> options)
        {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            var travelTopiaDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
            this.mongoCollection = travelTopiaDatabase.GetCollection<Point>(options.Value.TravelTopiaCollectionName);
        }

        public async Task<List<Point>> GetPointsAsync() => await mongoCollection.Find(_ => true).ToListAsync();

        public async Task CreatePointAsync(Point point) => await mongoCollection.InsertOneAsync(point);

        public async Task<bool> replacePointAsync(string id, Point point)
        {
            var result = await mongoCollection.ReplaceOneAsync(x => x.id == id, point);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> deletePointAsync(string id)
        {
            var result = await mongoCollection.DeleteOneAsync(x => x.id == id);
            return result.DeletedCount > 0;
        }
    }
}
