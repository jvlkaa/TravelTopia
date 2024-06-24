using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend_app.Models
{
    public class Point
    {
        [BsonElement("latitude")]
        public double latitude { get; set; }

        [BsonElement("longitude")]
        public double longitude { get; set; }
    }
}
