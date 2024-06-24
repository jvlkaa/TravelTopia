using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace backend_app.Models
{
    public class Route
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? id { get; set; }

        [BsonElement("name")]
        public string name { get; set; }

        [BsonElement("points")]
        public ICollection<Point> routePoints { get; set; } = new List<Point>();
    }
}
