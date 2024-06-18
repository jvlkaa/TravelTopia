using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend_app.Models
{
    public class Point
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? id { get; set; }

        [BsonElement("latitude")]
        public double latidute { get; set; }

        [BsonElement("longitude")]
        public double longitude { get; set; }
    }
}
