using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace backend_app.Models
{
    public class Route
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? id { get; set; }

        [BsonElement("userCreated")]
        public bool userCreated { get; set; }

        [BsonElement("name")]
        public string name { get; set; }

        [BsonElement("type")]
        public string type { get; set; }

        [BsonElement("equipment")]
        public string equipment { get; set; }

        [BsonElement("difficulty")]
        public string difficulty {  get; set; }

        [BsonElement("description")]
        public string description { get; set; }

        [BsonElement("points")]
        public ICollection<Point> routePoints { get; set; } = new List<Point>();
    }
}
